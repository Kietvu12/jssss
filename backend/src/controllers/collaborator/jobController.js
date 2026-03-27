import {
  Job,
  JobCategory,
  Company,
  JobValue,
  Type,
  Value,
  SearchHistory,
  JobCampaign,
  Campaign,
  JobPickupId,
  Requirement,
  WorkingLocation,
  WorkingLocationDetail,
  SalaryRange,
  SalaryRangeDetail,
  OvertimeAllowanceDetail,
  SmokingPolicy,
  SmokingPolicyDetail,
  WorkingHourDetail,
  CompanyBusinessField,
  CompanyOffice,
  Benefit,
  JobRecruitingCompany,
  JobRecruitingCompanyService,
  JobRecruitingCompanyBusinessSector
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import path from 'path';
import { isS3Key, getSignedUrlForFile, makeDownloadDisposition } from '../../services/s3Service.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'deadline': 'deadline',
    'viewsCount': 'views_count'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Job Management Controller (CTV)
 * CTV có thể xem danh sách job, lọc, lưu yêu thích và lịch sử tìm kiếm
 */
export const jobController = {
  /**
   * Get list of jobs (with filters)
   * GET /api/ctv/jobs
   */
  getJobs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status = 1, // Mặc định chỉ lấy job đã published
        jobCategoryId,
        companyId,
        isPinned,
        isHot,
        deadlineFrom,
        deadlineTo,
        minSalary,
        maxSalary,
        workingLocation,
        location, // alias cho workingLocation (frontend gửi location)
        recruitmentType,
        sectorNames, // Lĩnh vực kinh doanh: chuỗi phân cách bởi dấu phẩy
        sortBy = 'id',
        sortOrder = 'DESC',
        saveSearch = false // Có lưu lịch sử tìm kiếm không
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Chỉ lấy job đã published (status = 1) hoặc theo filter
      if (status !== undefined) {
        where.status = parseInt(status);
      } else {
        where.status = 1; // Mặc định chỉ lấy job đã published
      }

      // Search by title, job_code, or slug
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { jobCode: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } }
        ];
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

      // Filter by recruitment type
      if (recruitmentType) {
        where.recruitmentType = parseInt(recruitmentType);
      }

      // Location filter: dùng workingLocation hoặc location (bảng working_locations, cột location)
      const locationFilter = workingLocation || location;
      // Salary filter: áp dụng qua include SalaryRange (salary_range trong DB dạng "min-max")
      const hasSalaryFilter = minSalary != null && minSalary !== '' || maxSalary != null && maxSalary !== '';

      // Validate sortBy
      const allowedSortFields = ['id', 'title', 'jobCode', 'createdAt', 'updatedAt', 'deadline', 'viewsCount'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      // Build salary where: salary_range trong DB dạng "min-max" (VD: "10-20")
      const salaryWhere = [];
      if (hasSalaryFilter) {
        const minVal = minSalary != null && minSalary !== '' ? parseFloat(minSalary) : null;
        const maxVal = maxSalary != null && maxSalary !== '' ? parseFloat(maxSalary) : null;
        // Dùng tên bảng để tránh lỗi "Unknown column" khi có nhiều JOIN
        const col = '`salary_ranges`.`salary_range`';
        if (maxVal != null && !Number.isNaN(maxVal)) {
          salaryWhere.push(sequelize.literal(`CAST(SUBSTRING_INDEX(${col}, '-', 1) AS UNSIGNED) <= ${maxVal}`));
        }
        if (minVal != null && !Number.isNaN(minVal)) {
          salaryWhere.push(sequelize.literal(`CAST(SUBSTRING_INDEX(${col}, '-', -1) AS UNSIGNED) >= ${minVal}`));
        }
      }

      // Parse sectorNames filter (lĩnh vực kinh doanh) - chuỗi phân cách bởi dấu phẩy
      const sectorNameList = sectorNames
        ? String(sectorNames).split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const recruitingCompanyInclude = {
        model: JobRecruitingCompany,
        as: 'recruitingCompany',
        required: sectorNameList.length > 0,
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
            required: sectorNameList.length > 0,
            attributes: ['id', 'sectorName', 'order'],
            order: [['order', 'ASC']],
            ...(sectorNameList.length > 0 ? { where: { sectorName: { [Op.in]: sectorNameList } } } : {})
          }
        ]
      };

      const includeList = [
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
        recruitingCompanyInclude,
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
          attributes: ['id', 'content', 'contentEn', 'contentJp', 'type', 'status'],
          where: {
            type: { [Op.in]: ['technique', 'education', 'application'] }
          },
          required: false
        },
        {
          model: WorkingLocationDetail,
          as: 'workingLocationDetails',
          required: false,
          attributes: ['id', 'content', 'contentEn', 'contentJp']
        },
        {
          model: SalaryRange,
          as: 'salaryRanges',
          required: salaryWhere.length > 0,
          attributes: ['id', 'salaryRange', 'salaryRangeEn', 'salaryRangeJp', 'type'],
          ...(salaryWhere.length > 0 ? { where: { [Op.and]: salaryWhere } } : {})
        },
        {
          model: SalaryRangeDetail,
          as: 'salaryRangeDetails',
          required: false,
          attributes: ['id', 'content', 'contentEn', 'contentJp']
        },
        {
          model: JobCampaign,
          as: 'jobCampaigns',
          required: false,
          attributes: ['id', 'campaignId', 'jobId'],
          paranoid: true, // Chỉ lấy những record chưa bị soft-delete
          include: [
            {
              model: Campaign,
              as: 'campaign',
              required: false,
              attributes: ['id', 'name', 'percent']
            }
          ]
        }
      ];

      // Lọc theo địa điểm: bảng working_locations, cột location
      if (locationFilter) {
        includeList.push({
          model: WorkingLocation,
          as: 'workingLocations',
          required: true,
          attributes: ['id', 'location', 'locationEn', 'locationJp', 'country', 'countryEn', 'countryJp'],
          where: { location: { [Op.like]: `%${String(locationFilter).replace(/%/g, '\\%')}%` } }
        });
      } else {
        includeList.push({
          model: WorkingLocation,
          as: 'workingLocations',
          required: false,
          attributes: ['id', 'location', 'locationEn', 'locationJp', 'country', 'countryEn', 'countryJp']
        });
      }

      const { count, rows } = await Job.findAndCountAll({
        where,
        distinct: true,
        include: includeList,
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      const { attachCampaignCommissionToJobs } = await import('../../utils/campaignCommissionHelper.js');
      const jobsWithFavorite = attachCampaignCommissionToJobs(
        rows.map(job => {
          const jobData = job.toJSON();
          jobData.isFavorite = false;
          return jobData;
        }),
        false,
        1
      );

      // Lưu lịch sử tìm kiếm nếu có từ khóa hoặc filter
      if (saveSearch === 'true' || saveSearch === '1') {
        const filters = {
          search,
          status,
          jobCategoryId,
          companyId,
          isPinned,
          isHot,
          deadlineFrom,
          deadlineTo,
          minSalary,
          maxSalary,
          workingLocation,
          sectorNames,
          recruitmentType,
          sortBy,
          sortOrder
        };

        // Chỉ lưu nếu có từ khóa hoặc có filter
        if (search || Object.keys(filters).some(key => filters[key] !== undefined && key !== 'search')) {
          await SearchHistory.create({
            collaboratorId: req.collaborator.id,
            keyword: search || null,
            filters: filters,
            resultCount: count
          });
        }
      }

      res.json({
        success: true,
        data: {
          jobs: jobsWithFavorite,
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
   * Lấy URL xem/tải file JD hoặc required CV form (S3 signed URL hoặc URL tĩnh)
   * GET /api/ctv/jobs/:id/view-url?fileType=jdFile|jdFileEn|jdFileJp|jdOriginalFile|requiredCvForm&purpose=view|download
   */
  getJobFileUrl: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fileType = 'jdFile', purpose = 'view' } = req.query;

      const job = await Job.findByPk(id, {
        attributes: ['id', 'jdFile', 'jdFileEn', 'jdFileJp', 'jdOriginalFile', 'requiredCvForm']
      });
      if (!job) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy việc làm' });
      }

      let filePath;
      if (fileType === 'requiredCvForm') {
        filePath = job.requiredCvForm ?? job.get?.('required_cv_form');
      } else if (fileType === 'jdFileEn') {
        filePath = job.jdFileEn ?? job.get?.('jd_file_en');
      } else if (fileType === 'jdFileJp') {
        filePath = job.jdFileJp ?? job.get?.('jd_file_jp');
      } else if (fileType === 'jdOriginalFile') {
        filePath = job.jdOriginalFile ?? job.get?.('jd_original_file');
      } else {
        filePath = job.jdFile ?? job.get?.('jd_file');
      }
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
   * Get job by ID
   * GET /api/ctv/jobs/:id
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
            required: false,
            include: [
              {
                model: CompanyBusinessField,
                as: 'businessFields',
                required: false,
                attributes: ['id', 'content']
              },
              {
                model: CompanyOffice,
                as: 'offices',
                required: false,
                attributes: ['id', 'address', 'isHeadOffice']
              }
            ]
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
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            attributes: ['id', 'campaignId', 'jobId'],
            paranoid: true
          },
          {
            model: Requirement,
            as: 'requirements',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp', 'type', 'status']
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'salaryRangeEn', 'salaryRangeJp', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: OvertimeAllowanceDetail,
            as: 'overtimeAllowanceDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: SmokingPolicyDetail,
            as: 'smokingPolicyDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: WorkingHourDetail,
            as: 'workingHourDetails',
            required: false,
            attributes: ['id', 'content']
          },
          {
            model: Benefit,
            as: 'benefits',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: SmokingPolicy,
            as: 'smokingPolicies',
            required: false,
            attributes: ['id', 'allow']
          }
        ]
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy việc làm'
        });
      }

      // Check if job is published
      if (job.status !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Việc làm này chưa được công bố'
        });
      }

      const jobData = job.toJSON();
      jobData.isFavorite = false;

      // Tăng views count
      await job.increment('viewsCount');

      res.json({
        success: true,
        data: { job: jobData }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get jobs by campaign ID
   * GET /api/ctv/jobs/by-campaign/:campaignId
   */
  getJobsByCampaign: async (req, res, next) => {
    try {
      const { campaignId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Lấy job IDs từ job_campaigns (chỉ lấy những job chưa bị xóa)
      const jobCampaigns = await JobCampaign.findAll({
        where: {
          campaignId: parseInt(campaignId)
        },
        attributes: ['jobId'],
        paranoid: true // Chỉ lấy những record chưa bị soft-delete
      });

      const jobIds = jobCampaigns.map(jc => jc.jobId);
      
      // Debug: Log số lượng jobs trong campaign
      console.log(`[GetJobsByCampaign] Campaign ID: ${campaignId}, Job IDs found: ${jobIds.length}`, jobIds);

      if (jobIds.length === 0) {
        return res.json({
          success: true,
          data: {
            jobs: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: 0
            }
          }
        });
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'deadline', 'viewsCount', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await Job.findAndCountAll({
        where: {
          id: { [Op.in]: jobIds },
          status: 1 // Chỉ lấy job đã published
        },
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
            attributes: ['id', 'content', 'contentEn', 'contentJp', 'type', 'status'],
            where: {
              type: { [Op.in]: ['technique', 'education', 'application'] }
            },
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'salaryRangeEn', 'salaryRangeJp', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: WorkingLocation,
            as: 'workingLocations',
            required: false,
            attributes: ['id', 'location', 'locationEn', 'locationJp', 'country', 'countryEn', 'countryJp']
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
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      const { attachCampaignCommissionToJobs } = await import('../../utils/campaignCommissionHelper.js');
      const jobsWithFavorite = attachCampaignCommissionToJobs(
        rows.map(job => {
          const jobData = job.toJSON();
          jobData.isFavorite = false;
          return jobData;
        }),
        false,
        1
      );

      // Dùng jobIds.length làm total vì findAndCountAll với include có thể đếm sai
      const total = jobIds.length;
      const limitNum = parseInt(limit);
      const totalPages = Math.ceil(total / limitNum);

      console.log(`[GetJobsByCampaign] Campaign ID: ${campaignId}, Jobs returned: ${jobsWithFavorite.length}, Total: ${total}`);

      res.json({
        success: true,
        data: {
          jobs: jobsWithFavorite,
          pagination: {
            total,
            page: parseInt(page),
            limit: limitNum,
            totalPages
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get jobs by job pickup ID
   * GET /api/ctv/jobs/by-job-pickup/:jobPickupId
   */
  getJobsByJobPickup: async (req, res, next) => {
    try {
      const { jobPickupId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Lấy job IDs từ job_pickups_id (chỉ lấy những job chưa bị xóa)
      const jobPickupIds = await JobPickupId.findAll({
        where: {
          jobPickupId: parseInt(jobPickupId)
        },
        attributes: ['jobId'],
        paranoid: true // Chỉ lấy những record chưa bị soft-delete
      });

      const jobIds = jobPickupIds.map(jpi => jpi.jobId);
      
      // Debug: Log số lượng jobs trong job pickup
      console.log(`[GetJobsByJobPickup] Job Pickup ID: ${jobPickupId}, Job IDs found: ${jobIds.length}`, jobIds);

      if (jobIds.length === 0) {
        return res.json({
          success: true,
          data: {
            jobs: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: 0
            }
          }
        });
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'deadline', 'viewsCount', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await Job.findAndCountAll({
        where: {
          id: { [Op.in]: jobIds },
          status: 1 // Chỉ lấy job đã published
        },
        paranoid: true, // Chỉ lấy jobs chưa bị soft-delete
        include: [
          {
            model: JobCategory,
            as: 'category',
            attributes: ['id', 'name', 'slug'],
            required: false
          },
          {
            model: Company,
            as: 'company',
            attributes: ['id', 'name', 'logo'],
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
            attributes: ['id', 'content', 'contentEn', 'contentJp', 'type', 'status'],
            where: {
              type: { [Op.in]: ['technique', 'education', 'application'] }
            },
            required: false
          },
          {
            model: WorkingLocationDetail,
            as: 'workingLocationDetails',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: SalaryRange,
            as: 'salaryRanges',
            required: false,
            attributes: ['id', 'salaryRange', 'salaryRangeEn', 'salaryRangeJp', 'type']
          },
          {
            model: SalaryRangeDetail,
            as: 'salaryRangeDetails',
            required: false,
            attributes: ['id', 'content', 'contentEn', 'contentJp']
          },
          {
            model: WorkingLocation,
            as: 'workingLocations',
            required: false,
            attributes: ['id', 'location', 'locationEn', 'locationJp', 'country', 'countryEn', 'countryJp']
          },
          {
            model: JobCampaign,
            as: 'jobCampaigns',
            required: false,
            attributes: ['id', 'campaignId', 'jobId'],
            paranoid: true // Chỉ lấy những record chưa bị soft-delete
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      const jobsWithFavorite = rows.map(job => {
        const jobData = job.toJSON();
        jobData.isFavorite = false;
        return jobData;
      });

      // Dùng jobIds.length làm total vì findAndCountAll với include có thể đếm sai (đếm theo bảng join)
      const total = jobIds.length;
      const limitNum = parseInt(limit);
      const totalPages = Math.ceil(total / limitNum);

      console.log(`[GetJobsByJobPickup] Job Pickup ID: ${jobPickupId}, Jobs returned: ${jobsWithFavorite.length}, Total: ${total}`);

      res.json({
        success: true,
        data: {
          jobs: jobsWithFavorite,
          pagination: {
            total,
            page: parseInt(page),
            limit: limitNum,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('[Backend] Error in getJobsByJobPickup:', error);
      next(error);
    }
  }
};

