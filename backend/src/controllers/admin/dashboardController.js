import { Collaborator, Job, JobApplication, PaymentRequest } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { JOB_APPLICATION_STATUS } from '../../constants/jobApplicationStatus.js';

// Trạng thái đơn tiến cử: success (category 'success') vs failed (rejected + cancelled)
const STATUS_SUCCESS = Object.entries(JOB_APPLICATION_STATUS)
  .filter(([, v]) => v.category === 'success')
  .map(([k]) => parseInt(k, 10));
const STATUS_FAILED = Object.entries(JOB_APPLICATION_STATUS)
  .filter(([, v]) => v.category === 'rejected' || v.category === 'cancelled')
  .map(([k]) => parseInt(k, 10));

/**
 * Thống kê dashboard admin: CTV, Jobs, Ứng tuyển, Yêu cầu thanh toán, Đơn thành công/thất bại
 * GET /api/admin/dashboard
 */
export const dashboardController = {
  getDashboard: async (req, res) => {
    try {
      const [
        collaboratorsTotal,
        collaboratorsActive,
        jobsTotal,
        jobsPublished,
        applicationsTotal,
        applicationsApproved,
        paymentTotal,
        paymentPaid,
        nominationSuccess,
        nominationFailed
      ] = await Promise.all([
        Collaborator.count(),
        Collaborator.count({ where: { status: 1 } }),
        Job.count(),
        Job.count({ where: { status: 1 } }),
        JobApplication.count(),
        JobApplication.count({
          where: {
            status: {
              [Op.notIn]: [1, 4, 6, 10, 13, 16]
            }
          }
        }),
        PaymentRequest.count(),
        PaymentRequest.count({ where: { status: 3 } }),
        STATUS_SUCCESS.length
          ? JobApplication.count({ where: { status: { [Op.in]: STATUS_SUCCESS } } })
          : 0,
        STATUS_FAILED.length
          ? JobApplication.count({ where: { status: { [Op.in]: STATUS_FAILED } } })
          : 0
      ]);

      return res.json({
        success: true,
        data: {
          collaborators: { total: collaboratorsTotal, active: collaboratorsActive },
          jobs: { total: jobsTotal, published: jobsPublished },
          applications: { total: applicationsTotal, approved: applicationsApproved },
          paymentRequests: { total: paymentTotal, paid: paymentPaid },
          nominationStats: { success: nominationSuccess, failed: nominationFailed }
        }
      });
    } catch (err) {
      console.error('Dashboard getDashboard error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi khi tải thống kê dashboard'
      });
    }
  },

  /**
   * Đơn tiến cử thành công/thất bại theo tháng (cho biểu đồ line)
   * GET /api/admin/dashboard/nomination-over-time?months=6
   * hoặc ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  getNominationOverTime: async (req, res) => {
    try {
      const { startDate: startParam, endDate: endParam, months: monthsParam } = req.query;

      let monthStarts = [];

      if (startParam && endParam) {
        const start = new Date(startParam);
        const end = new Date(endParam);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
          return res.status(400).json({
            success: false,
            message: 'startDate và endDate không hợp lệ'
          });
        }
        const rangeStart = new Date(start.getFullYear(), start.getMonth(), 1);
        const rangeEnd = new Date(end.getFullYear(), end.getMonth(), 1);
        const maxMonths = 12;
        let d = new Date(rangeStart);
        while (d <= rangeEnd && monthStarts.length < maxMonths) {
          monthStarts.push(new Date(d));
          d.setMonth(d.getMonth() + 1);
        }
      } else {
        const monthsCount = Math.min(12, Math.max(3, parseInt(monthsParam, 10) || 6));
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - monthsCount + 1, 1);
        for (let i = 0; i < monthsCount; i++) {
          monthStarts.push(new Date(start.getFullYear(), start.getMonth() + i, 1));
        }
      }

      const months = [];
      const successData = [];
      const failedData = [];

      for (let i = 0; i < monthStarts.length; i++) {
        const d = monthStarts[i];
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        months.push(`${d.getMonth() + 1}/${d.getFullYear()}`);

        const colCreated = sequelize.col('JobApplication.created_at');
        const [success, failed] = await Promise.all([
          STATUS_SUCCESS.length
            ? JobApplication.count({
                where: {
                  status: { [Op.in]: STATUS_SUCCESS },
                  [Op.and]: [
                    sequelize.where(colCreated, Op.gte, d),
                    sequelize.where(colCreated, Op.lt, next)
                  ]
                }
              })
            : 0,
          STATUS_FAILED.length
            ? JobApplication.count({
                where: {
                  status: { [Op.in]: STATUS_FAILED },
                  [Op.and]: [
                    sequelize.where(colCreated, Op.gte, d),
                    sequelize.where(colCreated, Op.lt, next)
                  ]
                }
              })
            : 0
        ]);
        successData.push(success);
        failedData.push(failed);
      }

      return res.json({
        success: true,
        data: {
          months,
          successData,
          failedData
        }
      });
    } catch (err) {
      console.error('Dashboard getNominationOverTime error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi khi tải dữ liệu đơn theo tháng'
      });
    }
  },

  /**
   * Thống kê jobs (hot jobs, jobs có nhiều ứng tuyển) – dùng cho dashboard session 3/4
   * GET /api/admin/dashboard/job-statistics
   */
  getJobStatistics: async (req, res) => {
    try {
      const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

      const hotJobs = await Job.findAll({
        where: { isHot: true },
        attributes: ['id', 'title', 'jobCode'],
        order: [[sequelize.literal('jobs.updated_at DESC')]],
        limit
      });

      const list = hotJobs.map((j) => j.toJSON());
      return res.json({
        success: true,
        data: {
          hotJobs: list,
          jobsWithMostApplications: list
        }
      });
    } catch (err) {
      console.error('Dashboard getJobStatistics error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Lỗi khi tải thống kê jobs'
      });
    }
  }
};
