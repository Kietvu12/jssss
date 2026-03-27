import { CVStorage, Collaborator, Admin, ActionLog, JobApplication } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';
import config from '../../config/index.js';
import { checkDuplicateCV, handleDuplicateCV, markOverdueCVsAndPromoteDuplicates } from '../../utils/cvDuplicateChecker.js';
import { CV_STATUS_NEW } from '../../constants/cvStatus.js';
import { uploadBufferToS3, buildCvRirekishoPdfKey, buildCvShokumuPdfKey, buildCvOriginalKey, isS3Key, deleteFileFromS3, s3Enabled, getCvSnapshotDateTime, buildCvOriginalFolderKey, buildCvTemplateFolderKey, buildCvTemplateFileKey, uploadCvOriginalsToSnapshot, copyCvOriginalsToNewSnapshot, copySingleFileToCvOriginalSnapshot, isFolderPath } from '../../services/s3Service.js';
import { generateCvRirekishoPdfBuffer, generateCvShokumuPdfBuffer } from '../../services/cvPdfService.js';
import { saveCvOriginalsAndTemplatesForCv } from '../../services/cvSnapshotService.js';
import {
  parseBulkImportExcel,
  buildCvFileMapFromZip,
  buildCvDataFromImportRow,
  resolveCvAttachments,
  buildBulkImportPreview
} from '../../services/cvBulkImportService.js';
import { generateCvTemplateHtml } from '../../utils/cvTemplateHtml.js';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'approvedAt': 'approved_at'
  };
  return fieldMap[fieldName] || fieldName;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '../../../');
const uploadDir = path.resolve(backendRoot, config.upload.dir, 'cvs');
// Khi dùng S3: multer lưu vào memory (không ghi đĩa). Khi không S3: ghi vào uploadDir (local).
if (!s3Enabled()) {
  fs.mkdir(uploadDir, { recursive: true }).catch((err) => {
    console.error('[cvController] Không tạo được thư mục upload:', uploadDir, err.message);
  });
}

const storage = s3Enabled()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => { cb(null, uploadDir); },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `cv-${uniqueSuffix}${ext}`);
      }
    });

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatarPhoto') {
    const imgTypes = /jpeg|jpg|png|gif|webp/;
    const extOk = imgTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = (file.mimetype && file.mimetype.startsWith('image/')) || !file.mimetype;
    return extOk && mimeOk ? cb(null, true) : cb(new Error('Ảnh chân dung: chỉ chấp nhận JPG, PNG, GIF, WEBP'));
  }
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, JPG, JPEG, PNG'));
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter
}).fields([{ name: 'cvFile', maxCount: 10 }, { name: 'avatarPhoto', maxCount: 1 }]);

const bulkImportMaxBytes = Math.max(config.upload.maxFileSize * 30, 80 * 1024 * 1024);
const bulkImportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: bulkImportMaxBytes },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'excelFile') {
      const ok = /\.xlsx$/i.test(file.originalname || '');
      return ok ? cb(null, true) : cb(new Error('excelFile: chỉ chấp nhận .xlsx'));
    }
    if (file.fieldname === 'cvZip') {
      const ok = /\.zip$/i.test(file.originalname || '') || !file.originalname;
      return ok ? cb(null, true) : cb(new Error('cvZip: chỉ chấp nhận .zip'));
    }
    cb(new Error('Trường file không hợp lệ'));
  }
}).fields([
  { name: 'excelFile', maxCount: 1 },
  { name: 'cvZip', maxCount: 1 }
]);

/** Số dòng import chạy song song (I/O CV + snapshot; giới hạn tránh quá tải DB/mạng). */
const BULK_IMPORT_CONCURRENCY = 5;
const BULK_IMPORT_CODE_RETRIES = 12;

function isUniqueConstraintError(err) {
  return (
    err?.name === 'SequelizeUniqueConstraintError' ||
    err?.parent?.code === 'ER_DUP_ENTRY' ||
    err?.original?.code === 'ER_DUP_ENTRY'
  );
}

/** Chuỗi hóa create + duplicate theo ứng viên để tránh race khi nhiều dòng cùng email. */
function bulkImportIdentityLockKey(cvData) {
  const e = String(cvData?.email ?? '').trim().toLowerCase();
  if (e) return `e:${e}`;
  const ph = String(cvData?.phone ?? '').trim();
  if (ph) return `p:${ph}`;
  const n = String(cvData?.name ?? '').trim().toLowerCase();
  return `n:${n}`;
}

function createBulkImportDedupeLock() {
  const tails = new Map();
  return async function runExclusive(key, fn) {
    const k = key ?? '__row__';
    const prev = tails.get(k) || Promise.resolve();
    const task = prev.then(fn);
    tails.set(k, task.catch(() => {}));
    return task;
  };
}

