import {
  JobApplication,
  Job,
  JobCategory,
  Company,
  JobRecruitingCompany,
  Collaborator,
  CVStorage,
  ActionLog,
  PaymentRequest,
  Admin,
  CollaboratorAssignment,
  JobApplicationMemo
} from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { statusMessageService } from '../../services/statusMessageService.js';
import { STATUS_JOINED_COMPANY, STATUS_PAID, STATUS_DUPLICATE, STATUSES_ENDED } from '../../constants/jobApplicationStatus.js';
import { canCVBeNominated } from '../../constants/cvStatus.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'appliedAt': 'applied_at',
    'interviewDate': 'interview_date',
    'nyushaDate': 'nyusha_date'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Kiểm tra xem AdminBackOffice có quyền với job application này không.
 * Ưu tiên:
 * - SuperAdmin: luôn true
 * - AdminBackOffice:
 *   + Nếu là adminResponsibleId của đơn → true
 *   + Hoặc được phân công xử lý hồ sơ CV tương ứng (collaborator_assignments.cv_storage_id)
 */
const checkAdminBackOfficePermission = async (admin, jobApplication) => {
  // SuperAdmin (role = 1) có quyền tất cả
  if (admin.role === 1) {
    return true;
  }

  // AdminBackOffice (role = 2)
  if (admin.role === 2) {
    // Nếu là admin phụ trách đơn này thì có toàn quyền
    if (jobApplication.adminResponsibleId && jobApplication.adminResponsibleId === admin.id) {
      return true;
    }

    // Nếu không có cvCode thì không thể kiểm tra phân công hồ sơ
    if (!jobApplication.cvCode) {
      return false;
    }

    // Tìm CVStorage theo code
    const cv = await CVStorage.findOne({
      where: { code: jobApplication.cvCode },
      attributes: ['id']
    });

    if (!cv) {
      return false;
    }

    // Kiểm tra xem hồ sơ này có assignment active cho admin không
    const assignment = await CollaboratorAssignment.findOne({
      where: {
        cvStorageId: cv.id,
        adminId: admin.id,
        status: 1 // Active assignment
      }
    });

    return assignment !== null;
  }

  // Các role khác không có quyền
  return false;
};

/**
 * Job Application Management Controller (Admin)
 */
