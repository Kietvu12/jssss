import {
  JobApplication,
  Job,
  CVStorage,
  Collaborator,
  Admin,
  Company,
  JobCategory,
  PaymentRequest,
  JobRecruitingCompany,
  sequelize
} from '../../models/index.js';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

/**
 * Reports Controller - Statistics and Analytics
 */
export const reportsController = {
  /**
   * Get nomination effectiveness statistics (Super Admin)
   * GET /api/admin/reports/nomination-effectiveness
   */
  getNominationEffectiveness: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      const whereClause = {};
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }

      // Total revenue from nominations
      const totalRevenue = await PaymentRequest.sum('amount', {
        where: {
          status: 11, // Đã thanh toán
          ...(startDate || endDate ? {
            created_at: {
              ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
              ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
            }
          } : {})
        }
      }) || 0;

      // Applications by status
      const applicationsByStatus = await JobApplication.findAll({
        where: whereClause,
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // CV effectiveness (CVs that led to successful applications)
      const successfulApplications = await JobApplication.findAll({
        where: {
          status: { [Op.in]: [8, 11] },
          cv_code: { [Op.not]: null },
          ...(startDate || endDate ? {
            created_at: {
              ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
              ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
            }
          } : {})
        },
        attributes: ['cv_code'],
        raw: true
      });
      
      // Get distinct CV codes
      const effectiveCVCodes = [...new Set(successfulApplications.map(app => app.cv_code).filter(Boolean))];
      
      const effectiveCVs = await CVStorage.count({
        where: {
          isDuplicate: false,
          code: { [Op.in]: effectiveCVCodes },
          ...(startDate || endDate ? {
            created_at: {
              ...(startDate ? { [Op.gte]: new Date(startDate) } : {}),
              ...(endDate ? { [Op.lte]: new Date(endDate) } : {})
            }
          } : {})
        }
      });

      // Job effectiveness - Use raw query to avoid Sequelize subquery issues
      const whereCondition = startDate || endDate 
        ? `WHERE j.created_at >= :startDate AND j.created_at <= :endDate AND j.deleted_at IS NULL`
        : `WHERE j.deleted_at IS NULL`;
      
      const jobEffectiveness = await sequelize.query(`
        SELECT 
          j.id,
          j.title,
          j.title_en AS titleEn,
          j.title_jp AS titleJp,
          j.job_code AS jobCode,
          COUNT(ja.id) AS totalApplications,
          SUM(CASE WHEN ja.status = 8 THEN 1 ELSE 0 END) AS nyushaCount,
          SUM(CASE WHEN ja.status = 11 THEN 1 ELSE 0 END) AS paidCount
        FROM jobs j
        LEFT JOIN job_applications ja ON j.id = ja.job_id AND ja.deleted_at IS NULL
        ${whereCondition}
        GROUP BY j.id, j.title, j.title_en, j.title_jp, j.job_code
        ORDER BY totalApplications DESC
        LIMIT 20
      `, {
        replacements: {
          startDate: startDate || '1970-01-01',
          endDate: endDate || new Date().toISOString()
        },
        type: Sequelize.QueryTypes.SELECT
      });

      // Job category distribution (include multilingual name for frontend)
      const categoryDistribution = await JobCategory.findAll({
        attributes: [
          'id',
          'name',
          'nameEn',
          'nameJp',
          [Sequelize.fn('COUNT', Sequelize.col('jobs.applications.id')), 'applicationCount']
        ],
        include: [{
          model: Job,
          as: 'jobs',
          required: false,
          attributes: [],
          include: [{
            model: JobApplication,
            as: 'applications',
            required: false,
            attributes: [],
            where: whereClause
          }]
        }],
        group: [Sequelize.col('JobCategory.id'), Sequelize.col('JobCategory.name'), Sequelize.col('JobCategory.name_en'), Sequelize.col('JobCategory.name_jp')],
        order: [[Sequelize.literal('applicationCount'), 'DESC']]
      });

      res.json({
        success: true,
        data: {
          totalRevenue,
          applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
          }, {}),
          effectiveCVs,
          jobEffectiveness: jobEffectiveness.map(job => ({
            id: job.id,
            title: job.title,
            titleEn: job.titleEn,
            titleJp: job.titleJp,
            jobCode: job.jobCode,
            totalApplications: parseInt(job.totalApplications || 0),
            nyushaCount: parseInt(job.nyushaCount || 0),
            paidCount: parseInt(job.paidCount || 0)
          })),
          categoryDistribution: categoryDistribution.map(cat => ({
            id: cat.id,
            name: cat.name,
            nameEn: cat.nameEn,
            nameJp: cat.nameJp,
            applicationCount: parseInt(cat.dataValues.applicationCount || 0)
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get platform operation effectiveness (Super Admin)
   * GET /api/admin/reports/platform-effectiveness
   */
  getPlatformEffectiveness: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      const whereClause = {};
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }

      // Total collaborators
      const totalCollaborators = await Collaborator.count({
        where: whereClause
      });

      // New jobs
      const newJobs = await Job.count({
        where: whereClause
      });

      // Note: Page views, clicks, registrations would need separate tracking tables
      // For now, we'll use placeholder data structure

      res.json({
        success: true,
        data: {
          totalCollaborators,
          newJobs,
          // Placeholder for future implementation
          pageViews: 0,
          landingPageClicks: 0,
          registrations: 0,
          aiMatchingEffectiveness: {
            totalMatches: 0,
            successfulMatches: 0,
            successRate: 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get HR management effectiveness (Super Admin)
   * GET /api/admin/reports/hr-effectiveness
   */
  getHREffectiveness: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      const whereClause = {};
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }

      // Admin performance
      const adminPerformance = await Admin.findAll({
        attributes: [
          'id',
          'name',
          'email',
          'role',
          [Sequelize.fn('COUNT', Sequelize.col('responsibleJobApplications.id')), 'totalAssigned'],
          [Sequelize.literal(`SUM(CASE WHEN responsibleJobApplications.status IN (8, 11) THEN 1 ELSE 0 END)`), 'successfulApplications']
        ],
        include: [{
          model: JobApplication,
          as: 'responsibleJobApplications',
          required: false,
          attributes: [],
          where: whereClause
        }],
        group: ['Admin.id'],
        order: [[Sequelize.literal('totalAssigned'), 'DESC']]
      });

      // Average applications per admin per day
      const dateRange = startDate && endDate 
        ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        : 30; // Default 30 days

      const avgApplicationsPerDay = adminPerformance.map(admin => ({
        adminId: admin.id,
        adminName: admin.name,
        totalAssigned: parseInt(admin.dataValues.totalAssigned || 0),
        avgPerDay: (parseInt(admin.dataValues.totalAssigned || 0) / dateRange).toFixed(2)
      }));

      // Super Admin assignment stats
      const totalAssignments = await JobApplication.count({
        where: {
          ...whereClause,
          admin_id: { [Op.not]: null }
        }
      });

      const uniqueAdminsResult = await JobApplication.findAll({
        where: {
          ...whereClause,
          admin_id: { [Op.not]: null },
          admin_responsible_id: { [Op.not]: null }
        },
        attributes: ['admin_responsible_id'],
        raw: true
      });
      
      const uniqueAdmins = [...new Set(uniqueAdminsResult.map(item => item.admin_responsible_id).filter(Boolean))].length;
      
      const superAdminAssignments = {
        totalAssignments,
        uniqueAdmins
      };

      res.json({
        success: true,
        data: {
          adminPerformance: adminPerformance.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            totalAssigned: parseInt(admin.dataValues.totalAssigned || 0),
            successfulApplications: parseInt(admin.dataValues.successfulApplications || 0)
          })),
          avgApplicationsPerDay,
          superAdminAssignments: {
            totalAssignments,
            uniqueAdmins
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get admin's own performance report (Regular Admin)
   * GET /api/admin/reports/my-performance
   */
  getMyPerformance: async (req, res, next) => {
    try {
      const adminId = req.admin.id;
      const { startDate, endDate, status } = req.query;
      
      const whereClause = {
        adminResponsibleId: adminId
      };
      
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[Op.lte] = new Date(endDate);
      }

      if (status) {
        whereClause.status = parseInt(status);
      }

      // Total revenue
      const totalRevenue = await PaymentRequest.sum('amount', {
        include: [{
          model: JobApplication,
          as: 'jobApplication',
          where: whereClause,
          required: true
        }],
        where: {
          status: 11 // Đã thanh toán
        }
      }) || 0;

      // Applications by status
      const applicationsByStatus = await JobApplication.findAll({
        where: whereClause,
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Processing speed (average time from created to updated)
      const processingSpeed = await JobApplication.findAll({
        where: whereClause,
        attributes: [
          [Sequelize.fn('AVG', Sequelize.literal(`TIMESTAMPDIFF(HOUR, created_at, updated_at)`)), 'avgHours']
        ],
        raw: true
      });

      // All applications for export
      const allApplications = await JobApplication.findAll({
        where: whereClause,
        include: [{
          model: Job,
          as: 'job',
          required: false,
          attributes: ['id', 'title', 'jobCode']
        }, {
          model: CVStorage,
          as: 'cv',
          required: false,
          attributes: ['id', 'code', 'name']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          totalRevenue,
          applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count);
            return acc;
          }, {}),
          avgProcessingHours: processingSpeed[0]?.avgHours ? parseFloat(processingSpeed[0].avgHours).toFixed(2) : 0,
          totalApplications: allApplications.length,
          applications: allApplications.map(app => ({
            id: app.id,
            jobTitle: app.job?.title,
            jobCode: app.job?.jobCode,
            candidateName: app.cv?.name,
            candidateCode: app.cv?.code,
            status: app.status,
            createdAt: app.created_at,
            updatedAt: app.updated_at
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

