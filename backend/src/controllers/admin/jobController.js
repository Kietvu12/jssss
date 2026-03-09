import {
  Job,
  JobCategory,
  Company,
  WorkingLocation,
  WorkingLocationDetail,
  SalaryRange,
  SalaryRangeDetail,
  OvertimeAllowance,
  OvertimeAllowanceDetail,
  Requirement,
  SmokingPolicy,
  SmokingPolicyDetail,
  WorkingHour,
  WorkingHourDetail,
  Benefit,
  JobPickup,
  JobPickupId,
  Type,
  Value,
  JobValue,
  JobApplication,
  JobCampaign,
  Campaign,
  ActionLog,
  JobRecruitingCompany,
  JobRecruitingCompanyService,
  JobRecruitingCompanyBusinessSector
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { isS3Key, getSignedUrlForFile, buildJdTemplatePdfKey, uploadBufferToS3, s3Enabled, deleteFileFromS3, makeDownloadDisposition } from '../../services/s3Service.js';
import { generateJdPdfBuffer } from '../../services/jdPdfService.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'deadline': 'deadline'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Job Management Controller (Admin)
 */
export const jobController = {
  /**
   * Get list of jobs
   * GET /api/admin/jobs
   */
  getJobs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        jobCategoryId,
        companyId,
        isPinned,
        isHot,
        deadlineFrom,
        deadlineTo,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search by title, job_code, or slug
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { jobCode: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by category
      if (jobCategoryId) {
        where.jobCategoryId = parseInt(jobCategoryId);
      }

      // Filter by company
      if (companyId) {
        where.companyId = parseInt(companyId);
      }

      // Filter by isPinned
      if (isPinned !== undefined) {
        where.isPinned = isPinned === 'true' || isPinned === '1' || isPinned === 1;
      }

      // Filter by isHot
      if (isHot !== undefined) {
        where.isHot = isHot === 'true' || isHot === '1' || isHot === 1;
      }

      // Filter by deadline
      if (deadlineFrom || deadlineTo) {
        where.deadline = {};
        if (deadlineFrom) {
          where.deadline[Op.gte] = deadlineFrom;
        }
        if (deadlineTo) {
          where.deadline[Op.lte] = deadlineTo;
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'title', 'jobCode', 'createdAt', 'updatedAt', 'deadline', 'viewsCount'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']);
      }

      // Đếm riêng để tránh count sai khi include hasMany (requirements, jobValues)
      const count = await Job.count({ where });

      const rows = await Job.findAll({
        where,
        include: [
          {
            model: JobCategory,
            as: 'category',
            required: false,
            attributes: ['id', 'name', 'slug']
          },
          {
            model: Company,
            as: 'company',
            required: false,
            attributes: ['id', 'name', 'companyCode', 'logo']
          },
          {
            model: JobRecruitingCompany,
            as: 'recruitingCompany',
            required: false,
            include: [
              {
                model: JobRecruitingCompanyService,
                as: 'services',
                required: false,
                attributes: ['id', 'serviceName', 'order'],
                order: [['order', 'ASC']]
              },
              {
                model: JobRecruitingCompanyBusinessSector,
                as: 'businessSectors',
                required: false,
                attributes: ['id', 'sectorName', 'order'],
                order: [['order', 'ASC']]
              }
            ]
          },
          {
            model: JobValue,
            as: 'jobValues',
            required: false,
            include: [
              {
                model: Type,
                as: 'type',
                required: false,
                attributes: ['id', 'typename']
              },
              {
                model: Value,
                as: 'valueRef',
                required: false,
                attributes: ['id', 'valuename']
              }
            ]
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false,
            attributes: ['id', 'content', 'type', 'status']
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            attributes: ['id', 'campaignId', 'jobId'],
            paranoid: true,
            include: [
              {
                model: Campaign,
                as: 'campaign',
                required: false,
                attributes: ['id', 'name', 'percent']
              }
            ]
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count for each job
      const jobIds = rows.map(j => j.id);
      if (jobIds.length > 0) {
        const applicationsCounts = await sequelize.query(
          `SELECT job_id, COUNT(*) as count 
           FROM job_applications 
           WHERE job_id IN (${jobIds.join(',')})
           AND deleted_at IS NULL
           GROUP BY job_id`,
          { type: sequelize.QueryTypes.SELECT }
        );

        const countMap = {};
        applicationsCounts.forEach(item => {
          countMap[item.job_id] = parseInt(item.count);
        });

        rows.forEach(job => {
          job.dataValues.applicationsCount = countMap[job.id] || 0;
        });
      } else {
        rows.forEach(job => {
          job.dataValues.applicationsCount = 0;
        });
      }

      const { attachCampaignCommissionToJobs } = await import('../../utils/campaignCommissionHelper.js');
      const plainRows = rows.map(job => {
        const plain = job.toJSON ? job.toJSON() : { ...job };
        plain.applicationsCount = job.dataValues?.applicationsCount ?? 0;
        return plain;
      });
      const jobs = attachCampaignCommissionToJobs(plainRows, true, 1);

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get job by ID
   * GET /api/admin/jobs/:id
   */
  getJobById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id, {
        include: [
          {
            model: JobCategory,
            as: 'category',
            required: false
          },
          {
            model: Company,
            as: 'company',
            required: false
          },
          {
            model: JobRecruitingCompany,
            as: 'recruitingCompany',
            required: false,
            include: [
              {
                model: JobRecruitingCompanyService,
                as: 'services',
                required: false,
                order: [['order', 'ASC']]
              },
              {
                model: JobRecruitingCompanyBusinessSector,
                as: 'businessSectors',
                required: false,
                order: [['order', 'ASC']]
              }
            ]
          },
          {
            model: WorkingLocation,
            as: 'workingLocations',
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false
          },
          {
            model: OvertimeAllowance,
            as: 'overtimeAllowances',
            required: false
          },
          {
            model: OvertimeAllowanceDetail,
            as: 'overtimeAllowanceDetails',
            required: false
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false
          },
          {
            model: SmokingPolicy,
            as: 'smokingPolicies',
            required: false
          },
          {
            model: SmokingPolicyDetail,
            as: 'smokingPolicyDetails',
            required: false
          },
          {
            model: WorkingHour,
            as: 'workingHours',
            required: false
          },
          {
            model: WorkingHourDetail,
            as: 'workingHourDetails',
            required: false
          },
          {
            model: Benefit,
            as: 'benefits',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: JobValue,
            as: 'jobValues',
            required: false,
            include: [
              {
                model: Type,
                as: 'type',
                required: false
              },
              {
                model: Value,
                as: 'valueRef',
                required: false
              }
            ]
          },
          {
            model: JobPickupId,
            as: 'jobPickupIds',
            required: false,
            include: [
              {
                model: JobPickup,
                as: 'pickup',
                required: false
              }
            ]
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            include: [
              {
                model: Campaign,
                as: 'campaign',
                required: false,
                attributes: ['id', 'name', 'status']
              }
            ]
          },
          {
            model: JobApplication,
            as: 'applications',
            required: false,
            attributes: ['id', 'status', 'appliedAt'],
            limit: 10
          }
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      res.json({
        success: true,
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy URL xem/tải file JD hoặc required CV form (S3 signed URL hoặc URL tĩnh)
   * GET /api/admin/jobs/:id/view-url?fileType=jdFile|requiredCvForm&purpose=view|download
   */
  getJobFileUrl: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fileType = 'jdFile', purpose = 'view' } = req.query;

      const job = await Job.findByPk(id, { attributes: ['id', 'jdFile', 'requiredCvForm'] });
      if (!job) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy việc làm' });
      }

      const filePath = fileType === 'requiredCvForm'
        ? (job.requiredCvForm ?? job.get?.('required_cv_form'))
        : (job.jdFile ?? job.get?.('jd_file'));
      if (!filePath) {
        return res.status(404).json({ success: false, message: 'File không tồn tại' });
      }

      if (isS3Key(filePath)) {
        const disposition = purpose === 'download' ? makeDownloadDisposition(path.basename(filePath).replace(/^[a-f0-9-]+_/i, '') || 'download') : null;
        const url = await getSignedUrlForFile(filePath, purpose, disposition);
        if (url) return res.json({ success: true, data: { url } });
        return res.status(503).json({
          success: false,
          message: 'File lưu trên S3. Vui lòng cấu hình AWS S3 trong .env.'
        });
      }

      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return res.json({ success: true, data: { url: filePath } });
      }
      const apiBase = `${req.protocol}://${req.get('host')}`;
      const url = filePath.startsWith('/') ? `${apiBase}${filePath}` : `${apiBase}/${filePath}`;
      res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new job
   * POST /api/admin/jobs
   */
  createJob: async (req, res, next) => {
    try {
      const {
        jobCode,
        jobCategoryId,
        title,
        titleEn,
        titleJp,
        slug,
        description,
        descriptionEn,
        descriptionJp,
        instruction,
        instructionEn,
        instructionJp,
        interviewLocation,
        bonus,
        bonusEn,
        bonusJp,
        salaryReview,
        salaryReviewEn,
        salaryReviewJp,
        holidays,
        holidaysEn,
        holidaysJp,
        socialInsurance,
        socialInsuranceEn,
        socialInsuranceJp,
        transportation,
        transportationEn,
        transportationJp,
        breakTime,
        breakTimeEn,
        breakTimeJp,
        overtime,
        overtimeEn,
        overtimeJp,
        recruitmentType,
        contractPeriod,
        contractPeriodEn,
        contractPeriodJp,
        companyId,
        recruitmentProcess,
        recruitmentProcessEn,
        recruitmentProcessJp,
        highlights,
        deadline,
        status = 1,
        isPinned = false,
        isHot = false,
        jobCommissionType = 'fixed',
        jdFile,
        jdOriginalFilename,
        requiredCvForm,
        requiredCvFormOriginalFilename,
        // Related data
        workingLocations = [],
        workingLocationDetails = [],
        salaryRanges = [],
        salaryRangeDetails = [],
        overtimeAllowances = [],
        overtimeAllowanceDetails = [],
        requirements = [],
        smokingPolicies = [],
        smokingPolicyDetails = [],
        workingHours = [],
        workingHourDetails = [],
        jobValues = [],
        jobPickupIds = [],
        campaignIds = [],
        // Recruiting company data
        recruitingCompany
      } = req.body;

      // Validate required fields
      if (!jobCode || !jobCategoryId || !title || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Mã việc làm, danh mục, tiêu đề và slug là bắt buộc'
        });
      }

      // Check if job_code already exists
      const existingJob = await Job.findOne({ where: { jobCode } });
      if (existingJob) {
        return res.status(409).json({
          success: false,
          message: 'Mã việc làm đã tồn tại'
        });
      }

      // Check if slug already exists
      const existingSlug = await Job.findOne({ where: { slug } });
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: 'Slug đã tồn tại'
        });
      }

      // Validate category
      const category = await JobCategory.findByPk(jobCategoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Danh mục việc làm không tồn tại'
        });
      }

      // Validate company if provided
      if (companyId) {
        const company = await Company.findByPk(companyId);
        if (!company) {
          return res.status(404).json({
            success: false,
            message: 'Công ty không tồn tại'
          });
        }
      }

      // Use transaction for all related data
      const transaction = await sequelize.transaction();

      try {
        // Create job
        const job = await Job.create({
          jobCode,
          jobCategoryId,
          title,
          titleEn: titleEn || null,
          titleJp: titleJp || null,
          slug,
          description,
          descriptionEn: descriptionEn || null,
          descriptionJp: descriptionJp || null,
          instruction,
          instructionEn: instructionEn || null,
          instructionJp: instructionJp || null,
          interviewLocation,
          bonus,
          bonusEn: bonusEn || null,
          bonusJp: bonusJp || null,
          salaryReview,
          salaryReviewEn: salaryReviewEn || null,
          salaryReviewJp: salaryReviewJp || null,
          holidays,
          holidaysEn: holidaysEn || null,
          holidaysJp: holidaysJp || null,
          socialInsurance,
          socialInsuranceEn: socialInsuranceEn || null,
          socialInsuranceJp: socialInsuranceJp || null,
          transportation,
          transportationEn: transportationEn || null,
          transportationJp: transportationJp || null,
          breakTime,
          breakTimeEn: breakTimeEn || null,
          breakTimeJp: breakTimeJp || null,
          overtime,
          overtimeEn: overtimeEn || null,
          overtimeJp: overtimeJp || null,
          recruitmentType,
          contractPeriod,
          contractPeriodEn: contractPeriodEn || null,
          contractPeriodJp: contractPeriodJp || null,
          companyId: companyId || null,
          recruitmentProcess,
          recruitmentProcessEn: recruitmentProcessEn || null,
          recruitmentProcessJp: recruitmentProcessJp || null,
          highlights: highlights || null,
          deadline,
          status,
          isPinned,
          isHot,
          jobCommissionType,
          jdFile: null,
          jdOriginalFilename: null,
          requiredCvForm,
          requiredCvFormOriginalFilename
        }, { transaction });

        // Create working locations
        if (workingLocations.length > 0) {
          await WorkingLocation.bulkCreate(
            workingLocations.map(loc => ({
              jobId: job.id,
              location: loc.location,
              country: loc.country
            })),
            { transaction }
          );
        }

        // Create working location details
        if (workingLocationDetails.length > 0) {
          await WorkingLocationDetail.bulkCreate(
            workingLocationDetails.map(detail => ({
              jobId: job.id,
              content: typeof detail === 'string' ? detail : detail.content || '',
              contentEn: typeof detail === 'object'
                ? (detail.contentEn || detail.content_en || null)
                : null,
              contentJp: typeof detail === 'object'
                ? (detail.contentJp || detail.content_jp || null)
                : null
            })),
            { transaction }
          );
        }

        // Create salary ranges
        if (salaryRanges.length > 0) {
          await SalaryRange.bulkCreate(
            salaryRanges.map(range => ({
              jobId: job.id,
              salaryRange: range.salaryRange,
              type: range.type
            })),
            { transaction }
          );
        }

        // Create salary range details
        if (salaryRangeDetails.length > 0) {
          await SalaryRangeDetail.bulkCreate(
            salaryRangeDetails.map(detail => ({
              jobId: job.id,
              content: typeof detail === 'string' ? detail : detail.content || '',
              contentEn: typeof detail === 'object'
                ? (detail.contentEn || detail.content_en || null)
                : null,
              contentJp: typeof detail === 'object'
                ? (detail.contentJp || detail.content_jp || null)
                : null
            })),
            { transaction }
          );
        }

        // Create overtime allowances
        if (overtimeAllowances.length > 0) {
          await OvertimeAllowance.bulkCreate(
            overtimeAllowances.map(allowance => ({
              jobId: job.id,
              overtimeAllowanceRange: allowance.overtimeAllowanceRange || allowance.range
            })),
            { transaction }
          );
        }

        // Create overtime allowance details
        if (overtimeAllowanceDetails.length > 0) {
          await OvertimeAllowanceDetail.bulkCreate(
            overtimeAllowanceDetails.map(detail => ({
              jobId: job.id,
              content: typeof detail === 'string' ? detail : detail.content || '',
              contentEn: typeof detail === 'object'
                ? (detail.contentEn || detail.content_en || null)
                : null,
              contentJp: typeof detail === 'object'
                ? (detail.contentJp || detail.content_jp || null)
                : null
            })),
            { transaction }
          );
        }

        // Create requirements
        if (requirements.length > 0) {
          await Requirement.bulkCreate(
            requirements.map(req => ({
              jobId: job.id,
              content: req.content,
              contentEn: req.contentEn || req.content_en || null,
              contentJp: req.contentJp || req.content_jp || null,
              type: req.type,
              status: req.status
            })),
            { transaction }
          );
        }

        // Create smoking policies
        if (smokingPolicies.length > 0) {
          await SmokingPolicy.bulkCreate(
            smokingPolicies.map(policy => ({
              jobId: job.id,
              allow: policy.allow
            })),
            { transaction }
          );
        }

        // Create smoking policy details
        if (smokingPolicyDetails.length > 0) {
          await SmokingPolicyDetail.bulkCreate(
            smokingPolicyDetails.map(detail => ({
              jobId: job.id,
              content: typeof detail === 'string' ? detail : detail.content || '',
              contentEn: typeof detail === 'object'
                ? (detail.contentEn || detail.content_en || null)
                : null,
              contentJp: typeof detail === 'object'
                ? (detail.contentJp || detail.content_jp || null)
                : null
            })),
            { transaction }
          );
        }

        // Create working hours
        if (workingHours.length > 0) {
          await WorkingHour.bulkCreate(
            workingHours.map(wh => ({
              jobId: job.id,
              workingHours: wh.workingHours || wh.hours
            })),
            { transaction }
          );
        }

        // Create working hour details
        if (workingHourDetails.length > 0) {
          await WorkingHourDetail.bulkCreate(
            workingHourDetails.map(detail => ({
              jobId: job.id,
              content: typeof detail === 'string' ? detail : detail.content || '',
              contentEn: typeof detail === 'object'
                ? (detail.contentEn || detail.content_en || null)
                : null,
              contentJp: typeof detail === 'object'
                ? (detail.contentJp || detail.content_jp || null)
                : null
            })),
            { transaction }
          );
        }

        // Create job values
        if (jobValues.length > 0) {
          // Validate jobValues: nếu có type là Commission, value phải phù hợp với jobCommissionType
          for (const jv of jobValues) {
            // Kiểm tra nếu có type Commission (cần kiểm tra Type với typename = 'Commission')
            // Note: Cần validate typeId có phải là Commission type không
            // Tạm thời chỉ validate format của value
            if (jv.value) {
              // Nếu jobCommissionType là 'fixed', value phải là số (số tiền)
              // Nếu jobCommissionType là 'percent', value phải là số (phần trăm)
              const valueNum = parseFloat(jv.value);
              if (isNaN(valueNum) || valueNum < 0) {
                await transaction.rollback();
                return res.status(400).json({
                  success: false,
                  message: `Giá trị hoa hồng không hợp lệ. Phải là số dương.`
                });
              }
            }
          }

          await JobValue.bulkCreate(
            jobValues.map(jv => ({
              jobId: job.id,
              typeId: jv.typeId,
              valueId: jv.valueId,
              value: jv.value,
              isRequired: jv.isRequired || false
            })),
            { transaction }
          );
        }

        // Create job pickup ids
        if (jobPickupIds.length > 0) {
          await JobPickupId.bulkCreate(
            jobPickupIds.map(pickup => ({
              jobId: job.id,
              jobPickupId: pickup.jobPickupId || pickup.pickupId
            })),
            { transaction }
          );
        }

        // Create job-campaign associations if campaignIds provided
        if (campaignIds && campaignIds.length > 0) {
          // Validate that all campaignIds exist
          const campaigns = await Campaign.findAll({
            where: { id: { [Op.in]: campaignIds } },
            transaction
          });

          if (campaigns.length !== campaignIds.length) {
            await transaction.rollback();
            return res.status(400).json({
              success: false,
              message: 'Một số chiến dịch không tồn tại'
            });
          }

          // Create JobCampaign records
          await JobCampaign.bulkCreate(
            campaignIds.map(campaignId => ({
              campaignId: parseInt(campaignId),
              jobId: job.id
            })),
            { transaction }
          );
        }

        // Create recruiting company if provided
        if (recruitingCompany) {
          const recruitingCompanyData = {
            jobId: job.id,
            companyName: recruitingCompany.companyName || null,
            revenue: recruitingCompany.revenue || null,
            numberOfEmployees: recruitingCompany.numberOfEmployees || null,
            headquarters: recruitingCompany.headquarters || null,
            headquartersEn: recruitingCompany.headquartersEn || null,
            headquartersJp: recruitingCompany.headquartersJp || null,
            companyIntroduction: recruitingCompany.companyIntroduction || null,
            companyIntroductionEn: recruitingCompany.companyIntroductionEn || null,
            companyIntroductionJp: recruitingCompany.companyIntroductionJp || null,
            stockExchangeInfo: recruitingCompany.stockExchangeInfo || null,
            investmentCapital: recruitingCompany.investmentCapital || null,
            establishedDate: recruitingCompany.establishedDate || null
          };

          const createdRecruitingCompany = await JobRecruitingCompany.create(
            recruitingCompanyData,
            { transaction }
          );

          // Create services if provided
          if (recruitingCompany.services && Array.isArray(recruitingCompany.services) && recruitingCompany.services.length > 0) {
            await JobRecruitingCompanyService.bulkCreate(
              recruitingCompany.services.map((service, index) => ({
                jobRecruitingCompanyId: createdRecruitingCompany.id,
                serviceName: typeof service === 'string' ? service : service.serviceName || service.name,
                serviceNameEn: typeof service === 'object' ? (service.serviceNameEn || null) : null,
                serviceNameJp: typeof service === 'object' ? (service.serviceNameJp || null) : null,
                order: typeof service === 'object' && service.order !== undefined ? service.order : index
              })),
              { transaction }
            );
          }

          // Create business sectors if provided
          if (recruitingCompany.businessSectors && Array.isArray(recruitingCompany.businessSectors) && recruitingCompany.businessSectors.length > 0) {
            await JobRecruitingCompanyBusinessSector.bulkCreate(
              recruitingCompany.businessSectors.map((sector, index) => ({
                jobRecruitingCompanyId: createdRecruitingCompany.id,
                sectorName: typeof sector === 'string' ? sector : sector.sectorName || sector.name,
                sectorNameEn: typeof sector === 'object' ? (sector.sectorNameEn || null) : null,
                sectorNameJp: typeof sector === 'object' ? (sector.sectorNameJp || null) : null,
                order: typeof sector === 'object' && sector.order !== undefined ? sector.order : index
              })),
              { transaction }
            );
          }
        }

        await transaction.commit();

        // Reload with all relations
        await job.reload({
          include: [
            {
              model: JobCategory,
              as: 'category',
              required: false
            },
            {
              model: Company,
              as: 'company',
              required: false
            },
            {
              model: JobRecruitingCompany,
              as: 'recruitingCompany',
              required: false,
              include: [
                {
                  model: JobRecruitingCompanyService,
                  as: 'services',
                  required: false,
                  order: [['order', 'ASC']]
                },
                {
                  model: JobRecruitingCompanyBusinessSector,
                  as: 'businessSectors',
                  required: false,
                  order: [['order', 'ASC']]
                }
              ]
            },
            {
              model: WorkingLocation,
              as: 'workingLocations',
              required: false
            },
            {
              model: SalaryRange,
              as: 'salaryRanges',
              required: false
            },
            {
              model: Requirement,
              as: 'requirements',
              required: false
            },
            {
              model: WorkingLocationDetail,
              as: 'workingLocationDetails',
              required: false
            },
            {
              model: SalaryRangeDetail,
              as: 'salaryRangeDetails',
              required: false
            },
            {
              model: OvertimeAllowance,
              as: 'overtimeAllowances',
              required: false
            },
            {
              model: OvertimeAllowanceDetail,
              as: 'overtimeAllowanceDetails',
              required: false
            },
            {
              model: WorkingHour,
              as: 'workingHours',
              required: false
            },
            {
              model: JobValue,
              as: 'jobValues',
              required: false,
              include: [
                { model: Type, as: 'type', required: false },
                { model: Value, as: 'valueRef', required: false }
              ]
            }
          ]
        });

        // Generate JD template PDF, upload to S3 (jsshare/job_descriptions/{id}/jd-template.pdf), save path to jdFile
        try {
          const pdfBuffer = await generateJdPdfBuffer(job);
          if (pdfBuffer) {
            if (s3Enabled()) {
              const s3Key = buildJdTemplatePdfKey(job.id);
              await uploadBufferToS3(pdfBuffer, s3Key, 'application/pdf');
              job.jdFile = s3Key;
              await job.save();
            } else {
              const uploadDir = path.join(path.dirname(path.dirname(path.dirname(__dirname))), 'uploads');
              const jdFolder = path.join(uploadDir, 'job_descriptions', String(job.id));
              await fs.mkdir(jdFolder, { recursive: true });
              const pdfPath = path.join(jdFolder, 'jd-template.pdf');
              await fs.writeFile(pdfPath, pdfBuffer);
              job.jdFile = path.relative(path.join(__dirname, '../../../'), pdfPath);
              await job.save();
            }
            await job.reload({ include: [{ model: JobCategory, as: 'category', required: false }, { model: Company, as: 'company', required: false }, { model: JobRecruitingCompany, as: 'recruitingCompany', required: false, include: [{ model: JobRecruitingCompanyService, as: 'services', required: false }, { model: JobRecruitingCompanyBusinessSector, as: 'businessSectors', required: false }] }] });
          }
        } catch (pdfErr) {
          console.warn('[Admin createJob] Không thể tạo JD template PDF:', pdfErr.message);
        }

        // Log action
        await ActionLog.create({
          adminId: req.admin.id,
          object: 'Job',
          action: 'create',
          ip: req.ip || req.connection.remoteAddress,
          after: job.toJSON(),
          description: `Tạo mới việc làm: ${job.title} (${job.jobCode})`
        });

        res.status(201).json({
          success: true,
          message: 'Tạo việc làm thành công',
          data: { job }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job
   * PUT /api/admin/jobs/:id
   */
  updateJob: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      // Store old data for log
      const oldData = job.toJSON();

      // Extract related data from updateData
      const {
        workingLocations,
        workingLocationDetails,
        salaryRanges,
        salaryRangeDetails,
        overtimeAllowances,
        overtimeAllowanceDetails,
        requirements,
        smokingPolicies,
        smokingPolicyDetails,
        workingHours,
        workingHourDetails,
        jobValues,
        jobPickupIds,
        campaignIds,
        recruitingCompany,
        ...jobFields
      } = updateData;

      // Use transaction
      const transaction = await sequelize.transaction();

      try {
        // Update basic job fields
        if (jobFields.jobCode !== undefined) {
          // Check if job_code is already taken by another job
          const existingJob = await Job.findOne({
            where: { jobCode: jobFields.jobCode, id: { [Op.ne]: id } }
          });
          if (existingJob) {
            await transaction.rollback();
            return res.status(409).json({
              success: false,
              message: 'Mã việc làm đã tồn tại'
            });
          }
        }

        if (jobFields.slug !== undefined) {
          // Check if slug is already taken by another job
          const existingSlug = await Job.findOne({
            where: { slug: jobFields.slug, id: { [Op.ne]: id } }
          });
          if (existingSlug) {
            await transaction.rollback();
            return res.status(409).json({
              success: false,
              message: 'Slug đã tồn tại'
            });
          }
        }

        // jdFile được set từ JD template PDF generated, không dùng từ body
        delete jobFields.jdFile;
        delete jobFields.jdOriginalFilename;

        // Update job fields
        Object.keys(jobFields).forEach(key => {
          if (jobFields[key] !== undefined) {
            job[key] = jobFields[key];
          }
        });

        await job.save({ transaction });

        // Update related data if provided
        if (workingLocations !== undefined) {
          await WorkingLocation.destroy({ where: { jobId: job.id }, transaction });
          if (workingLocations.length > 0) {
            await WorkingLocation.bulkCreate(
              workingLocations.map(loc => ({
                jobId: job.id,
                location: loc.location,
                country: loc.country
              })),
              { transaction }
            );
          }
        }

        if (workingLocationDetails !== undefined) {
          await WorkingLocationDetail.destroy({ where: { jobId: job.id }, transaction });
          if (workingLocationDetails.length > 0) {
            await WorkingLocationDetail.bulkCreate(
              workingLocationDetails.map(detail => ({
                jobId: job.id,
                content: typeof detail === 'string' ? detail : detail.content || '',
                contentEn: typeof detail === 'object'
                  ? (detail.contentEn || detail.content_en || null)
                  : null,
                contentJp: typeof detail === 'object'
                  ? (detail.contentJp || detail.content_jp || null)
                  : null
              })),
              { transaction }
            );
          }
        }

        if (salaryRanges !== undefined) {
          await SalaryRange.destroy({ where: { jobId: job.id }, transaction });
          if (salaryRanges.length > 0) {
            await SalaryRange.bulkCreate(
              salaryRanges.map(range => ({
                jobId: job.id,
                salaryRange: range.salaryRange,
                type: range.type
              })),
              { transaction }
            );
          }
        }

        if (salaryRangeDetails !== undefined) {
          await SalaryRangeDetail.destroy({ where: { jobId: job.id }, transaction });
          if (salaryRangeDetails.length > 0) {
            await SalaryRangeDetail.bulkCreate(
              salaryRangeDetails.map(detail => ({
                jobId: job.id,
                content: typeof detail === 'string' ? detail : detail.content || '',
                contentEn: typeof detail === 'object'
                  ? (detail.contentEn || detail.content_en || null)
                  : null,
                contentJp: typeof detail === 'object'
                  ? (detail.contentJp || detail.content_jp || null)
                  : null
              })),
              { transaction }
            );
          }
        }

        if (overtimeAllowances !== undefined) {
          await OvertimeAllowance.destroy({ where: { jobId: job.id }, transaction });
          if (overtimeAllowances.length > 0) {
            await OvertimeAllowance.bulkCreate(
              overtimeAllowances.map(allowance => ({
                jobId: job.id,
                overtimeAllowanceRange: allowance.overtimeAllowanceRange || allowance.range
              })),
              { transaction }
            );
          }
        }

        if (overtimeAllowanceDetails !== undefined) {
          await OvertimeAllowanceDetail.destroy({ where: { jobId: job.id }, transaction });
          if (overtimeAllowanceDetails.length > 0) {
            await OvertimeAllowanceDetail.bulkCreate(
              overtimeAllowanceDetails.map(detail => ({
                jobId: job.id,
                content: typeof detail === 'string' ? detail : detail.content || '',
                contentEn: typeof detail === 'object'
                  ? (detail.contentEn || detail.content_en || null)
                  : null,
                contentJp: typeof detail === 'object'
                  ? (detail.contentJp || detail.content_jp || null)
                  : null
              })),
              { transaction }
            );
          }
        }

        if (requirements !== undefined) {
          await Requirement.destroy({ where: { jobId: job.id }, transaction });
          if (requirements.length > 0) {
            await Requirement.bulkCreate(
              requirements.map(req => ({
                jobId: job.id,
                content: req.content,
                contentEn: req.contentEn || req.content_en || null,
                contentJp: req.contentJp || req.content_jp || null,
                type: req.type,
                status: req.status
              })),
              { transaction }
            );
          }
        }

        if (smokingPolicies !== undefined) {
          await SmokingPolicy.destroy({ where: { jobId: job.id }, transaction });
          if (smokingPolicies.length > 0) {
            await SmokingPolicy.bulkCreate(
              smokingPolicies.map(policy => ({
                jobId: job.id,
                allow: policy.allow
              })),
              { transaction }
            );
          }
        }

        if (smokingPolicyDetails !== undefined) {
          await SmokingPolicyDetail.destroy({ where: { jobId: job.id }, transaction });
          if (smokingPolicyDetails.length > 0) {
            await SmokingPolicyDetail.bulkCreate(
              smokingPolicyDetails.map(detail => ({
                jobId: job.id,
                content: typeof detail === 'string' ? detail : detail.content || '',
                contentEn: typeof detail === 'object'
                  ? (detail.contentEn || detail.content_en || null)
                  : null,
                contentJp: typeof detail === 'object'
                  ? (detail.contentJp || detail.content_jp || null)
                  : null
              })),
              { transaction }
            );
          }
        }

        if (workingHours !== undefined) {
          await WorkingHour.destroy({ where: { jobId: job.id }, transaction });
          if (workingHours.length > 0) {
            await WorkingHour.bulkCreate(
              workingHours.map(wh => ({
                jobId: job.id,
                workingHours: wh.workingHours || wh.hours
              })),
              { transaction }
            );
          }
        }

        if (workingHourDetails !== undefined) {
          await WorkingHourDetail.destroy({ where: { jobId: job.id }, transaction });
          if (workingHourDetails.length > 0) {
            await WorkingHourDetail.bulkCreate(
              workingHourDetails.map(detail => ({
                jobId: job.id,
                content: typeof detail === 'string' ? detail : detail.content || '',
                contentEn: typeof detail === 'object'
                  ? (detail.contentEn || detail.content_en || null)
                  : null,
                contentJp: typeof detail === 'object'
                  ? (detail.contentJp || detail.content_jp || null)
                  : null
              })),
              { transaction }
            );
          }
        }

        if (jobValues !== undefined) {
          // Xóa tất cả job values hiện tại
          await JobValue.destroy({ 
            where: { jobId: job.id }, 
            transaction,
            force: true // Hard delete để tránh conflict với soft delete
          });
          
          if (jobValues.length > 0) {
            // Loại bỏ duplicate entries dựa trên (typeId, valueId)
            // Giữ lại entry cuối cùng nếu có duplicate
            const uniqueJobValuesMap = new Map();
            
            for (const jv of jobValues) {
              // Validate required fields
              if (!jv.typeId || !jv.valueId) {
                console.warn(`[Job Update] Bỏ qua job value thiếu typeId hoặc valueId:`, jv);
                continue;
              }
              
              const key = `${jv.typeId}_${jv.valueId}`;
              // Nếu đã có, ghi đè bằng entry mới (giữ entry cuối cùng)
              uniqueJobValuesMap.set(key, {
                jobId: job.id,
                typeId: parseInt(jv.typeId),
                valueId: parseInt(jv.valueId),
                value: jv.value || null,
                isRequired: jv.isRequired || false
              });
            }
            
            const uniqueJobValues = Array.from(uniqueJobValuesMap.values());
            
            if (uniqueJobValues.length > 0) {
              try {
                await JobValue.bulkCreate(uniqueJobValues, { 
                  transaction,
                  ignoreDuplicates: false // Không ignore để phát hiện lỗi
                });
              } catch (createError) {
                // Nếu vẫn có lỗi duplicate, thử tạo từng cái một
                if (createError.name === 'SequelizeUniqueConstraintError' || createError.message.includes('Duplicate entry')) {
                  console.warn('[Job Update] Bulk create failed, trying individual creates:', createError.message);
                  // Xóa lại và tạo từng cái một
                  await JobValue.destroy({ 
                    where: { jobId: job.id }, 
                    transaction,
                    force: true
                  });
                  
                  for (const jv of uniqueJobValues) {
                    try {
                      await JobValue.create(jv, { transaction });
                    } catch (individualError) {
                      // Nếu vẫn duplicate, bỏ qua (có thể đã được tạo trong transaction)
                      if (individualError.name !== 'SequelizeUniqueConstraintError' && !individualError.message.includes('Duplicate entry')) {
                        throw individualError;
                      }
                      console.warn(`[Job Update] Bỏ qua duplicate job value: typeId=${jv.typeId}, valueId=${jv.valueId}`);
                    }
                  }
                } else {
                  throw createError;
                }
              }
            }
          }
        }

        if (jobPickupIds !== undefined) {
          await JobPickupId.destroy({ where: { jobId: job.id }, transaction });
          if (jobPickupIds.length > 0) {
            await JobPickupId.bulkCreate(
              jobPickupIds.map(pickup => ({
                jobId: job.id,
                jobPickupId: pickup.jobPickupId || pickup.pickupId
              })),
              { transaction }
            );
          }
        }

        // Update job-campaign associations if campaignIds provided
        if (campaignIds !== undefined) {
          // Delete existing associations
          await JobCampaign.destroy({
            where: { jobId: job.id },
            transaction,
            force: true // Hard delete để tránh conflict
          });
          
          // Create new associations if campaignIds provided
          if (campaignIds.length > 0) {
            // Loại bỏ duplicate campaignIds
            const uniqueCampaignIds = [...new Set(campaignIds.map(id => parseInt(id)))];
            
            // Validate that all campaignIds exist
            const campaigns = await Campaign.findAll({
              where: { id: { [Op.in]: uniqueCampaignIds } },
              transaction
            });

            if (campaigns.length !== uniqueCampaignIds.length) {
              await transaction.rollback();
              return res.status(400).json({
                success: false,
                message: 'Một số chiến dịch không tồn tại'
              });
            }

            // Kiểm tra xem các associations đã tồn tại chưa (trong transaction)
            const existingAssociations = await JobCampaign.findAll({
              where: {
                jobId: job.id,
                campaignId: { [Op.in]: uniqueCampaignIds }
              },
              transaction
            });

            const existingCampaignIds = new Set(existingAssociations.map(a => a.campaignId));
            const newCampaignIds = uniqueCampaignIds.filter(id => !existingCampaignIds.has(id));

            // Chỉ tạo các associations mới
            if (newCampaignIds.length > 0) {
              try {
                await JobCampaign.bulkCreate(
                  newCampaignIds.map(campaignId => ({
                    campaignId: campaignId,
                    jobId: job.id
                  })),
                  { 
                    transaction,
                    ignoreDuplicates: true // Ignore duplicates để tránh lỗi
                  }
                );
              } catch (createError) {
                // Nếu vẫn có lỗi duplicate, thử tạo từng cái một
                if (createError.name === 'SequelizeUniqueConstraintError' || createError.message.includes('Duplicate entry')) {
                  console.warn('[Job Update] Bulk create job_campaigns failed, trying individual creates:', createError.message);
                  
                  for (const campaignId of newCampaignIds) {
                    try {
                      await JobCampaign.create({
                        campaignId: campaignId,
                        jobId: job.id
                      }, { transaction });
                    } catch (individualError) {
                      // Nếu vẫn duplicate, bỏ qua (có thể đã được tạo trong transaction)
                      if (individualError.name !== 'SequelizeUniqueConstraintError' && !individualError.message.includes('Duplicate entry')) {
                        throw individualError;
                      }
                      console.warn(`[Job Update] Bỏ qua duplicate job_campaign: campaignId=${campaignId}, jobId=${job.id}`);
                    }
                  }
                } else {
                  throw createError;
                }
              }
            }
          }
        }

        // Update recruiting company if provided
        if (recruitingCompany !== undefined) {
          // Find existing recruiting company
          let existingRecruitingCompany = await JobRecruitingCompany.findOne({
            where: { jobId: job.id },
            transaction
          });

          if (recruitingCompany === null || (typeof recruitingCompany === 'object' && Object.keys(recruitingCompany).length === 0)) {
            // Delete if null or empty object
            if (existingRecruitingCompany) {
              await JobRecruitingCompanyService.destroy({
                where: { jobRecruitingCompanyId: existingRecruitingCompany.id },
                transaction
              });
              await JobRecruitingCompanyBusinessSector.destroy({
                where: { jobRecruitingCompanyId: existingRecruitingCompany.id },
                transaction
              });
              await existingRecruitingCompany.destroy({ transaction });
            }
          } else {
            // Update or create
            if (existingRecruitingCompany) {
              // Update existing
              existingRecruitingCompany.companyName = recruitingCompany.companyName !== undefined ? recruitingCompany.companyName : existingRecruitingCompany.companyName;
              existingRecruitingCompany.revenue = recruitingCompany.revenue !== undefined ? recruitingCompany.revenue : existingRecruitingCompany.revenue;
              existingRecruitingCompany.numberOfEmployees = recruitingCompany.numberOfEmployees !== undefined ? recruitingCompany.numberOfEmployees : existingRecruitingCompany.numberOfEmployees;
              existingRecruitingCompany.headquarters = recruitingCompany.headquarters !== undefined ? recruitingCompany.headquarters : existingRecruitingCompany.headquarters;
              existingRecruitingCompany.companyIntroduction = recruitingCompany.companyIntroduction !== undefined ? recruitingCompany.companyIntroduction : existingRecruitingCompany.companyIntroduction;
              existingRecruitingCompany.stockExchangeInfo = recruitingCompany.stockExchangeInfo !== undefined ? recruitingCompany.stockExchangeInfo : existingRecruitingCompany.stockExchangeInfo;
              existingRecruitingCompany.investmentCapital = recruitingCompany.investmentCapital !== undefined ? recruitingCompany.investmentCapital : existingRecruitingCompany.investmentCapital;
              existingRecruitingCompany.establishedDate = recruitingCompany.establishedDate !== undefined ? recruitingCompany.establishedDate : existingRecruitingCompany.establishedDate;
              await existingRecruitingCompany.save({ transaction });
            } else {
              // Create new
              existingRecruitingCompany = await JobRecruitingCompany.create({
                jobId: job.id,
                companyName: recruitingCompany.companyName || null,
                revenue: recruitingCompany.revenue || null,
                numberOfEmployees: recruitingCompany.numberOfEmployees || null,
                headquarters: recruitingCompany.headquarters || null,
                companyIntroduction: recruitingCompany.companyIntroduction || null,
                stockExchangeInfo: recruitingCompany.stockExchangeInfo || null,
                investmentCapital: recruitingCompany.investmentCapital || null,
                establishedDate: recruitingCompany.establishedDate || null
              }, { transaction });
            }

            // Update services
            if (recruitingCompany.services !== undefined) {
              await JobRecruitingCompanyService.destroy({
                where: { jobRecruitingCompanyId: existingRecruitingCompany.id },
                transaction
              });
              if (Array.isArray(recruitingCompany.services) && recruitingCompany.services.length > 0) {
                await JobRecruitingCompanyService.bulkCreate(
                  recruitingCompany.services.map((service, index) => ({
                    jobRecruitingCompanyId: existingRecruitingCompany.id,
                    serviceName: typeof service === 'string' ? service : service.serviceName || service.name,
                    order: typeof service === 'object' && service.order !== undefined ? service.order : index
                  })),
                  { transaction }
                );
              }
            }

            // Update business sectors
            if (recruitingCompany.businessSectors !== undefined) {
              await JobRecruitingCompanyBusinessSector.destroy({
                where: { jobRecruitingCompanyId: existingRecruitingCompany.id },
                transaction
              });
              if (Array.isArray(recruitingCompany.businessSectors) && recruitingCompany.businessSectors.length > 0) {
                await JobRecruitingCompanyBusinessSector.bulkCreate(
                  recruitingCompany.businessSectors.map((sector, index) => ({
                    jobRecruitingCompanyId: existingRecruitingCompany.id,
                    sectorName: typeof sector === 'string' ? sector : sector.sectorName || sector.name,
                    order: typeof sector === 'object' && sector.order !== undefined ? sector.order : index
                  })),
                  { transaction }
                );
              }
            }
          }
        }

        await transaction.commit();

        // Reload with all relations (for response and JD PDF)
        await job.reload({
          include: [
            {
              model: JobCategory,
              as: 'category',
              required: false
            },
            {
              model: Company,
              as: 'company',
              required: false
            },
            {
              model: JobRecruitingCompany,
              as: 'recruitingCompany',
              required: false,
              include: [
                {
                  model: JobRecruitingCompanyService,
                  as: 'services',
                  required: false,
                  order: [['order', 'ASC']]
                },
                {
                  model: JobRecruitingCompanyBusinessSector,
                  as: 'businessSectors',
                  required: false,
                  order: [['order', 'ASC']]
                }
              ]
            },
            {
              model: WorkingLocation,
              as: 'workingLocations',
              required: false
            },
            {
              model: WorkingLocationDetail,
              as: 'workingLocationDetails',
              required: false
            },
            {
              model: SalaryRange,
              as: 'salaryRanges',
              required: false
            },
            {
              model: SalaryRangeDetail,
              as: 'salaryRangeDetails',
              required: false
            },
            {
              model: OvertimeAllowance,
              as: 'overtimeAllowances',
              required: false
            },
            {
              model: OvertimeAllowanceDetail,
              as: 'overtimeAllowanceDetails',
              required: false
            },
            {
              model: Requirement,
              as: 'requirements',
              required: false
            },
            {
              model: WorkingHour,
              as: 'workingHours',
              required: false
            },
            {
              model: JobValue,
              as: 'jobValues',
              required: false,
              include: [
                { model: Type, as: 'type', required: false },
                { model: Value, as: 'valueRef', required: false }
              ]
            }
          ]
        });

        // Generate JD template PDF, upload to S3, cập nhật jdFile (xóa file cũ nếu có)
        try {
          if (job.jdFile) {
            if (isS3Key(job.jdFile)) {
              await deleteFileFromS3(job.jdFile).catch(() => {});
            } else {
              const oldPath = path.join(__dirname, '../../../', job.jdFile);
              await fs.unlink(oldPath).catch(() => {});
            }
          }
          const pdfBuffer = await generateJdPdfBuffer(job);
          if (pdfBuffer) {
            if (s3Enabled()) {
              const s3Key = buildJdTemplatePdfKey(job.id);
              await uploadBufferToS3(pdfBuffer, s3Key, 'application/pdf');
              job.jdFile = s3Key;
              await job.save();
            } else {
              const uploadDir = path.join(path.dirname(path.dirname(path.dirname(__dirname))), 'uploads');
              const jdFolder = path.join(uploadDir, 'job_descriptions', String(job.id));
              await fs.mkdir(jdFolder, { recursive: true });
              const pdfPath = path.join(jdFolder, 'jd-template.pdf');
              await fs.writeFile(pdfPath, pdfBuffer);
              job.jdFile = path.relative(path.join(__dirname, '../../../'), pdfPath);
              await job.save();
            }
            await job.reload({ include: [{ model: JobCategory, as: 'category', required: false }, { model: Company, as: 'company', required: false }, { model: JobRecruitingCompany, as: 'recruitingCompany', required: false, include: [{ model: JobRecruitingCompanyService, as: 'services', required: false }, { model: JobRecruitingCompanyBusinessSector, as: 'businessSectors', required: false }] }] });
          }
        } catch (pdfErr) {
          console.warn('[Admin updateJob] Không thể tạo JD template PDF:', pdfErr.message);
        }

        // Log action
        await ActionLog.create({
          adminId: req.admin.id,
          object: 'Job',
          action: 'edit',
          ip: req.ip || req.connection.remoteAddress,
          before: oldData,
          after: job.toJSON(),
          description: `Cập nhật việc làm: ${job.title} (${job.jobCode})`
        });

        res.json({
          success: true,
          message: 'Cập nhật việc làm thành công',
          data: { job }
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete job (soft delete)
   * DELETE /api/admin/jobs/:id
   */
  deleteJob: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id, {
        include: [
          {
            model: JobApplication,
            as: 'applications',
            required: false
          }
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      // Check if job has applications
      if (job.applications && job.applications.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa việc làm có ứng viên đã ứng tuyển. Vui lòng đóng việc làm trước.'
        });
      }

      // Store old data for log
      const oldData = job.toJSON();

      // Soft delete
      await job.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa việc làm: ${job.title} (${job.jobCode})`
      });

      res.json({
        success: true,
        message: 'Xóa việc làm thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle job pinned status
   * PATCH /api/admin/jobs/:id/toggle-pinned
   */
  togglePinned: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      const oldData = job.toJSON();

      job.isPinned = !job.isPinned;
      await job.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: job.isPinned ? 'pin' : 'unpin',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: job.toJSON(),
        description: `${job.isPinned ? 'Ghim' : 'Bỏ ghim'} việc làm: ${job.title} (${job.jobCode})`
      });

      res.json({
        success: true,
        message: `${job.isPinned ? 'Ghim' : 'Bỏ ghim'} việc làm thành công`,
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle job hot status
   * PATCH /api/admin/jobs/:id/toggle-hot
   */
  toggleHot: async (req, res, next) => {
    try {
      const { id } = req.params;

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      const oldData = job.toJSON();

      job.isHot = !job.isHot;
      await job.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: job.isHot ? 'set_hot' : 'unset_hot',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: job.toJSON(),
        description: `${job.isHot ? 'Đánh dấu' : 'Bỏ đánh dấu'} việc làm hot: ${job.title} (${job.jobCode})`
      });

      res.json({
        success: true,
        message: `${job.isHot ? 'Đánh dấu' : 'Bỏ đánh dấu'} việc làm hot thành công`,
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job status
   * PATCH /api/admin/jobs/:id/status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái là bắt buộc'
        });
      }

      const job = await Job.findByPk(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      const oldData = job.toJSON();

      job.status = parseInt(status);
      await job.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Job',
        action: 'update_status',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: job.toJSON(),
        description: `Cập nhật trạng thái việc làm: ${job.title} (${job.jobCode}) - Status: ${status}`
      });

      res.json({
        success: true,
        message: 'Cập nhật trạng thái việc làm thành công',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }
};