export const jobApplicationController = {
  /**
   * Get list of job applications
   * GET /api/admin/job-applications
   */
  getJobApplications: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        jobId,
        collaboratorId,
        cvCode,
        cvId,
        appliedFrom,
        appliedTo,
        interviewFrom,
        interviewTo,
        nyushaFrom,
        nyushaTo,
        adminResponsibleId,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by job
      if (jobId) {
        where.jobId = parseInt(jobId);
      }

      // Filter by collaborator
      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      // Filter by CV (ứng viên) – dùng cho trang Danh sách ứng tuyển của Admin
      if (cvCode) {
        where.cvCode = cvCode;
      }
      if (cvId && !cvCode) {
        const cv = await CVStorage.findByPk(cvId, { attributes: ['code'] });
        if (cv?.code) where.cvCode = cv.code;
      }

      // Filter by admin responsible (phân công đơn cho AdminBackOffice)
      // Chỉ lọc khi có query adminResponsibleId; mặc định cho phép AdminBackOffice xem toàn bộ
      if (adminResponsibleId) {
        where.adminResponsibleId = parseInt(adminResponsibleId);
      }

      // Filter by applied date
      if (appliedFrom || appliedTo) {
        where.applied_at = {};
        if (appliedFrom) {
          where.applied_at[Op.gte] = new Date(appliedFrom);
        }
        if (appliedTo) {
          where.applied_at[Op.lte] = new Date(appliedTo);
        }
      }

      // Filter by interview date
      if (interviewFrom || interviewTo) {
        where.interview_date = {};
        if (interviewFrom) {
          where.interview_date[Op.gte] = new Date(interviewFrom);
        }
        if (interviewTo) {
          where.interview_date[Op.lte] = new Date(interviewTo);
        }
      }

      // Filter by nyusha date
      if (nyushaFrom || nyushaTo) {
        where.nyusha_date = {};
        if (nyushaFrom) {
          where.nyusha_date[Op.gte] = nyushaFrom;
        }
        if (nyushaTo) {
          where.nyusha_date[Op.lte] = nyushaTo;
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'status', 'appliedAt', 'interviewDate', 'nyushaDate', 'createdAt', 'updatedAt'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']);
      }

      const includeOptions = [
        {
          model: Job,
          as: 'job',
          required: false,
          attributes: ['id', 'jobCode', 'title', 'titleEn', 'titleJp', 'slug']
        },
        {
          model: Collaborator,
          as: 'collaborator',
          required: false,
          attributes: ['id', 'name', 'email', 'code']
        },
        {
          model: Admin,
          as: 'admin',
          required: false,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Admin,
          as: 'adminResponsible',
          required: false,
          attributes: ['id', 'name', 'email']
        },
        {
          model: CVStorage,
          as: 'cv',
          required: false,
          attributes: ['id', 'code', 'name', 'email']
        }
      ];

      // Search by CV name, email, phone if search provided
      if (search) {
        includeOptions.push({
          model: CVStorage,
          as: 'cv',
          required: false,
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
              { phone: { [Op.like]: `%${search}%` } }
            ]
          },
          attributes: ['id', 'code', 'name', 'email']
        });
      }

      const { count, rows } = await JobApplication.findAndCountAll({
        where,
        include: includeOptions.filter((item, index, self) => 
          index === self.findIndex(t => t.as === item.as)
        ),
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      res.json({
        success: true,
        data: {
          jobApplications: rows,
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
   * Get job application by ID
   * GET /api/admin/job-applications/:id
   */
  getJobApplicationById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const jobApplication = await JobApplication.findByPk(id, {
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
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
                required: false
              }
            ]
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'adminResponsible',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      res.json({
        success: true,
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new job application
   * POST /api/admin/job-applications
   */
  createJobApplication: async (req, res, next) => {
    try {
      const {
        jobId,
        collaboratorId,
        title,
        status = 1,
        cvCode,
        cvPath: bodyCvPath,
        monthlySalary,
        appliedAt,
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate,
        rejectNote
      } = req.body;

      // Validate required fields
      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'ID việc làm là bắt buộc'
        });
      }

      // Validate job exists
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Việc làm không tồn tại'
        });
      }

      // Validate collaborator if provided
      if (collaboratorId) {
        const collaborator = await Collaborator.findByPk(collaboratorId);
        if (!collaborator) {
          return res.status(404).json({
            success: false,
            message: 'CTV không tồn tại'
          });
        }
      }

      // Validate CV if provided (must not be duplicate)
      let selectedCvPath = null;
      if (cvCode) {
        const cv = await CVStorage.findOne({ where: { code: cvCode } });
        if (!cv) {
          return res.status(404).json({
            success: false,
            message: 'CV không tồn tại'
          });
        }
        
        // Check if CV can be nominated (không trùng, không quá hạn, không archived)
        if (!canCVBeNominated(cv.status)) {
          return res.status(400).json({
            success: false,
            message: cv.status === 3 ? 'CV này bị trùng với CV đã tồn tại, không thể dùng để tạo đơn ứng tuyển' : 'CV này không thể dùng để tạo đơn ứng tuyển'
          });
        }

        const normalizedBodyPath = bodyCvPath && typeof bodyCvPath === 'string'
          ? String(bodyCvPath).replace(/\\/g, '/').trim()
          : '';
        const cvIdStr = String(cv.id);
        if (normalizedBodyPath.length > 0) {
          if (!normalizedBodyPath.includes(cvIdStr) || (!normalizedBodyPath.includes('CV_original') && !normalizedBodyPath.includes('CV_Template'))) {
            return res.status(400).json({
              success: false,
              message: 'Đường dẫn CV không hợp lệ hoặc không thuộc hồ sơ này'
            });
          }
          selectedCvPath = normalizedBodyPath.replace(/\/+$/, '');
        }
      }

      // Trùng hồ sơ: đã có đơn cùng ứng viên (cvCode) + cùng job mà đơn đó chưa kết thúc → tạo đơn với status 1 (Hồ sơ trùng)
      let statusToUse = status;
      if (cvCode) {
        const existing = await JobApplication.findOne({
          where: {
            jobId,
            cvCode,
            status: { [Op.notIn]: STATUSES_ENDED }
          }
        });
        if (existing) {
          statusToUse = STATUS_DUPLICATE; // 1 - Hồ sơ trùng
        }
      }

      // Logic phân biệt adminId và adminResponsibleId:
      // - adminId: ID của admin tạo đơn (tương ứng với CTV thuộc admin đó) - chỉ set khi CTV tự tạo đơn và admin quản lý CTV đó
      // - adminResponsibleId: ID của admin phụ trách (khi admin tạo đơn từ trang admin, có thể có hoặc không có collaboratorId)
      // 
      // Khi AdminBackOffice tạo đơn từ trang AddNominationPage (/api/admin/job-applications):
      // - Luôn set adminResponsibleId = req.admin.id (admin phụ trách tạo đơn)
      // - adminId = null (không phải admin tạo đơn cho CTV của mình)
      // - collaboratorId có thể có hoặc không (tùy vào việc có chọn CTV hay không)
      const adminIdValue = null; // Admin tạo đơn từ trang admin không set adminId
      const adminResponsibleIdValue = req.admin?.id || null; // Luôn set admin phụ trách

      const jobApplication = await JobApplication.create({
        jobId,
        collaboratorId: collaboratorId || null,
        adminId: adminIdValue,
        adminResponsibleId: adminResponsibleIdValue,
        title,
        status: statusToUse,
        cvCode: cvCode || null,
        cvPath: selectedCvPath,
        monthlySalary,
        appliedAt: appliedAt || new Date(),
        interviewDate,
        interviewRound2Date,
        nyushaDate,
        expectedPaymentDate,
        rejectNote
      });

      // Reload with relations
      await jobApplication.reload({
        include: [
          {
            model: Job,
            as: 'job',
            required: false
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'adminResponsible',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'create',
        ip: req.ip || req.connection.remoteAddress,
        after: jobApplication.toJSON(),
        description: `Tạo mới đơn ứng tuyển: Job #${jobId}`
      });

      res.status(201).json({
        success: true,
        message: 'Tạo đơn ứng tuyển thành công',
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job application
   * PUT /api/admin/job-applications/:id
   */
  updateJobApplication: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      // Kiểm tra quyền AdminBackOffice
      const hasPermission = await checkAdminBackOfficePermission(req.admin, jobApplication);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật đơn ứng tuyển này. Chỉ có thể cập nhật đơn của CTV được phân công cho bạn.'
        });
      }

      const oldData = jobApplication.toJSON();
      const oldAdminResponsibleId = oldData.adminResponsibleId;
      const newAdminResponsibleIdFromBody =
        updateData.adminResponsibleId !== undefined ? updateData.adminResponsibleId : oldAdminResponsibleId;
      const adminResponsibleChanged =
        updateData.adminResponsibleId !== undefined &&
        parseInt(newAdminResponsibleIdFromBody, 10) !== parseInt(oldAdminResponsibleId || 0, 10);

      // Validate job if being changed
      if (updateData.jobId && updateData.jobId !== jobApplication.jobId) {
        const job = await Job.findByPk(updateData.jobId);
        if (!job) {
          return res.status(404).json({
            success: false,
            message: 'Việc làm không tồn tại'
          });
        }
      }

      // Validate collaborator if being changed
      if (updateData.collaboratorId !== undefined) {
        if (updateData.collaboratorId && updateData.collaboratorId !== jobApplication.collaboratorId) {
          const collaborator = await Collaborator.findByPk(updateData.collaboratorId);
          if (!collaborator) {
            return res.status(404).json({
              success: false,
              message: 'CTV không tồn tại'
            });
          }
        }
      }

      // Validate CV if being changed (must not be duplicate)
      if (updateData.cvCode !== undefined && updateData.cvCode !== jobApplication.cvCode) {
        if (updateData.cvCode) {
          const cv = await CVStorage.findOne({ where: { code: updateData.cvCode } });
          if (!cv) {
            return res.status(404).json({
              success: false,
              message: 'CV không tồn tại'
            });
          }
          
          // Check if CV can be nominated
          if (!canCVBeNominated(cv.status)) {
            return res.status(400).json({
              success: false,
              message: cv.status === 3 ? 'CV này bị trùng với CV đã tồn tại, không thể dùng để tạo đơn ứng tuyển' : 'CV này không thể dùng để tạo đơn ứng tuyển'
            });
          }
        }
      }

      // Update fields - loại bỏ monthlySalary, chỉ cho phép yearlySalary
      Object.keys(updateData).forEach(key => {
        // Loại bỏ monthlySalary khỏi update
        if (key === 'monthlySalary' || key === 'monthly_salary') {
          return;
        }
        // Chỉ cho phép SuperAdmin (role = 1) cập nhật memo
        if (key === 'memo' && req.admin?.role !== 1) {
          return;
        }
        if (updateData[key] !== undefined) {
          jobApplication[key] = updateData[key];
        }
      });

      // Chuẩn hóa status: chỉ ghi khi là số 1–16; nếu không hợp lệ giữ nguyên giá trị cũ
      if (updateData.status !== undefined) {
        const statusNum = parseInt(updateData.status, 10);
        if (!Number.isNaN(statusNum) && statusNum >= 1 && statusNum <= 16) {
          jobApplication.status = statusNum;
        } else {
          jobApplication.status = oldData.status;
        }
      }
      
      // Đảm bảo yearlySalary được cập nhật nếu có trong updateData
      if (updateData.yearlySalary !== undefined) {
        // Parse thành number nếu là string
        const yearlySalaryValue = typeof updateData.yearlySalary === 'string' 
          ? parseFloat(updateData.yearlySalary) 
          : updateData.yearlySalary;
        jobApplication.yearlySalary = yearlySalaryValue;
        console.log(`[Update Job Application] Cập nhật yearlySalary: ${yearlySalaryValue} (từ ${updateData.yearlySalary})`);
      }

      await jobApplication.save();

      // Reload with relations
      await jobApplication.reload({
        include: [
          {
            model: Job,
            as: 'job',
            required: false
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Admin,
            as: 'adminResponsible',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: CVStorage,
            as: 'cv',
            required: false
          }
        ]
      });

      // Nếu Super Admin đổi adminResponsibleId và đơn có CV, tự động tạo/khôi phục phân công hồ sơ (collaborator_assignments)
      if (
        req.admin?.role === 1 &&
        adminResponsibleChanged &&
        jobApplication.cvCode
      ) {
        try {
          const cv = await CVStorage.findOne({
            where: { code: jobApplication.cvCode },
            attributes: ['id', 'name']
          });
          if (cv) {
            const targetAdminId = parseInt(newAdminResponsibleIdFromBody, 10);
            if (!Number.isNaN(targetAdminId)) {
              const existingAssignment = await CollaboratorAssignment.findOne({
                where: {
                  cvStorageId: cv.id,
                  adminId: targetAdminId
                },
                paranoid: false
              });

              if (existingAssignment) {
                await existingAssignment.update({
                  assignedBy: req.admin.id,
                  notes: existingAssignment.notes,
                  status: 1,
                  deletedAt: null
                });
              } else {
                await CollaboratorAssignment.create({
                  cvStorageId: cv.id,
                  adminId: targetAdminId,
                  assignedBy: req.admin.id,
                  notes: updateData.assignmentNote || null,
                  status: 1
                });
              }
            }
          }
        } catch (e) {
          console.error('Error syncing collaborator assignment from job application:', e);
        }
      }

      const newData = jobApplication.toJSON();

      // Tự động tạo tin nhắn nếu có thay đổi status
      if (updateData.status !== undefined && oldData.status !== parseInt(updateData.status)) {
        try {
          await statusMessageService.createStatusMessage({
            jobApplicationId: id,
            oldStatus: oldData.status,
            newStatus: parseInt(updateData.status),
            adminId: req.admin.id,
            note: updateData.rejectNote || null
          });
        } catch (messageError) {
          console.error('[Job Application] Error creating status message:', messageError);
        }
      } else if (updateData.status === undefined) {
        // Nếu không thay đổi status, kiểm tra các thay đổi khác
        try {
          await statusMessageService.createUpdateMessage({
            jobApplicationId: id,
            oldData,
            newData,
            adminId: req.admin.id
          });
        } catch (messageError) {
          console.error('[Job Application] Error creating update message:', messageError);
        }
      }

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'edit',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: jobApplication.toJSON(),
        description: `Cập nhật đơn ứng tuyển #${id}`
      });

      res.json({
        success: true,
        message: 'Cập nhật đơn ứng tuyển thành công',
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get memos for a job application
   * GET /api/admin/job-applications/:id/memos
   */
  getMemos: async (req, res, next) => {
    try {
      const { id } = req.params;

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      // SuperAdmin xem được tất cả; AdminBackOffice tuân theo cùng rule với cập nhật đơn
      if (req.admin?.role === 2) {
        const hasPermission = await checkAdminBackOfficePermission(req.admin, jobApplication);
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: 'Bạn chỉ được xem memo của các đơn mình phụ trách'
          });
        }
      }

      let memos = await JobApplicationMemo.findAll({
        where: { jobApplicationId: id },
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            attributes: ['id', 'jobCode', 'title', 'titleEn', 'titleJp']
          },
          {
            model: Admin,
            as: 'creator',
            required: false,
            attributes: ['id', 'name', 'email', 'role']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Backward compatibility: nếu chưa có bản ghi trong bảng memos
      // nhưng cột job_applications.memo có dữ liệu, hiển thị memo này như 1 bản ghi ảo
      if ((!memos || memos.length === 0) && jobApplication.memo) {
        memos = [
          {
            id: 0,
            jobApplicationId: jobApplication.id,
            jobId: null,
            note: jobApplication.memo,
            createdBy: null,
            created_at: jobApplication.created_at,
            updated_at: jobApplication.updated_at,
            deleted_at: null,
            job: null,
            creator: null
          }
        ];
      }

      res.json({
        success: true,
        data: { memos }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create memo for a job application
   * POST /api/admin/job-applications/:id/memos
   * Only SuperAdmin (role = 1) can create
   */
  createMemo: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { note, jobId } = req.body;

      if (!note || !note.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Nội dung memo là bắt buộc'
        });
      }

      if (!req.admin || req.admin.role !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới được tạo memo'
        });
      }

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      let suggestedJob = null;
      if (jobId) {
        suggestedJob = await Job.findByPk(jobId);
        if (!suggestedJob) {
          return res.status(404).json({
            success: false,
            message: 'Job gợi ý không tồn tại'
          });
        }
      }

      const memo = await JobApplicationMemo.create({
        jobApplicationId: jobApplication.id,
        jobId: suggestedJob ? suggestedJob.id : null,
        note: note.trim(),
        createdBy: req.admin.id
      });

      // Cập nhật trường memo ngắn trên job_applications để hiển thị nhanh trong bảng
      jobApplication.memo = note.trim();
      await jobApplication.save();

      const memoWithRelations = await JobApplicationMemo.findByPk(memo.id, {
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            attributes: ['id', 'jobCode', 'title', 'titleEn', 'titleJp']
          },
          {
            model: Admin,
            as: 'creator',
            required: false,
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Tạo memo thành công',
        data: { memo: memoWithRelations }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update memo for a job application
   * PUT /api/admin/job-applications/:id/memos/:memoId
   * Only SuperAdmin (role = 1) can update
   */
  updateMemo: async (req, res, next) => {
    try {
      const { id, memoId } = req.params;
      const { note, jobId } = req.body;

      if (!req.admin || req.admin.role !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Chỉ Super Admin mới được sửa memo'
        });
      }

      const memo = await JobApplicationMemo.findByPk(memoId);
      if (!memo || memo.jobApplicationId !== parseInt(id, 10)) {
        return res.status(404).json({
          success: false,
          message: 'Memo không tồn tại'
        });
      }

      let suggestedJob = null;
      if (jobId !== undefined) {
        if (jobId) {
          suggestedJob = await Job.findByPk(jobId);
          if (!suggestedJob) {
            return res.status(404).json({
              success: false,
              message: 'Job gợi ý không tồn tại'
            });
          }
          memo.jobId = suggestedJob.id;
        } else {
          memo.jobId = null;
        }
      }

      if (note !== undefined && note !== null) {
        const trimmed = String(note).trim();
        if (!trimmed) {
          return res.status(400).json({
            success: false,
            message: 'Nội dung memo là bắt buộc'
          });
        }
        memo.note = trimmed;
      }

      await memo.save();

      // Đồng bộ memo ngắn trên job_applications bằng memo mới nhất
      const latestMemo = await JobApplicationMemo.findOne({
        where: { jobApplicationId: id },
        order: [['created_at', 'DESC']]
      });
      const jobApplication = await JobApplication.findByPk(id);
      if (jobApplication) {
        jobApplication.memo = latestMemo ? latestMemo.note : null;
        await jobApplication.save();
      }

      const memoWithRelations = await JobApplicationMemo.findByPk(memo.id, {
        include: [
          {
            model: Job,
            as: 'job',
            required: false,
            attributes: ['id', 'jobCode', 'title', 'titleEn', 'titleJp']
          },
          {
            model: Admin,
            as: 'creator',
            required: false,
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Cập nhật memo thành công',
        data: { memo: memoWithRelations }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job application status
   * PATCH /api/admin/job-applications/:id/status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, rejectNote, paymentAmount } = req.body;

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái là bắt buộc'
        });
      }

      const statusNum = parseInt(status, 10);
      if (Number.isNaN(statusNum) || statusNum < 1 || statusNum > 17) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ (phải từ 1 đến 17)'
        });
      }

      // Khi chuyển sang Đã thanh toán (15), bắt buộc nhập số tiền
      if (statusNum === STATUS_PAID) {
        const amount = paymentAmount != null ? parseFloat(paymentAmount) : NaN;
        if (Number.isNaN(amount) || amount < 0) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập số tiền thanh toán hợp lệ'
          });
        }
      }

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      // Kiểm tra quyền AdminBackOffice
      const hasPermission = await checkAdminBackOfficePermission(req.admin, jobApplication);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật trạng thái đơn ứng tuyển này. Chỉ có thể cập nhật đơn của CTV được phân công cho bạn.'
        });
      }

      const oldData = jobApplication.toJSON();
      const oldStatus = jobApplication.status;

      jobApplication.status = statusNum;
      if (rejectNote !== undefined) {
        jobApplication.rejectNote = rejectNote;
      }

      await jobApplication.save();

      // Cập nhật CV status/phase dựa trên job application status
      if (jobApplication.cvCode) {
        try {
          const cv = await CVStorage.findOne({
            where: { code: jobApplication.cvCode }
          });

          if (cv) {
            // Map job application status sang CV phase/status
            // Status mapping:
            // 1: Admin đang xử lý hồ sơ -> CV status giữ nguyên
            // 2: Đang tiến cử -> CV status = 1 (active)
            // 3-7: Các giai đoạn -> CV status = 1 (active)
            // 8: Đã nyusha -> CV status = 1 (active)
            // 9-11: Thanh toán -> CV status = 1 (active)
            // 12, 15, 16, 17: Từ chối/Hủy -> CV status có thể giữ nguyên hoặc = 2 (archived)
            
            let newCVStatus = cv.status; // Giữ nguyên mặc định
            
            if (jobApplication.status >= 2 && jobApplication.status <= 11) {
              // Các status tích cực -> active
              newCVStatus = 1;
            } else if (jobApplication.status === 12 || jobApplication.status === 15 || 
                       jobApplication.status === 16 || jobApplication.status === 17) {
              // Từ chối/Hủy -> có thể archive hoặc giữ nguyên
              // Tạm thời giữ nguyên, có thể thay đổi logic sau
              newCVStatus = cv.status;
            }

            if (cv.status !== newCVStatus) {
              cv.status = newCVStatus;
              await cv.save();
              console.log(`[Job Application] Đã cập nhật CV status: ${cv.code} -> ${newCVStatus}`);
            }
          }
        } catch (cvError) {
          console.error('[Job Application] Error updating CV status:', cvError);
          // Không throw error, chỉ log
        }
      }

      // Khi chuyển sang Đã thanh toán (15): tạo/cập nhật payment_request với số tiền nhập vào
      if (statusNum === STATUS_PAID && jobApplication.collaboratorId) {
        try {
          const amount = parseFloat(paymentAmount);
          let paymentRequest = await PaymentRequest.findOne({
            where: { jobApplicationId: jobApplication.id }
          });

          if (paymentRequest) {
            paymentRequest.amount = amount;
            paymentRequest.status = 3; // Đã thanh toán
            await paymentRequest.save();
          } else {
            await PaymentRequest.create({
              collaboratorId: jobApplication.collaboratorId,
              jobApplicationId: jobApplication.id,
              amount,
              status: 3 // Đã thanh toán
            });
          }
        } catch (paymentError) {
          console.error('[Payment Request] Error creating/updating payment on status=paid:', paymentError);
          return res.status(500).json({
            success: false,
            message: 'Không thể lưu thông tin thanh toán'
          });
        }
      }

      // Tự động tạo tin nhắn trạng thái nếu có thay đổi (jobApplicationId số để Message lưu đúng, GET messages trả về đủ)
      if (oldStatus !== statusNum) {
        try {
          await statusMessageService.createStatusMessage({
            jobApplicationId: parseInt(id, 10),
            oldStatus,
            newStatus: statusNum,
            adminId: req.admin.id,
            note: rejectNote !== undefined && rejectNote !== null ? String(rejectNote).trim() || null : null,
            paymentAmount: statusNum === STATUS_PAID && paymentAmount != null ? parseFloat(paymentAmount) : null
          });
        } catch (messageError) {
          console.error('[Job Application] Error creating status message:', messageError);
          // Không throw error để không ảnh hưởng đến việc update status
        }
      }

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'update_status',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: jobApplication.toJSON(),
        description: `Cập nhật trạng thái đơn ứng tuyển #${id}: ${status}`
      });

      res.json({
        success: true,
        message: 'Cập nhật trạng thái đơn ứng tuyển thành công',
        data: { jobApplication }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete job application (soft delete)
   * DELETE /api/admin/job-applications/:id
   */
  deleteJobApplication: async (req, res, next) => {
    try {
      const { id } = req.params;

      const jobApplication = await JobApplication.findByPk(id);
      if (!jobApplication) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn ứng tuyển'
        });
      }

      const oldData = jobApplication.toJSON();

      // Soft delete
      await jobApplication.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'JobApplication',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa đơn ứng tuyển #${id}`
      });

      res.json({
        success: true,
        message: 'Xóa đơn ứng tuyển thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