async function mapPool(items, limit, fn) {
  const n = items.length;
  const results = new Array(n);
  if (n === 0) return results;
  let nextIndex = 0;
  const workerCount = Math.min(Math.max(limit, 1), n);
  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const i = nextIndex++;
      if (i >= n) break;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * CV Management Controller (Admin)
 */
export const cvController = {
  /**
   * Get list of CVs
   * GET /api/admin/cvs
   */
  getCVs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        collaboratorId,
        adminId,
        startDate,
        endDate,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search by name, email, or code
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by collaborator
      if (collaboratorId) {
        where.collaboratorId = parseInt(collaboratorId);
      }

      // Filter by admin - chỉ lọc khi explicit adminId được truyền
      // Mặc định: SuperAdmin và AdminBackOffice đều xem được toàn bộ danh sách
      if (adminId) {
        where.adminId = parseInt(adminId);
      }

      // Filter by date range
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.created_at[Op.lte] = new Date(endDate);
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'name', 'code'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause - always add id as secondary sort for consistency
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']); // Secondary sort by id ascending
      }

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        include: [
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
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count for each CV
      const cvCodes = rows.map(cv => cv.code).filter(code => code);
      if (cvCodes.length > 0) {
        const codesPlaceholder = cvCodes.map(() => '?').join(',');
        const applicationsCounts = await sequelize.query(
          `SELECT cv_code, COUNT(*) as count 
           FROM job_applications 
           WHERE cv_code IN (${codesPlaceholder})
           AND deleted_at IS NULL
           GROUP BY cv_code`,
          {
            replacements: cvCodes,
            type: sequelize.QueryTypes.SELECT
          }
        );

        const countMap = {};
        applicationsCounts.forEach(item => {
          countMap[item.cv_code] = parseInt(item.count);
        });

        // Add applicationsCount to each CV
        rows.forEach(cv => {
          cv.dataValues.applicationsCount = countMap[cv.code] || 0;
        });
      } else {
        rows.forEach(cv => {
          cv.dataValues.applicationsCount = 0;
        });
      }

      // Bổ sung collaborator và admin từ job_applications nếu cv_storages không có
      if (cvCodes.length > 0) {
        const codesPlaceholder2 = cvCodes.map(() => '?').join(',');
        const enrichSimple = await sequelize.query(
          `SELECT cv_code, collaborator_id, admin_responsible_id, created_at
           FROM job_applications
           WHERE cv_code IN (${codesPlaceholder2}) AND deleted_at IS NULL
           ORDER BY created_at DESC`,
          { replacements: cvCodes, type: sequelize.QueryTypes.SELECT }
        );
        const latestByCode = {};
        for (const row of enrichSimple) {
          if (!latestByCode[row.cv_code]) latestByCode[row.cv_code] = row;
        }
        const collaboratorIds = [...new Set(enrichSimple.map(r => r.collaborator_id).filter(Boolean))];
        const adminIds = [...new Set(enrichSimple.map(r => r.admin_responsible_id).filter(Boolean))];
        let collaboratorsMap = {};
        let adminsMap = {};
        if (collaboratorIds.length > 0) {
          const collaborators = await Collaborator.findAll({
            where: { id: collaboratorIds },
            attributes: ['id', 'name', 'email', 'code']
          });
          collaboratorsMap = Object.fromEntries(collaborators.map(c => [c.id, c]));
        }
        if (adminIds.length > 0) {
          const admins = await Admin.findAll({
            where: { id: adminIds },
            attributes: ['id', 'name', 'email']
          });
          adminsMap = Object.fromEntries(admins.map(a => [a.id, a]));
        }
        rows.forEach(cv => {
          const latest = latestByCode[cv.code];
          if (!latest) return;
          if (!cv.collaborator && latest.collaborator_id && collaboratorsMap[latest.collaborator_id]) {
            cv.dataValues.collaborator = collaboratorsMap[latest.collaborator_id].toJSON();
          }
          if (!cv.admin && latest.admin_responsible_id && adminsMap[latest.admin_responsible_id]) {
            cv.dataValues.admin = adminsMap[latest.admin_responsible_id].toJSON();
          }
        });
      }

      res.json({
        success: true,
        data: {
          cvs: rows,
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
   * Get CV by ID
   * GET /api/admin/cvs/:id
   */
  getCVById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id, {
        include: [
          {
            model: Collaborator,
            as: 'collaborator',
            required: false,
            attributes: ['id', 'name', 'email', 'code', 'phone']
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: JobApplication,
            as: 'jobApplications',
            required: false,
            attributes: ['id', 'jobId', 'status', 'appliedAt'],
            limit: 10
          }
        ]
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      res.json({
        success: true,
        data: { cv }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new CV
   * POST /api/admin/cvs
   */
  createCV: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        try {
          const rawData = req.body;
          
          // Generate code if not provided
          const cvCode = rawData.code || `CV-${uuidv4().substring(0, 8).toUpperCase()}`;

          // Check if code already exists
          const existingCV = await CVStorage.findOne({ where: { code: cvCode } });
          if (existingCV) {
            return res.status(409).json({
              success: false,
              message: 'Mã CV đã tồn tại'
            });
          }

          // File CV gốc (cvFile) sẽ được lưu vào cvs/{id}/cv-original.* sau khi tạo CV

          // Map frontend fields to backend model fields and parse JSON strings
          const cvData = {
            // Map name fields
            name: rawData.nameKanji || rawData.name || null,
            furigana: rawData.nameKana || rawData.furigana || null,
            
            // Map contact fields
            email: rawData.email || null,
            phone: rawData.phone || null,
            postalCode: rawData.postalCode || null,
            addressCurrent: rawData.address || rawData.addressCurrent || null,
            
            // Map personal info
            birthDate: rawData.birthDate || null,
            ages: rawData.age || rawData.ages || null,
            gender: rawData.gender ? (rawData.gender === '男' || rawData.gender === '1' ? 1 : rawData.gender === '女' || rawData.gender === '2' ? 2 : null) : null,
            
            // Parse JSON fields (educations, workExperiences, certificates)
            educations: rawData.educations 
              ? (typeof rawData.educations === 'string' 
                  ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null)
                  : Array.isArray(rawData.educations) ? rawData.educations : null)
              : null,
            workExperiences: rawData.workExperiences
              ? (typeof rawData.workExperiences === 'string'
                  ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null)
                  : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null)
              : null,
            certificates: rawData.certificates
              ? (typeof rawData.certificates === 'string'
                  ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null)
                  : Array.isArray(rawData.certificates) ? rawData.certificates : null)
              : null,
            
            // Map skills and summary
            technicalSkills: rawData.technicalSkills || null,
            careerSummary: rawData.careerSummary || null,
            strengths: rawData.strengths || null,
            motivation: rawData.motivation || null,
            
            // Map preferences
            currentIncome: rawData.currentSalary ? parseInt(rawData.currentSalary.replace(/[^\d]/g, '')) || null : null,
            desiredIncome: rawData.desiredSalary ? parseInt(rawData.desiredSalary.replace(/[^\d]/g, '')) || null : null,
            desiredWorkLocation: rawData.desiredLocation || rawData.desiredWorkLocation || null,
            desiredPosition: rawData.desiredPosition || null,
            nyushaTime: rawData.desiredStartDate || rawData.nyushaTime || null,
            
            // Other fields that might be sent
            addressOrigin: rawData.addressOrigin || null,
            passport: rawData.passport === '有' || rawData.passport === '1' ? 1 : (rawData.passport === '無' || rawData.passport === '0' ? 0 : (parseInt(rawData.passport) || null)),
            currentResidence: rawData.currentResidence ? parseInt(rawData.currentResidence) : null,
            jpResidenceStatus: rawData.jpResidenceStatus ? parseInt(rawData.jpResidenceStatus) : null,
            visaExpirationDate: rawData.visaExpirationDate || null,
            otherCountry: rawData.otherCountry || null,
            spouse: rawData.hasSpouse !== undefined ? (rawData.hasSpouse === '1' || rawData.hasSpouse === 1 ? 1 : 0) : (rawData.spouse ? parseInt(rawData.spouse) : null),
            interviewTime: rawData.interviewTime || null,
            learnedTools: rawData.learnedTools 
              ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools)
              : null,
            experienceTools: rawData.experienceTools
              ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools)
              : null,
            jlptLevel: (() => {
              const v = rawData.jlptLevel;
              if (!v) return null;
              const num = typeof v === 'string' && v.startsWith('N') ? parseInt(v.replace('N', ''), 10) : parseInt(v, 10);
              return (Number.isNaN(num) ? null : num);
            })(),
            experienceYears: rawData.experienceYears ? parseInt(rawData.experienceYears) : null,
            specialization: rawData.specialization ? parseInt(rawData.specialization) : null,
            qualification: rawData.qualification ? parseInt(rawData.qualification) : null,
            otherDocuments: rawData.otherDocuments || null,
            notes: rawData.notes || null,
          };

          // Remove null/undefined values to avoid overwriting with null
          Object.keys(cvData).forEach(key => {
            if (cvData[key] === null || cvData[key] === undefined) {
              delete cvData[key];
            }
          });

          // Validate collaboratorId if provided - if not exists, set to null silently
          let collaboratorId = null;
          if (rawData.collaboratorId) {
            const collaboratorIdInt = parseInt(rawData.collaboratorId);
            if (!isNaN(collaboratorIdInt) && collaboratorIdInt > 0) {
              // Check if collaborator exists
              const collaborator = await Collaborator.findByPk(collaboratorIdInt);
              if (collaborator) {
                collaboratorId = collaboratorIdInt;
              } else {
                // If collaborator doesn't exist, silently set to null
                // This allows creating CV even if CTV ID is incorrect
                collaboratorId = null;
                console.warn(`Collaborator ID ${collaboratorIdInt} not found, setting to null for CV creation`);
              }
            }
          }

          // Create CV (curriculumVitae set sau khi generate PDF)
          const cv = await CVStorage.create({
            code: cvCode,
            collaboratorId: collaboratorId,
            adminId: req.admin.id, // Admin tạo CV
            curriculumVitae: null,
            ...cvData,
            status: CV_STATUS_NEW,
            isDuplicate: false,
            duplicateWithCvId: null
          });

          // Check for duplicate CV
          let duplicateResult = null;
          const cvName = cvData.name;
          const cvEmail = cvData.email;
          const cvPhone = cvData.phone;
          if (cvName || cvEmail || cvPhone) {
            const duplicateCV = await checkDuplicateCV(cvName, cvEmail, cvPhone);
            if (duplicateCV && duplicateCV.id !== cv.id) {
              duplicateResult = await handleDuplicateCV(duplicateCV, cv);
            }
          }

          // Reload with relations
          await cv.reload({
            include: [
              {
                model: Collaborator,
                as: 'collaborator',
                required: false
              },
              {
                model: Admin,
                as: 'admin',
                required: false
              }
            ]
          });

          // Log action
          await ActionLog.create({
            adminId: req.admin.id,
            object: 'CVStorage',
            action: 'create',
            ip: req.ip || req.connection.remoteAddress,
            after: cv.toJSON(),
            description: `Tạo mới CV: ${cv.code} - ${cv.name || 'N/A'}`
          });

          const hasFiles = !!(req.files?.cvFile?.[0] || req.files?.avatarPhoto?.[0]);
          if (!hasFiles && !rawData.avatarBase64) {
            console.warn('[Admin createCV] Không có file upload (cvFile/avatarPhoto) và không có avatarBase64.');
          }
          let avatarDataUrl = '';
          if (req.files?.avatarPhoto?.[0]) {
            try {
              const f = req.files.avatarPhoto[0];
              const buf = f.buffer || (f.path ? await fs.readFile(f.path) : null);
              if (buf) {
                const mime = f.mimetype || 'image/jpeg';
                avatarDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
              }
            } catch (e) {
              console.warn('[Admin createCV] Đọc ảnh chân dung thất bại:', e.message);
            }
            if (req.files.avatarPhoto[0].path) await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
          }
          if (!avatarDataUrl && rawData.avatarBase64 && typeof rawData.avatarBase64 === 'string' && rawData.avatarBase64.startsWith('data:image/')) {
            avatarDataUrl = rawData.avatarBase64;
          }

          await saveCvOriginalsAndTemplatesForCv(cv, {
            cvFiles: req.files?.cvFile || [],
            avatarDataUrl,
            backendRoot,
            uploadDir,
            logPrefix: '[Admin createCV]'
          });

          if (req.files?.cvFile) {
            for (const f of req.files.cvFile) { if (f.path) await fs.unlink(f.path).catch(() => {}); }
          }

          const responseData = {
            success: true,
            message: 'Tạo CV thành công',
            data: { cv }
          };

          // Thêm thông tin duplicate nếu có
          if (duplicateResult) {
            responseData.data.duplicateInfo = {
              isDuplicate: duplicateResult.isDuplicate,
              duplicateWithCvId: duplicateResult.duplicateWithCvId,
              message: duplicateResult.message
            };
            if (duplicateResult.isDuplicate) {
              responseData.message = 'Tạo CV thành công nhưng CV bị trùng với CV đã tồn tại';
            }
          }

          res.status(201).json(responseData);
        } catch (error) {
          if (req.files?.cvFile) {
            for (const f of req.files.cvFile) { if (f.path) await fs.unlink(f.path).catch(() => {}); }
          }
          if (req.files?.avatarPhoto?.[0]?.path) await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xem trước import — chỉ parse Excel + khớp ZIP, không tạo bản ghi.
   * POST /api/admin/cvs/bulk-import/preview
   */
  bulkImportPreview: async (req, res, next) => {
    try {
      bulkImportUpload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        try {
          const excelBuf = req.files?.excelFile?.[0]?.buffer;
          if (!excelBuf?.length) {
            return res.status(400).json({
              success: false,
              message: 'Thiếu file excelFile (.xlsx)'
            });
          }
          const zipBuf = req.files?.cvZip?.[0]?.buffer;
          const data = await buildBulkImportPreview(excelBuf, zipBuf);
          return res.json({ success: true, data });
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Import hàng loạt từ Excel (.xlsx) — mọi sheet, dòng 1 = header.
   * multipart: excelFile (bắt buộc), cvZip (khuyến nghị: ZIP chứa file CV, khớp basename cột "CV đính kèm").
   * Body: collaboratorId (tùy chọn).
   * POST /api/admin/cvs/bulk-import
   */
  bulkImportCVs: async (req, res, next) => {
    try {
      bulkImportUpload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        try {
          const excelBuf = req.files?.excelFile?.[0]?.buffer;
          if (!excelBuf?.length) {
            return res.status(400).json({
              success: false,
              message: 'Thiếu file excelFile (.xlsx)'
            });
          }
          const zipBuf = req.files?.cvZip?.[0]?.buffer;

          let collaboratorId = null;
          if (req.body?.collaboratorId) {
            const cid = parseInt(req.body.collaboratorId, 10);
            if (!isNaN(cid) && cid > 0) {
              const collaborator = await Collaborator.findByPk(cid);
              if (collaborator) collaboratorId = cid;
            }
          }

          const zipMap = buildCvFileMapFromZip(zipBuf);
          const parsedRows = await parseBulkImportExcel(excelBuf);

          const runExclusive = createBulkImportDedupeLock();
          const clientIp = req.ip || req.connection.remoteAddress;

          const rowOutcomes = await mapPool(parsedRows, BULK_IMPORT_CONCURRENCY, async ({ sheetName, rowNumber, canon }) => {
            const rowCtx = buildCvDataFromImportRow(canon, sheetName, rowNumber);
            const { cvData, cvRelPaths, warnings: rowWarnings } = rowCtx;
            const warnings = [...rowWarnings];

            if (!rowCtx.hasMinimalIdentity) {
              return {
                kind: 'skipped',
                payload: {
                  sheet: sheetName,
                  row: rowNumber,
                  reason: 'Thiếu Họ & tên và Email (cần ít nhất một trong hai)'
                }
              };
            }

            const { files: cvFiles, warnings: attachWarn } = await resolveCvAttachments(zipMap, cvRelPaths);
            warnings.push(...attachWarn);

            const lockKey = bulkImportIdentityLockKey(cvData);

            const dbBlock = await runExclusive(lockKey, async () => {
              let cv;
              let lastErr;
              for (let attempt = 0; attempt < BULK_IMPORT_CODE_RETRIES; attempt++) {
                const cvCode = `CV-${uuidv4().substring(0, 8).toUpperCase()}`;
                try {
                  cv = await CVStorage.create({
                    code: cvCode,
                    collaboratorId,
                    adminId: req.admin.id,
                    curriculumVitae: null,
                    ...cvData,
                    status: CV_STATUS_NEW,
                    isDuplicate: false,
                    duplicateWithCvId: null
                  });
                  lastErr = null;
                  break;
                } catch (createErr) {
                  lastErr = createErr;
                  if (isUniqueConstraintError(createErr)) continue;
                  return {
                    ok: false,
                    error: createErr.message || 'Không tạo được bản ghi CV'
                  };
                }
              }
              if (!cv) {
                return {
                  ok: false,
                  error: lastErr?.message || 'Không gán được mã CV duy nhất'
                };
              }

              let duplicateResult = null;
              try {
                const dup = await checkDuplicateCV(cvData.name, cvData.email, cvData.phone);
                if (dup && dup.id !== cv.id) {
                  duplicateResult = await handleDuplicateCV(dup, cv);
                }
              } catch (dupErr) {
                console.warn('[bulkImportCVs] checkDuplicate:', dupErr.message);
              }

              await cv.reload({
                include: [
                  { model: Collaborator, as: 'collaborator', required: false },
                  { model: Admin, as: 'admin', required: false }
                ]
              });

              return { ok: true, cv, duplicateResult };
            });

            if (!dbBlock.ok) {
              return {
                kind: 'failed',
                payload: {
                  sheet: sheetName,
                  row: rowNumber,
                  error: dbBlock.error
                }
              };
            }

            const { cv, duplicateResult } = dbBlock;

            try {
              await saveCvOriginalsAndTemplatesForCv(cv, {
                cvFiles,
                avatarDataUrl: '',
                backendRoot,
                uploadDir,
                logPrefix: `[bulkImport ${sheetName}#${rowNumber}]`
              });
            } catch (pipeErr) {
              console.warn('[bulkImportCVs] Pipeline:', pipeErr.message);
            }

            const entry = {
              id: cv.id,
              code: cv.code,
              name: cv.name,
              sheet: sheetName,
              row: rowNumber,
              warnings
            };
            if (duplicateResult) {
              entry.duplicateInfo = {
                isDuplicate: duplicateResult.isDuplicate,
                duplicateWithCvId: duplicateResult.duplicateWithCvId,
                message: duplicateResult.message
              };
            }

            return {
              kind: 'created',
              entry,
              logRow: {
                adminId: req.admin.id,
                object: 'CVStorage',
                action: 'create',
                ip: clientIp,
                after: cv.toJSON(),
                description: `Import Excel — ${sheetName} dòng ${rowNumber}: ${cv.code} - ${cv.name || 'N/A'}`
              }
            };
          });

          const created = [];
          const skipped = [];
          const failed = [];
          const logRows = [];
          for (const o of rowOutcomes) {
            if (o.kind === 'created') {
              created.push(o.entry);
              logRows.push(o.logRow);
            } else if (o.kind === 'skipped') {
              skipped.push(o.payload);
            } else if (o.kind === 'failed') {
              failed.push(o.payload);
            }
          }

          if (logRows.length) {
            await ActionLog.bulkCreate(logRows);
          }

          return res.status(200).json({
            success: true,
            message: `Đã xử lý ${parsedRows.length} dòng: ${created.length} tạo mới, ${skipped.length} bỏ qua, ${failed.length} lỗi tạo bản ghi`,
            data: {
              created,
              skipped,
              failed,
              totalRows: parsedRows.length,
              zipFileCount: zipMap.size
            }
          });
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update CV
   * PUT /api/admin/cvs/:id
   */
  updateCV: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        try {
          const { id } = req.params;
          const rawData = req.body;

          const cv = await CVStorage.findByPk(id);
          if (!cv) {
            return res.status(404).json({
              success: false,
              message: 'Không tìm thấy CV'
            });
          }

          // Store old data for log
          const oldData = cv.toJSON();

          // Check if code is being changed and if it's unique
          if (rawData.code && rawData.code !== cv.code) {
            const existingCV = await CVStorage.findOne({
              where: { code: rawData.code, id: { [Op.ne]: id } }
            });
            if (existingCV) {
              return res.status(409).json({
                success: false,
                message: 'Mã CV đã tồn tại'
              });
            }
          }

          // Validate collaboratorId if provided - if not exists, set to null silently
          if (rawData.collaboratorId !== undefined) {
            if (rawData.collaboratorId) {
              const collaboratorIdInt = parseInt(rawData.collaboratorId);
              if (!isNaN(collaboratorIdInt) && collaboratorIdInt > 0) {
                // Check if collaborator exists
                const collaborator = await Collaborator.findByPk(collaboratorIdInt);
                if (collaborator) {
                  cv.collaboratorId = collaboratorIdInt;
                } else {
                  // If collaborator doesn't exist, silently set to null
                  // This allows updating CV even if CTV ID is incorrect
                  cv.collaboratorId = null;
                  console.warn(`Collaborator ID ${collaboratorIdInt} not found, setting to null for CV update`);
                }
              } else {
                cv.collaboratorId = null;
              }
            } else {
              // Empty string or null - set to null
              cv.collaboratorId = null;
            }
          }

          // Map frontend fields to backend model fields and parse JSON strings
          const updateData = {
            // Map name fields
            name: rawData.nameKanji !== undefined ? (rawData.nameKanji || null) : undefined,
            furigana: rawData.nameKana !== undefined ? (rawData.nameKana || null) : undefined,
            
            // Map contact fields
            email: rawData.email !== undefined ? (rawData.email || null) : undefined,
            phone: rawData.phone !== undefined ? (rawData.phone || null) : undefined,
            postalCode: rawData.postalCode !== undefined ? (rawData.postalCode || null) : undefined,
            addressCurrent: rawData.address !== undefined ? (rawData.address || rawData.addressCurrent || null) : undefined,
            
            // Map personal info
            birthDate: rawData.birthDate !== undefined ? (rawData.birthDate || null) : undefined,
            ages: rawData.age !== undefined ? (rawData.age || rawData.ages || null) : undefined,
            gender: rawData.gender !== undefined 
              ? (rawData.gender ? (rawData.gender === '男' || rawData.gender === '1' ? 1 : rawData.gender === '女' || rawData.gender === '2' ? 2 : null) : null)
              : undefined,
            
            // Parse JSON fields (educations, workExperiences, certificates)
            educations: rawData.educations !== undefined
              ? (rawData.educations 
                  ? (typeof rawData.educations === 'string' 
                      ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null)
                      : Array.isArray(rawData.educations) ? rawData.educations : null)
                  : null)
              : undefined,
            workExperiences: rawData.workExperiences !== undefined
              ? (rawData.workExperiences
                  ? (typeof rawData.workExperiences === 'string'
                      ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null)
                      : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null)
                  : null)
              : undefined,
            certificates: rawData.certificates !== undefined
              ? (rawData.certificates
                  ? (typeof rawData.certificates === 'string'
                      ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null)
                      : Array.isArray(rawData.certificates) ? rawData.certificates : null)
                  : null)
              : undefined,
            
            // Map skills and summary
            technicalSkills: rawData.technicalSkills !== undefined ? (rawData.technicalSkills || null) : undefined,
            careerSummary: rawData.careerSummary !== undefined ? (rawData.careerSummary || null) : undefined,
            strengths: rawData.strengths !== undefined ? (rawData.strengths || null) : undefined,
            motivation: rawData.motivation !== undefined ? (rawData.motivation || null) : undefined,
            
            // Map preferences
            currentIncome: rawData.currentSalary !== undefined 
              ? (rawData.currentSalary ? parseInt(rawData.currentSalary.replace(/[^\d]/g, '')) || null : null)
              : undefined,
            desiredIncome: rawData.desiredSalary !== undefined
              ? (rawData.desiredSalary ? parseInt(rawData.desiredSalary.replace(/[^\d]/g, '')) || null : null)
              : undefined,
            desiredWorkLocation: rawData.desiredLocation !== undefined 
              ? (rawData.desiredLocation || rawData.desiredWorkLocation || null)
              : undefined,
            desiredPosition: rawData.desiredPosition !== undefined ? (rawData.desiredPosition || null) : undefined,
            nyushaTime: rawData.desiredStartDate !== undefined 
              ? (rawData.desiredStartDate || rawData.nyushaTime || null)
              : undefined,
            
            // Other fields
            addressOrigin: rawData.addressOrigin !== undefined ? (rawData.addressOrigin || null) : undefined,
            passport: rawData.passport !== undefined
              ? (rawData.passport === '有' || rawData.passport === '1' ? 1 : (rawData.passport === '無' || rawData.passport === '0' ? 0 : (parseInt(rawData.passport) || null)))
              : undefined,
            currentResidence: rawData.currentResidence !== undefined ? (rawData.currentResidence ? parseInt(rawData.currentResidence) : null) : undefined,
            jpResidenceStatus: rawData.jpResidenceStatus !== undefined ? (rawData.jpResidenceStatus ? parseInt(rawData.jpResidenceStatus) : null) : undefined,
            visaExpirationDate: rawData.visaExpirationDate !== undefined ? (rawData.visaExpirationDate || null) : undefined,
            otherCountry: rawData.otherCountry !== undefined ? (rawData.otherCountry || null) : undefined,
            spouse: rawData.hasSpouse !== undefined
              ? (rawData.hasSpouse === '1' || rawData.hasSpouse === 1 ? 1 : 0)
              : (rawData.spouse !== undefined ? (rawData.spouse ? parseInt(rawData.spouse) : null) : undefined),
            interviewTime: rawData.interviewTime !== undefined ? (rawData.interviewTime || null) : undefined,
            learnedTools: rawData.learnedTools !== undefined
              ? (rawData.learnedTools 
                  ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools)
                  : null)
              : undefined,
            experienceTools: rawData.experienceTools !== undefined
              ? (rawData.experienceTools
                  ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools)
                  : null)
              : undefined,
            jlptLevel: rawData.jlptLevel !== undefined
              ? (rawData.jlptLevel
                  ? (typeof rawData.jlptLevel === 'string' && rawData.jlptLevel.startsWith('N')
                      ? parseInt(rawData.jlptLevel.replace('N', ''), 10)
                      : parseInt(rawData.jlptLevel, 10)) || null
                  : null)
              : undefined,
            experienceYears: rawData.experienceYears !== undefined ? (rawData.experienceYears ? parseInt(rawData.experienceYears) : null) : undefined,
            specialization: rawData.specialization !== undefined ? (rawData.specialization ? parseInt(rawData.specialization) : null) : undefined,
            qualification: rawData.qualification !== undefined ? (rawData.qualification ? parseInt(rawData.qualification) : null) : undefined,
            otherDocuments: rawData.otherDocuments !== undefined ? (rawData.otherDocuments || null) : undefined,
            notes: rawData.notes !== undefined ? (rawData.notes || null) : undefined,
          };

          // Update fields (only update if value is not undefined)
          Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
              cv[key] = updateData[key];
            }
          });

          await cv.save();

          // Reload with relations
          await cv.reload({
            include: [
              {
                model: Collaborator,
                as: 'collaborator',
                required: false
              },
              {
                model: Admin,
                as: 'admin',
                required: false
              }
            ]
          });

          // Log action
          await ActionLog.create({
            adminId: req.admin.id,
            object: 'CVStorage',
            action: 'edit',
            ip: req.ip || req.connection.remoteAddress,
            before: oldData,
            after: cv.toJSON(),
            description: `Cập nhật CV: ${cv.code} - ${cv.name || 'N/A'}`
          });

          let avatarDataUrl = '';
          if (req.files?.avatarPhoto?.[0]) {
            try {
              const f = req.files.avatarPhoto[0];
              const buf = f.buffer || (f.path ? await fs.readFile(f.path) : null);
              if (buf) {
                const mime = f.mimetype || 'image/jpeg';
                avatarDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
              }
            } catch (e) {
              console.warn('[Admin updateCV] Đọc ảnh chân dung thất bại:', e.message);
            }
            if (req.files.avatarPhoto[0].path) await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
          }
          if (!avatarDataUrl && rawData.avatarBase64 && typeof rawData.avatarBase64 === 'string' && rawData.avatarBase64.startsWith('data:image/')) {
            avatarDataUrl = rawData.avatarBase64;
          }

          const dateTime = getCvSnapshotDateTime();

          if (req.files?.cvFile?.length) {
            try {
              if (s3Enabled()) {
                cv.cvOriginalPath = await uploadCvOriginalsToSnapshot(cv.id, dateTime, req.files.cvFile);
              } else {
                const snapshotDir = path.join(uploadDir, String(cv.id), dateTime);
                const origDir = path.join(snapshotDir, 'CV_original');
                await fs.mkdir(origDir, { recursive: true });
                for (let i = 0; i < req.files.cvFile.length; i++) {
                  const f = req.files.cvFile[i];
                  const ext = (f.originalname && path.extname(f.originalname)) ? path.extname(f.originalname) : '.pdf';
                  const dest = path.join(origDir, `cv-original-${i + 1}${ext}`);
                  if (f.path) await fs.copyFile(f.path, dest);
                  else if (f.buffer) await fs.writeFile(dest, f.buffer);
                }
                cv.cvOriginalPath = path.relative(backendRoot, origDir);
              }
              await cv.save();
            } catch (e) {
              console.warn('[Admin updateCV] Lưu CV gốc thất bại:', e.message);
            }
            for (const f of req.files.cvFile) { if (f.path) await fs.unlink(f.path).catch(() => {}); }
          } else if (cv.cvOriginalPath) {
            try {
              if (s3Enabled()) {
                if (isFolderPath(cv.cvOriginalPath)) {
                  cv.cvOriginalPath = await copyCvOriginalsToNewSnapshot(cv.id, dateTime, cv.cvOriginalPath);
                } else {
                  cv.cvOriginalPath = await copySingleFileToCvOriginalSnapshot(cv.id, dateTime, cv.cvOriginalPath);
                }
              } else {
                const snapshotDir = path.join(uploadDir, String(cv.id), dateTime);
                const origDir = path.join(snapshotDir, 'CV_original');
                await fs.mkdir(origDir, { recursive: true });
                const oldPath = path.join(backendRoot, cv.cvOriginalPath);
                const stat = await fs.stat(oldPath).catch(() => null);
                if (stat?.isFile()) {
                  const ext = path.extname(cv.cvOriginalPath) || '.pdf';
                  await fs.copyFile(oldPath, path.join(origDir, `cv-original-1${ext}`));
                } else if (stat?.isDirectory()) {
                  const entries = await fs.readdir(oldPath);
                  for (let i = 0; i < entries.length; i++) {
                    await fs.copyFile(path.join(oldPath, entries[i]), path.join(origDir, `cv-original-${i + 1}${path.extname(entries[i]) || '.pdf'}`));
                  }
                }
                cv.cvOriginalPath = path.relative(backendRoot, origDir);
              }
              await cv.save();
            } catch (e) {
              console.warn('[Admin updateCV] Copy CV gốc sang snapshot mới thất bại:', e.message);
            }
          } else {
            if (s3Enabled()) {
              cv.cvOriginalPath = buildCvOriginalFolderKey(cv.id, dateTime);
            } else {
              const snapshotDir = path.join(uploadDir, String(cv.id), dateTime);
              const origDir = path.join(snapshotDir, 'CV_original');
              await fs.mkdir(origDir, { recursive: true });
              cv.cvOriginalPath = path.relative(backendRoot, origDir);
            }
            await cv.save();
          }

          const templateList = [
            { cvTemplate: 'common', dir: 'Common' },
            { cvTemplate: 'cv_it', dir: 'IT' },
            { cvTemplate: 'cv_technical', dir: 'Technical' }
          ];
          try {
            if (s3Enabled()) {
              for (const { cvTemplate: tpl, dir: templateDir } of templateList) {
                try {
                  const rirekishoBuffer = await generateCvRirekishoPdfBuffer(cv, { avatarDataUrl, cvTemplate: tpl });
                  if (rirekishoBuffer) {
                    const key = buildCvTemplateFileKey(cv.id, dateTime, templateDir, 'cv-rirekisho.pdf');
                    await uploadBufferToS3(rirekishoBuffer, key, 'application/pdf');
                  }
                  const shokumuBuffer = await generateCvShokumuPdfBuffer(cv, { avatarDataUrl, cvTemplate: tpl });
                  if (shokumuBuffer) {
                    const key = buildCvTemplateFileKey(cv.id, dateTime, templateDir, 'cv-shokumu.pdf');
                    await uploadBufferToS3(shokumuBuffer, key, 'application/pdf');
                  }
                } catch (e) {
                  console.warn(`[Admin updateCV] PDF ${templateDir} thất bại:`, e.message);
                }
              }
              cv.curriculumVitae = buildCvTemplateFolderKey(cv.id, dateTime);
            } else {
              const snapshotDir = path.join(uploadDir, String(cv.id), dateTime);
              const tplDir = path.join(snapshotDir, 'CV_Template');
              for (const { cvTemplate: tpl, dir: templateDir } of templateList) {
                const subDir = path.join(tplDir, templateDir);
                await fs.mkdir(subDir, { recursive: true });
                try {
                  const rirekishoBuffer = await generateCvRirekishoPdfBuffer(cv, { avatarDataUrl, cvTemplate: tpl });
                  if (rirekishoBuffer) await fs.writeFile(path.join(subDir, 'cv-rirekisho.pdf'), rirekishoBuffer);
                  const shokumuBuffer = await generateCvShokumuPdfBuffer(cv, { avatarDataUrl, cvTemplate: tpl });
                  if (shokumuBuffer) await fs.writeFile(path.join(subDir, 'cv-shokumu.pdf'), shokumuBuffer);
                } catch (e) {
                  console.warn(`[Admin updateCV] PDF ${templateDir} thất bại:`, e.message);
                }
              }
              cv.curriculumVitae = path.relative(backendRoot, tplDir);
            }
            if (cv.curriculumVitae) {
              await cv.save();
              await cv.reload({ include: [{ model: Collaborator, as: 'collaborator', required: false }, { model: Admin, as: 'admin', required: false }] });
            }
          } catch (e) {
            console.warn('[Admin updateCV] Không thể tạo PDF template:', e.message);
          }

          if (req.files?.cvFile) {
            for (const f of req.files.cvFile) { if (f.path) await fs.unlink(f.path).catch(() => {}); }
          }

          res.json({
            success: true,
            message: 'Cập nhật CV thành công',
            data: { cv }
          });
        } catch (error) {
          if (req.files?.cvFile) {
            for (const f of req.files.cvFile) { if (f.path) await fs.unlink(f.path).catch(() => {}); }
          }
          if (req.files?.avatarPhoto?.[0]?.path) await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete CV (soft delete)
   * DELETE /api/admin/cvs/:id
   */
  deleteCV: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      // Store old data for log
      const oldData = cv.toJSON();

      // Soft delete
      await cv.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'CVStorage',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa CV: ${cv.code} - ${cv.name || 'N/A'}`
      });

      res.json({
        success: true,
        message: 'Xóa CV thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get CV update history
   * GET /api/admin/cvs/:id/history
   */
  getCVHistory: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findByPk(id);
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV'
        });
      }

      // Get update history from action_logs
      // Search for logs where description contains CV code or id
      const history = await ActionLog.findAll({
        where: {
          object: 'CVStorage',
          [Op.or]: [
            { description: { [Op.like]: `%${cv.code}%` } },
            { after: { [Op.like]: `%"id":${id}%` } },
            { before: { [Op.like]: `%"id":${id}%` } }
          ]
        },
        include: [
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 50
      });

      res.json({
        success: true,
        data: {
          cv: {
            id: cv.id,
            code: cv.code,
            name: cv.name
          },
          history
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đánh dấu CV quá hạn và promote duplicate
   * POST /api/admin/cvs/mark-overdue
   */
  markOverdueCVs: async (req, res, next) => {
    try {
      const result = await markOverdueCVsAndPromoteDuplicates();
      res.json({
        success: true,
        message: `Đã đánh dấu ${result.markedOverdue} CV quá hạn, chuyển ${result.promoted} CV trùng sang Hồ sơ mới`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Preview CV template HTML (không lưu DB, chỉ render HTML theo cvTemplateHtml)
   * POST /api/admin/cvs/preview
   */
  previewCVTemplate: async (req, res, next) => {
    try {
      const rawData = req.body;

      const cvData = {
        name: rawData.nameKanji || rawData.name || null,
        nameKanji: rawData.nameKanji || rawData.name || null,
        furigana: rawData.nameKana || rawData.furigana || null,
        nameKana: rawData.nameKana || rawData.furigana || null,
        email: rawData.email || null,
        phone: rawData.phone || null,
        postalCode: rawData.postalCode || null,
        addressCurrent: rawData.address || rawData.addressCurrent || null,
        address: rawData.address || rawData.addressCurrent || null,
        birthDate: rawData.birthDate || null,
        ages: rawData.age || rawData.ages || null,
        age: rawData.age || rawData.ages || null,
        gender: rawData.gender ? (rawData.gender === '男' || rawData.gender === '1' ? 1 : rawData.gender === '女' || rawData.gender === '2' ? 2 : null) : null,
        passport: rawData.passport ?? null,
        skypeId: rawData.skypeId ?? null,
        nearestStationLine: rawData.nearestStationLine ?? null,
        nearestStationName: rawData.nearestStationName ?? null,
        dependentsCount: rawData.dependentsCount ?? null,
        hasSpouse: rawData.hasSpouse ?? null,
        spouseDependent: rawData.spouseDependent ?? null,
        jpResidenceStatus: rawData.jpResidenceStatus ?? null,
        visaExpirationDate: rawData.visaExpirationDate ?? null,
        educations: rawData.educations
          ? (typeof rawData.educations === 'string'
              ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null)
              : Array.isArray(rawData.educations) ? rawData.educations : null)
          : null,
        workExperiences: rawData.workExperiences
          ? (typeof rawData.workExperiences === 'string'
              ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null)
              : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null)
          : null,
        certificates: rawData.certificates
          ? (typeof rawData.certificates === 'string'
              ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null)
              : Array.isArray(rawData.certificates) ? rawData.certificates : null)
          : null,
        technicalSkills: rawData.technicalSkills || null,
        careerSummary: rawData.careerSummary || null,
        strengths: rawData.strengths || null,
        motivation: rawData.motivation || null,
        hobbiesSpecialSkills: rawData.hobbiesSpecialSkills || rawData.hobbiesOrSpecialSkills || null,
        hobbiesOrSpecialSkills: rawData.hobbiesSpecialSkills || rawData.hobbiesOrSpecialSkills || null,
        notes: rawData.notes ?? rawData.remarks ?? null,
        remarks: rawData.remarks ?? rawData.notes ?? null,
        cvDocumentDate: rawData.cvDocumentDate ?? null,
        currentIncome: rawData.currentSalary ? parseInt(String(rawData.currentSalary).replace(/[^\d]/g, '')) || null : null,
        desiredIncome: rawData.desiredSalary ? parseInt(String(rawData.desiredSalary).replace(/[^\d]/g, '')) || null : null,
        desiredWorkLocation: rawData.desiredLocation || rawData.desiredWorkLocation || null,
        desiredPosition: rawData.desiredPosition || null,
        nyushaTime: rawData.desiredStartDate || rawData.nyushaTime || null,
        addressOrigin: rawData.addressOrigin || null,
        stayPurpose: rawData.stayPurpose ?? null,
        hasDrivingLicense: rawData.hasDrivingLicense ?? null,
        toolsSoftwareNotes: rawData.toolsSoftwareNotes
          ? (typeof rawData.toolsSoftwareNotes === 'string'
              ? (rawData.toolsSoftwareNotes.trim() ? JSON.parse(rawData.toolsSoftwareNotes) : null)
              : rawData.toolsSoftwareNotes)
          : null,
        learnedTools: rawData.learnedTools
          ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools)
          : null,
        experienceTools: rawData.experienceTools
          ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools)
          : null,
        jlptLevel: rawData.jlptLevel || null,
        jpConversationLevel: rawData.jpConversationLevel ?? null,
        enConversationLevel: rawData.enConversationLevel ?? null,
        otherConversationLevel: rawData.otherConversationLevel ?? null,
        toeicScore: rawData.toeicScore || null,
        ieltsScore: rawData.ieltsScore || null,
        experienceYears: rawData.experienceYears || null,
        specialization: rawData.specialization || null,
        qualification: rawData.qualification || null,
        currentSalary: rawData.currentSalary || null,
        desiredSalary: rawData.desiredSalary || null,
        desiredLocation: rawData.desiredLocation || null,
        desiredStartDate: rawData.desiredStartDate || null,
      };

      const avatarDataUrl = (rawData.avatarBase64 && typeof rawData.avatarBase64 === 'string' && rawData.avatarBase64.startsWith('data:image/'))
        ? rawData.avatarBase64
        : '';
      const cvTemplate = (rawData.cvTemplate && String(rawData.cvTemplate).trim()) || 'common';
      const tab = (rawData.tab === 'rirekisho' || rawData.tab === 'shokumu') ? rawData.tab : 'all';

      const html = generateCvTemplateHtml(cvData, {
        avatarDataUrl,
        cvTemplate,
        tab,
      });

      res.status(200)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send(html);
    } catch (error) {
      next(error);
    }
  }
};

