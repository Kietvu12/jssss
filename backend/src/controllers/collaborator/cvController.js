import { CVStorage, JobApplication } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';
import config from '../../config/index.js';
import { checkDuplicateCV, handleDuplicateCV } from '../../utils/cvDuplicateChecker.js';
import { CV_STATUS_NEW } from '../../constants/cvStatus.js';
import { uploadBufferToS3, buildCvRirekishoPdfKey, buildCvShokumuPdfKey, buildCvOriginalKey, isS3Key, deleteFileFromS3, s3Enabled, getSignedUrlForFile, getObjectStream, makeDownloadDisposition, getCvSnapshotDateTime, buildCvOriginalFolderKey, buildCvTemplateFolderKey, buildCvTemplateFileKey, uploadCvOriginalsToSnapshot, copyCvOriginalsToNewSnapshot, copySingleFileToCvOriginalSnapshot, copyCvTemplatesToNewSnapshot, isFolderPath, listKeysUnderPrefix, listCvSnapshotDateTimes } from '../../services/s3Service.js';
import { createReadStream } from 'fs';
import { generateCvRirekishoPdfBuffer, generateCvShokumuPdfBuffer } from '../../services/cvPdfService.js';
import { generateCvTemplateHtml } from '../../utils/cvTemplateHtml.js';
import { resolveCvFileForView } from '../../utils/cvStorageResolver.js';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const uploadDir = path.join(__dirname, '../../../', config.upload.dir, 'cvs');
// Ensure upload directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatarPhoto') {
    const imgTypes = /jpeg|jpg|png|gif|webp/;
    const ok = imgTypes.test(path.extname(file.originalname).toLowerCase()) && file.mimetype.startsWith('image/');
    return ok ? cb(null, true) : cb(new Error('Ảnh chân dung: chỉ chấp nhận JPG, PNG, GIF, WEBP'));
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

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * CV Management Controller (CTV)
 * CTV chỉ có thể quản lý CV của chính họ
 */
export const cvController = {
  /**
   * Get list of CVs (only own CVs)
   * GET /api/ctv/cvs
   */
  getCVs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        sortBy = 'id',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        collaboratorId: req.collaborator.id // Chỉ lấy CV của CTV này
      };

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

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'name', 'code'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count and latest status for each CV using Sequelize model
      const cvCodes = rows.map(cv => cv.code).filter(code => code); // Filter out null/undefined codes
      let countMap = {};
      let latestStatusMap = {};
      
      if (cvCodes.length > 0) {
        // Count job applications grouped by cvCode using Sequelize
        const applications = await JobApplication.findAll({
          attributes: [
            'cvCode',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            cvCode: {
              [Op.in]: cvCodes
            }
          },
          group: ['cvCode'],
          raw: true,
          paranoid: true // Only count non-deleted records
        });
        
        // Build count map
        applications.forEach((item) => {
          if (item.cvCode) {
            countMap[item.cvCode] = parseInt(item.count) || 0;
          }
        });

        // Get latest application status for each CV
        // Use a subquery approach to get the most recent application for each CV
        for (const cvCode of cvCodes) {
          const latestApp = await JobApplication.findOne({
            where: {
              cvCode: cvCode,
              status: {
                [Op.not]: null
              }
            },
            order: [['updated_at', 'DESC']],
            attributes: ['status'],
            raw: true,
            paranoid: true
          });
          
          if (latestApp) {
            latestStatusMap[cvCode] = latestApp.status;
          }
        }
      }

      // Attach applications count and latest status to each CV
      const cvsWithCount = rows.map(cv => {
        const cvData = cv.toJSON();
        cvData.applicationsCount = countMap[cv.code] || 0;
        cvData.latestApplicationStatus = latestStatusMap[cv.code] || null;
        return cvData;
      });

      res.json({
        success: true,
        data: {
          cvs: cvsWithCount,
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
   * Lấy URL xem/tải file CV (chỉ CV của chính CTV)
   * GET /api/ctv/cvs/:id/view-url?fileType=curriculumVitae&purpose=view|download
   */
  getCVFileUrl: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fileType = 'curriculumVitae', purpose = 'view', template, document, index } = req.query;

      const cv = await CVStorage.findOne({
        where: { id, collaboratorId: req.collaborator.id }
      });
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập'
        });
      }

      const backendRoot = path.join(__dirname, '../../../');
      const resolved = await resolveCvFileForView(cv, fileType, { template, document, index }, backendRoot);
      if (!resolved) {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại'
        });
      }
      const filePath = resolved.pathOrKey;

      if (resolved.isS3) {
        const disposition = purpose === 'download' ? makeDownloadDisposition(path.basename(filePath).replace(/^[a-f0-9-]+_/i, '') || 'download') : null;
        const url = await getSignedUrlForFile(filePath, purpose, disposition);
        if (url) return res.json({ success: true, data: { url } });
        return res.status(503).json({
          success: false,
          message: 'File lưu trên S3. Vui lòng cấu hình AWS S3 (bucket, keyPrefix, credentials) trong .env.'
        });
      }

      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return res.json({ success: true, data: { url: filePath } });
      }
      const apiBase = `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '');
      const pathPart = (filePath.startsWith('/') ? filePath : `/${filePath}`).replace(/\/+/g, '/');
      res.json({ success: true, data: { url: `${apiBase}${pathPart}` } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Stream file content (proxy) để frontend preview DOCX/DOC/XLSX. Chỉ CV của chính CTV.
   * GET /api/ctv/cvs/:id/file-content?fileType=curriculumVitae
   */
  getCVFileContent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { fileType = 'curriculumVitae', template, document, index } = req.query;

      const cv = await CVStorage.findOne({
        where: { id, collaboratorId: req.collaborator.id }
      });
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập'
        });
      }

      const backendRoot = path.resolve(__dirname, '../../../');
      const resolved = await resolveCvFileForView(cv, fileType, { template, document, index }, backendRoot);
      if (!resolved) {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại'
        });
      }
      const filePath = resolved.pathOrKey;

      const ext = path.extname(filePath).toLowerCase();
      const mime = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel'
      }[ext] || 'application/octet-stream';

      if (resolved.isS3) {
        const obj = await getObjectStream(filePath);
        if (!obj || !obj.Body) {
          return res.status(503).json({
            success: false,
            message: 'Không đọc được file từ S3.'
          });
        }
        res.setHeader('Content-Type', obj.ContentType || mime);
        res.setHeader('Cache-Control', 'private, max-age=300');
        obj.Body.pipe(res);
        return;
      }

      const fullPath = path.join(backendRoot, filePath.replace(/^\//, ''));
      try {
        await fs.access(fullPath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại trên server'
        });
      }
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'private, max-age=300');
      const stream = createReadStream(fullPath);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  /**
   * List all CV files (originals + templates) with view/download URLs for detail UI
   * GET /api/ctv/cvs/:id/cv-file-list
   */
  getCVFileList: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cv = await CVStorage.findOne({
        where: { id, collaboratorId: req.collaborator.id }
      });
      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập'
        });
      }
      const backendRoot = path.join(__dirname, '../../../');
      const apiBase = `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '');

      const originals = [];
      if (cv.cvOriginalPath) {
        if (isFolderPath(cv.cvOriginalPath)) {
          if (isS3Key(cv.cvOriginalPath)) {
            const keys = await listKeysUnderPrefix(cv.cvOriginalPath);
            keys.sort();
            for (let i = 0; i < keys.length; i++) {
              const key = keys[i];
              const name = path.basename(key);
              const viewUrl = await getSignedUrlForFile(key, 'view');
              const downloadUrl = await getSignedUrlForFile(key, 'download', makeDownloadDisposition(name));
              originals.push({ index: i, name, viewUrl, downloadUrl });
            }
          } else {
            const fullDir = path.join(backendRoot, cv.cvOriginalPath.replace(/^\//, ''));
            let entries = [];
            try {
              entries = await fs.readdir(fullDir);
            } catch (e) {
              // folder missing
            }
            entries.sort();
            for (let i = 0; i < entries.length; i++) {
              const pathPart = (cv.cvOriginalPath.replace(/\/+$/, '') + '/' + entries[i]).replace(/^\//, '');
              const viewUrl = `${apiBase}/${pathPart}`;
              originals.push({ index: i, name: entries[i], viewUrl, downloadUrl: viewUrl });
            }
          }
        } else {
          const resolved = await resolveCvFileForView(cv, 'cvOriginalPath', {}, backendRoot);
          if (resolved) {
            const name = path.basename(resolved.pathOrKey);
            if (resolved.isS3) {
              const viewUrl = await getSignedUrlForFile(resolved.pathOrKey, 'view');
              const downloadUrl = await getSignedUrlForFile(resolved.pathOrKey, 'download', makeDownloadDisposition(name));
              originals.push({ index: 0, name, viewUrl, downloadUrl });
            } else {
              const pathPart = resolved.pathOrKey.startsWith('/') ? resolved.pathOrKey : `/${resolved.pathOrKey}`;
              const viewUrl = `${apiBase}${pathPart}`;
              originals.push({ index: 0, name, viewUrl, downloadUrl: viewUrl });
            }
          }
        }
      }

      const templates = [];
      const templateLabels = { rirekisho: '履歴書', shokumu: '職務経歴書' };
      const templateNames = { Common: 'Common', IT: 'IT', Technical: 'Technical' };
      if (cv.curriculumVitae && isFolderPath(cv.curriculumVitae)) {
        for (const template of ['Common', 'IT', 'Technical']) {
          for (const document of ['rirekisho', 'shokumu']) {
            const resolved = await resolveCvFileForView(cv, document === 'shokumu' ? 'cvCareerHistoryPath' : 'curriculumVitae', { template, document }, backendRoot);
            if (!resolved) continue;
            const label = `${templateNames[template]} - ${templateLabels[document]}`;
            if (resolved.isS3) {
              const name = path.basename(resolved.pathOrKey);
              const viewUrl = await getSignedUrlForFile(resolved.pathOrKey, 'view');
              const downloadUrl = await getSignedUrlForFile(resolved.pathOrKey, 'download', makeDownloadDisposition(name));
              templates.push({ template, document, label, viewUrl, downloadUrl });
            } else {
              const pathPart = resolved.pathOrKey.startsWith('/') ? resolved.pathOrKey : `/${resolved.pathOrKey}`;
              const viewUrl = `${apiBase}${pathPart}`;
              templates.push({ template, document, label, viewUrl, downloadUrl: viewUrl });
            }
          }
        }
      } else {
        if (cv.curriculumVitae) {
          const resolved = await resolveCvFileForView(cv, 'curriculumVitae', {}, backendRoot);
          if (resolved) {
            const name = path.basename(resolved.pathOrKey);
            if (resolved.isS3) {
              const viewUrl = await getSignedUrlForFile(resolved.pathOrKey, 'view');
              const downloadUrl = await getSignedUrlForFile(resolved.pathOrKey, 'download', makeDownloadDisposition(name));
              templates.push({ template: 'Common', document: 'rirekisho', label: '履歴書', viewUrl, downloadUrl });
            } else {
              const pathPart = resolved.pathOrKey.startsWith('/') ? resolved.pathOrKey : `/${resolved.pathOrKey}`;
              const viewUrl = `${apiBase}${pathPart}`;
              templates.push({ template: 'Common', document: 'rirekisho', label: '履歴書', viewUrl, downloadUrl: viewUrl });
            }
          }
        }
        if (cv.cvCareerHistoryPath || cv.curriculumVitae) {
          const resolved = await resolveCvFileForView(cv, 'cvCareerHistoryPath', {}, backendRoot);
          if (resolved) {
            const name = path.basename(resolved.pathOrKey);
            if (resolved.isS3) {
              const viewUrl = await getSignedUrlForFile(resolved.pathOrKey, 'view');
              const downloadUrl = await getSignedUrlForFile(resolved.pathOrKey, 'download', makeDownloadDisposition(name));
              templates.push({ template: 'Common', document: 'shokumu', label: '職務経歴書', viewUrl, downloadUrl });
            } else {
              const pathPart = resolved.pathOrKey.startsWith('/') ? resolved.pathOrKey : `/${resolved.pathOrKey}`;
              const viewUrl = `${apiBase}${pathPart}`;
              templates.push({ template: 'Common', document: 'shokumu', label: '職務経歴書', viewUrl, downloadUrl: viewUrl });
            }
          }
        }
      }

      return res.json({ success: true, data: { originals, templates } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * List snapshots for a CV (dateTime folders).
   * GET /api/ctv/cvs/:id/snapshots?limit=20
   */
  getCVSnapshots: async (req, res, next) => {
    try {
      const { id } = req.params;
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

      const cv = await CVStorage.findOne({
        where: { id, collaboratorId: req.collaborator.id }
      });
      if (!cv) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập' });
      }

      let dateTimes = [];
      if (s3Enabled()) {
        dateTimes = await listCvSnapshotDateTimes(cv.id);
      } else {
        const cvRoot = path.join(uploadDir, String(cv.id));
        try {
          const entries = await fs.readdir(cvRoot, { withFileTypes: true });
          dateTimes = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort().reverse();
        } catch {
          dateTimes = [];
        }
      }
      dateTimes = dateTimes.slice(0, limit);

      const backendRoot = path.join(__dirname, '../../../');
      const snapshots = [];
      for (const dateTime of dateTimes) {
        const originals = [];
        const templates = { Common: {}, IT: {}, Technical: {} };
        let originalFolderPath = null;
        let templateFolderPath = null;

        if (s3Enabled()) {
          const origFolder = buildCvOriginalFolderKey(cv.id, dateTime);
          originalFolderPath = origFolder;
          templateFolderPath = buildCvTemplateFolderKey(cv.id, dateTime);
          const keys = await listKeysUnderPrefix(origFolder);
          keys.sort();
          for (const key of keys) {
            const name = path.basename(key);
            const viewUrl = await getSignedUrlForFile(key, 'view');
            const downloadUrl = await getSignedUrlForFile(key, 'download', makeDownloadDisposition(name));
            originals.push({ name, viewUrl, downloadUrl });
          }

          for (const tpl of ['Common', 'IT', 'Technical']) {
            for (const doc of ['rirekisho', 'shokumu']) {
              const fileName = `cv-${doc}.pdf`;
              const key = buildCvTemplateFileKey(cv.id, dateTime, tpl, fileName);
              const viewUrl = await getSignedUrlForFile(key, 'view');
              const downloadUrl = await getSignedUrlForFile(key, 'download', makeDownloadDisposition(fileName));
              templates[tpl][doc] = { viewUrl, downloadUrl };
            }
          }
        } else {
          const snapshotRoot = path.join(uploadDir, String(cv.id), dateTime);
          const origDir = path.join(snapshotRoot, 'CV_original');
          originalFolderPath = path.relative(backendRoot, origDir).replace(/\\/g, '/');
          templateFolderPath = path.relative(backendRoot, path.join(snapshotRoot, 'CV_Template')).replace(/\\/g, '/');
          try {
            const files = await fs.readdir(origDir);
            files.sort();
            for (const f of files) {
              const rel = path.relative(path.join(__dirname, '../../../'), path.join(origDir, f)).replace(/\\/g, '/');
              const url = `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '') + '/' + rel.replace(/^\/+/, '');
              originals.push({ name: f, viewUrl: url, downloadUrl: url });
            }
          } catch {}

          for (const tpl of ['Common', 'IT', 'Technical']) {
            for (const doc of ['rirekisho', 'shokumu']) {
              const fileName = `cv-${doc}.pdf`;
              const full = path.join(snapshotRoot, 'CV_Template', tpl, fileName);
              const rel = path.relative(path.join(__dirname, '../../../'), full).replace(/\\/g, '/');
              const url = `${req.protocol}://${req.get('host')}`.replace(/\/+$/, '') + '/' + rel.replace(/^\/+/, '');
              templates[tpl][doc] = { viewUrl: url, downloadUrl: url };
            }
          }
        }

        snapshots.push({
          dateTime,
          originalFolderPath,
          templateFolderPath,
          originals,
          templates,
          zip: {
            original: `/api/ctv/cvs/${cv.id}/download-zip?scope=original&template=all&dateTime=${encodeURIComponent(dateTime)}`,
            templateAll: `/api/ctv/cvs/${cv.id}/download-zip?scope=template&template=all&dateTime=${encodeURIComponent(dateTime)}`,
            templateCommon: `/api/ctv/cvs/${cv.id}/download-zip?scope=template&template=Common&dateTime=${encodeURIComponent(dateTime)}`,
            templateIT: `/api/ctv/cvs/${cv.id}/download-zip?scope=template&template=IT&dateTime=${encodeURIComponent(dateTime)}`,
            templateTechnical: `/api/ctv/cvs/${cv.id}/download-zip?scope=template&template=Technical&dateTime=${encodeURIComponent(dateTime)}`,
          }
        });
      }

      return res.json({ success: true, data: { snapshots } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Rollback CV về một snapshot cũ: copy toàn bộ snapshot đó sang snapshot mới (dateTime mới) và cập nhật DB.
   * POST /api/ctv/cvs/:id/rollback
   * Body: { srcDateTime: "YYYY-MM-DD_HH-mm-ss" }
   */
  rollbackCV: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { srcDateTime } = req.body || {};
      if (!srcDateTime || typeof srcDateTime !== 'string') {
        return res.status(400).json({ success: false, message: 'Thiếu srcDateTime (YYYY-MM-DD_HH-mm-ss)' });
      }

      const cv = await CVStorage.findOne({
        where: { id, collaboratorId: req.collaborator.id }
      });
      if (!cv) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập' });
      }

      const backendRoot = path.join(__dirname, '../../../');
      let dateTimes = [];
      if (s3Enabled()) {
        dateTimes = await listCvSnapshotDateTimes(cv.id);
      } else {
        const cvRoot = path.join(uploadDir, String(cv.id));
        try {
          const entries = await fs.readdir(cvRoot, { withFileTypes: true });
          dateTimes = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort().reverse();
        } catch {
          dateTimes = [];
        }
      }
      if (!dateTimes.includes(srcDateTime)) {
        return res.status(400).json({ success: false, message: 'Snapshot không tồn tại hoặc không thuộc CV này' });
      }

      const newDateTime = getCvSnapshotDateTime();

      if (s3Enabled()) {
        const srcOriginalKey = buildCvOriginalFolderKey(cv.id, srcDateTime);
        const srcTemplateKey = buildCvTemplateFolderKey(cv.id, srcDateTime);
        cv.cvOriginalPath = await copyCvOriginalsToNewSnapshot(cv.id, newDateTime, srcOriginalKey);
        cv.curriculumVitae = await copyCvTemplatesToNewSnapshot(cv.id, newDateTime, srcTemplateKey);
      } else {
        const baseDir = path.join(backendRoot, config.upload.dir, 'cvs', String(cv.id));
        const srcDir = path.join(baseDir, srcDateTime);
        const destDir = path.join(baseDir, newDateTime);
        await fs.cp(srcDir, destDir, { recursive: true });
        cv.cvOriginalPath = path.relative(backendRoot, path.join(destDir, 'CV_original'));
        cv.curriculumVitae = path.relative(backendRoot, path.join(destDir, 'CV_Template'));
      }

      await cv.save();
      return res.json({ success: true, data: { newDateTime, message: 'Đã rollback CV về snapshot đã chọn' } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Download zip for CV_original or CV_Template (single template or all).
   * GET /api/ctv/cvs/:id/download-zip?scope=original|template&template=Common|IT|Technical|all
   */
  downloadCVZip: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { scope = 'template', template = 'all', dateTime: dt } = req.query;

      const cv = await CVStorage.findOne({
        where: { id, collaboratorId: req.collaborator.id }
      });
      if (!cv) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập' });
      }

      const backendRoot = path.join(__dirname, '../../../');
      const files = [];

      if (scope === 'original') {
        const dateTime = dt ? String(dt) : null;
        if (dateTime) {
          if (s3Enabled()) {
            const folderKey = buildCvOriginalFolderKey(cv.id, dateTime);
            const keys = await listKeysUnderPrefix(folderKey);
            keys.sort();
            for (const key of keys) files.push({ type: 's3', key, name: `CV_original/${path.basename(key)}` });
          } else {
            const fullDir = path.join(uploadDir, String(cv.id), dateTime, 'CV_original');
            let entries = [];
            try { entries = await fs.readdir(fullDir); } catch {}
            entries.sort();
            for (const f of entries) files.push({ type: 'local', fullPath: path.join(fullDir, f), name: `CV_original/${f}` });
          }
        } else {
          if (!cv.cvOriginalPath) return res.status(404).json({ success: false, message: 'Không có file CV gốc' });
          if (isFolderPath(cv.cvOriginalPath)) {
            if (isS3Key(cv.cvOriginalPath)) {
              const keys = await listKeysUnderPrefix(cv.cvOriginalPath);
              keys.sort();
              for (const key of keys) files.push({ type: 's3', key, name: `CV_original/${path.basename(key)}` });
            } else {
              const fullDir = path.join(backendRoot, cv.cvOriginalPath.replace(/^\//, ''));
              let entries = [];
              try { entries = await fs.readdir(fullDir); } catch {}
              entries.sort();
              for (const f of entries) files.push({ type: 'local', fullPath: path.join(fullDir, f), name: `CV_original/${f}` });
            }
          } else {
            const resolved = await resolveCvFileForView(cv, 'cvOriginalPath', {}, backendRoot);
            if (resolved?.isS3) files.push({ type: 's3', key: resolved.pathOrKey, name: `CV_original/${path.basename(resolved.pathOrKey)}` });
            else if (resolved?.pathOrKey) files.push({ type: 'local', fullPath: path.join(backendRoot, resolved.pathOrKey.replace(/^\//, '')), name: `CV_original/${path.basename(resolved.pathOrKey)}` });
          }
        }
      } else {
        const dateTime = dt ? String(dt) : null;
        const templatesToZip = template === 'all' ? ['Common', 'IT', 'Technical'] : [String(template)];
        if (dateTime) {
          for (const tpl of templatesToZip) {
            for (const document of ['rirekisho', 'shokumu']) {
              const fileName = `cv-${document}.pdf`;
              if (s3Enabled()) {
                const key = buildCvTemplateFileKey(cv.id, dateTime, tpl, fileName);
                files.push({ type: 's3', key, name: `CV_Template/${tpl}/${fileName}` });
              } else {
                const full = path.join(uploadDir, String(cv.id), dateTime, 'CV_Template', tpl, fileName);
                files.push({ type: 'local', fullPath: full, name: `CV_Template/${tpl}/${fileName}` });
              }
            }
          }
        } else {
          if (!cv.curriculumVitae) return res.status(404).json({ success: false, message: 'Không có file CV template' });
          for (const tpl of templatesToZip) {
            for (const document of ['rirekisho', 'shokumu']) {
              const resolved = await resolveCvFileForView(cv, document === 'shokumu' ? 'cvCareerHistoryPath' : 'curriculumVitae', { template: tpl, document }, backendRoot);
              if (!resolved) continue;
              const baseName = `CV_Template/${tpl}/cv-${document}.pdf`;
              if (resolved.isS3) files.push({ type: 's3', key: resolved.pathOrKey, name: baseName });
              else files.push({ type: 'local', fullPath: path.join(backendRoot, resolved.pathOrKey.replace(/^\//, '')), name: baseName });
            }
          }
        }
      }

      if (!files.length) {
        return res.status(404).json({ success: false, message: 'Không có file để nén' });
      }

      const safeTpl = template === 'all' ? 'all' : String(template);
      const zipName = scope === 'original'
        ? `cv_${id}_CV_original.zip`
        : `cv_${id}_CV_Template_${safeTpl}.zip`;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', makeDownloadDisposition(zipName));
      res.setHeader('Cache-Control', 'private, max-age=60');

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => next(err));
      archive.pipe(res);

      for (const f of files) {
        if (f.type === 's3') {
          const obj = await getObjectStream(f.key);
          if (obj?.Body) archive.append(obj.Body, { name: f.name });
        } else {
          archive.file(f.fullPath, { name: f.name });
        }
      }

      await archive.finalize();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get CV by ID (only own CV)
   * GET /api/ctv/cvs/:id
   */
  getCVById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const cv = await CVStorage.findOne({
        where: {
          id,
          collaboratorId: req.collaborator.id
        }
      });

      if (!cv) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền truy cập'
        });
      }

      // Get applications count
      const applicationsCount = await JobApplication.count({
        where: { cvCode: cv.code }
      });

      const cvData = cv.toJSON();
      cvData.applicationsCount = applicationsCount;

      res.json({
        success: true,
        data: { cv: cvData }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new CV
   * POST /api/ctv/cvs
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
          
          // Generate unique code
          const code = `CV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
            // These come as JSON strings from FormData, need to parse them
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
            passport: rawData.passport ? parseInt(rawData.passport) : null,
            currentResidence: rawData.currentResidence ? parseInt(rawData.currentResidence) : null,
            jpResidenceStatus: rawData.jpResidenceStatus ? parseInt(rawData.jpResidenceStatus) : null,
            visaExpirationDate: rawData.visaExpirationDate || null,
            otherCountry: rawData.otherCountry || null,
            spouse: rawData.spouse ? parseInt(rawData.spouse) : null,
            interviewTime: rawData.interviewTime || null,
            learnedTools: rawData.learnedTools 
              ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools)
              : null,
            experienceTools: rawData.experienceTools
              ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools)
              : null,
            jlptLevel: rawData.jlptLevel ? parseInt(rawData.jlptLevel) : null,
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

          // Create CV (curriculumVitae + cvCareerHistoryPath set sau khi generate 2 PDF: Rirekisho + Shokumu)
          const cv = await CVStorage.create({
            collaboratorId: req.collaborator.id,
            code,
            ...cvData,
            curriculumVitae: null,
            cvCareerHistoryPath: null,
            status: CV_STATUS_NEW,
            isDuplicate: false,
            duplicateWithCvId: null
          });

          // Check for duplicate CV
          let duplicateResult = null;
          if (cvData.name || cvData.email || cvData.phone) {
            const duplicateCV = await checkDuplicateCV(cvData.name, cvData.email, cvData.phone);
            if (duplicateCV && duplicateCV.id !== cv.id) {
              duplicateResult = await handleDuplicateCV(duplicateCV, cv);
            }
          }

          // Reload CV to get updated data
          await cv.reload();

          // Snapshot folder: cvs/{id}/{dateTime}/CV_original + CV_Template (Common, IT, Technical)
          const backendRoot = path.join(__dirname, '../../../');
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
                  await fs.copyFile(f.path, dest);
                }
                cv.cvOriginalPath = path.relative(backendRoot, origDir);
              }
              await cv.save();
            } catch (e) {
              console.warn('[Collaborator createCV] Lưu CV gốc thất bại:', e.message);
            }
            for (const f of req.files.cvFile) await fs.unlink(f.path).catch(() => {});
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

          try {
            let avatarDataUrl = '';
            if (req.files?.avatarPhoto?.[0]) {
              try {
                const buf = await fs.readFile(req.files.avatarPhoto[0].path);
                const mime = req.files.avatarPhoto[0].mimetype || 'image/jpeg';
                avatarDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
              } catch (e) {
                console.warn('[Collaborator createCV] Đọc ảnh chân dung thất bại:', e.message);
              }
              await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
            }
            if (!avatarDataUrl && rawData.avatarBase64 && typeof rawData.avatarBase64 === 'string' && rawData.avatarBase64.startsWith('data:image/')) {
              avatarDataUrl = rawData.avatarBase64;
            }

            const templateList = [
              { cvTemplate: 'common', dir: 'Common' },
              { cvTemplate: 'cv_it', dir: 'IT' },
              { cvTemplate: 'cv_technical', dir: 'Technical' }
            ];

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
                  console.warn(`[Collaborator createCV] PDF ${templateDir} thất bại:`, e.message);
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
                  console.warn(`[Collaborator createCV] PDF ${templateDir} thất bại:`, e.message);
                }
              }
              cv.curriculumVitae = path.relative(backendRoot, tplDir);
            }
            if (cv.curriculumVitae) {
              await cv.save();
              await cv.reload();
            }
          } catch (pdfErr) {
            console.warn('[Collaborator createCV] Không thể tạo PDF template (Rirekisho/Shokumu):', pdfErr.message);
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
          // Delete uploaded files if CV creation fails
          if (req.files?.cvFile) {
            for (const f of req.files.cvFile) await fs.unlink(f.path).catch(() => {});
          }
          if (req.files?.avatarPhoto?.[0]) await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update CV (only own CV)
   * PUT /api/ctv/cvs/:id
   */
  updateCV: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if CV exists and belongs to this collaborator
      const cv = await CVStorage.findByPk(id);
      if (!cv || cv.collaboratorId !== req.collaborator.id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền chỉnh sửa'
        });
      }

      upload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        try {
          const rawData = req.body;

          // Map frontend fields (nameKanji, nameKana, address, ...) sang model (name, furigana, addressCurrent, ...) giống createCV
          const mappedData = {
            name: rawData.nameKanji !== undefined ? (rawData.nameKanji || null) : undefined,
            furigana: rawData.nameKana !== undefined ? (rawData.nameKana || null) : undefined,
            email: rawData.email !== undefined ? (rawData.email || null) : undefined,
            phone: rawData.phone !== undefined ? (rawData.phone || null) : undefined,
            postalCode: rawData.postalCode !== undefined ? (rawData.postalCode || null) : undefined,
            addressCurrent: rawData.address !== undefined ? (rawData.address || null) : (rawData.addressCurrent !== undefined ? (rawData.addressCurrent || null) : undefined),
            birthDate: rawData.birthDate !== undefined ? (rawData.birthDate || null) : undefined,
            ages: rawData.age !== undefined ? (rawData.age || rawData.ages || null) : (rawData.ages !== undefined ? (rawData.ages || null) : undefined),
            gender: rawData.gender !== undefined ? (rawData.gender === '男' || rawData.gender === '1' ? 1 : rawData.gender === '女' || rawData.gender === '2' ? 2 : null) : undefined,
            educations: rawData.educations !== undefined
              ? (typeof rawData.educations === 'string' ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null) : Array.isArray(rawData.educations) ? rawData.educations : null)
              : undefined,
            workExperiences: rawData.workExperiences !== undefined
              ? (typeof rawData.workExperiences === 'string' ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null) : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null)
              : undefined,
            certificates: rawData.certificates !== undefined
              ? (typeof rawData.certificates === 'string' ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null) : Array.isArray(rawData.certificates) ? rawData.certificates : null)
              : undefined,
            technicalSkills: rawData.technicalSkills !== undefined ? (rawData.technicalSkills || null) : undefined,
            careerSummary: rawData.careerSummary !== undefined ? (rawData.careerSummary || null) : undefined,
            strengths: rawData.strengths !== undefined ? (rawData.strengths || null) : undefined,
            motivation: rawData.motivation !== undefined ? (rawData.motivation || null) : undefined,
            currentIncome: rawData.currentSalary !== undefined ? (parseInt(String(rawData.currentSalary).replace(/[^\d]/g, ''), 10) || null) : undefined,
            desiredIncome: rawData.desiredSalary !== undefined ? (parseInt(String(rawData.desiredSalary).replace(/[^\d]/g, ''), 10) || null) : undefined,
            desiredWorkLocation: rawData.desiredLocation !== undefined ? (rawData.desiredLocation || rawData.desiredWorkLocation || null) : (rawData.desiredWorkLocation !== undefined ? (rawData.desiredWorkLocation || null) : undefined),
            desiredPosition: rawData.desiredPosition !== undefined ? (rawData.desiredPosition || null) : undefined,
            nyushaTime: rawData.desiredStartDate !== undefined ? (rawData.desiredStartDate || rawData.nyushaTime || null) : (rawData.nyushaTime !== undefined ? (rawData.nyushaTime || null) : undefined),
            addressOrigin: rawData.addressOrigin !== undefined ? (rawData.addressOrigin || null) : undefined,
            passport: rawData.passport !== undefined ? (rawData.passport !== '' && rawData.passport != null ? parseInt(rawData.passport, 10) : null) : undefined,
            currentResidence: rawData.currentResidence !== undefined ? (rawData.currentResidence !== '' && rawData.currentResidence != null ? parseInt(rawData.currentResidence, 10) : null) : undefined,
            jpResidenceStatus: rawData.jpResidenceStatus !== undefined ? (rawData.jpResidenceStatus !== '' && rawData.jpResidenceStatus != null ? parseInt(rawData.jpResidenceStatus, 10) : null) : undefined,
            visaExpirationDate: rawData.visaExpirationDate !== undefined ? (rawData.visaExpirationDate || null) : undefined,
            otherCountry: rawData.otherCountry !== undefined ? (rawData.otherCountry || null) : undefined,
            spouse: rawData.spouse !== undefined ? (rawData.spouse !== '' && rawData.spouse != null ? parseInt(rawData.spouse, 10) : null) : undefined,
            interviewTime: rawData.interviewTime !== undefined ? (rawData.interviewTime || null) : undefined,
            learnedTools: rawData.learnedTools !== undefined ? (typeof rawData.learnedTools === 'string' ? (rawData.learnedTools.trim() ? JSON.parse(rawData.learnedTools) : null) : rawData.learnedTools) : undefined,
            experienceTools: rawData.experienceTools !== undefined ? (typeof rawData.experienceTools === 'string' ? (rawData.experienceTools.trim() ? JSON.parse(rawData.experienceTools) : null) : rawData.experienceTools) : undefined,
            jlptLevel: rawData.jlptLevel !== undefined ? (rawData.jlptLevel !== '' && rawData.jlptLevel != null ? parseInt(rawData.jlptLevel, 10) : null) : undefined,
            experienceYears: rawData.experienceYears !== undefined ? (rawData.experienceYears !== '' && rawData.experienceYears != null ? parseInt(rawData.experienceYears, 10) : null) : undefined,
            specialization: rawData.specialization !== undefined ? (rawData.specialization !== '' && rawData.specialization != null ? parseInt(rawData.specialization, 10) : null) : undefined,
            qualification: rawData.qualification !== undefined ? (rawData.qualification !== '' && rawData.qualification != null ? parseInt(rawData.qualification, 10) : null) : undefined,
            otherDocuments: rawData.otherDocuments !== undefined ? (rawData.otherDocuments || null) : undefined,
            notes: rawData.notes !== undefined ? (rawData.notes || null) : undefined,
          };
          // Chỉ gán các field được gửi lên (không overwrite bằng undefined)
          Object.keys(mappedData).forEach(key => {
            if (mappedData[key] !== undefined && key !== 'id' && key !== 'code' && key !== 'collaboratorId') {
              cv[key] = mappedData[key];
            }
          });

          await cv.save();
          await cv.reload();

          const backendRoot = path.join(__dirname, '../../../');
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
                  await fs.copyFile(f.path, dest);
                }
                cv.cvOriginalPath = path.relative(backendRoot, origDir);
              }
              await cv.save();
            } catch (e) {
              console.warn('[Collaborator updateCV] Lưu CV gốc thất bại:', e.message);
            }
            for (const f of req.files.cvFile) await fs.unlink(f.path).catch(() => {});
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
              console.warn('[Collaborator updateCV] Copy CV gốc sang snapshot mới thất bại:', e.message);
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

          try {
            let avatarDataUrl = '';
            if (req.files?.avatarPhoto?.[0]) {
              try {
                const buf = await fs.readFile(req.files.avatarPhoto[0].path);
                const mime = req.files.avatarPhoto[0].mimetype || 'image/jpeg';
                avatarDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
              } catch (e) {
                console.warn('[Collaborator updateCV] Đọc ảnh chân dung thất bại:', e.message);
              }
              await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
            }
            if (!avatarDataUrl && rawData.avatarBase64 && typeof rawData.avatarBase64 === 'string' && rawData.avatarBase64.startsWith('data:image/')) {
              avatarDataUrl = rawData.avatarBase64;
            }

            const templateList = [
              { cvTemplate: 'common', dir: 'Common' },
              { cvTemplate: 'cv_it', dir: 'IT' },
              { cvTemplate: 'cv_technical', dir: 'Technical' }
            ];

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
                  console.warn(`[Collaborator updateCV] PDF ${templateDir} thất bại:`, e.message);
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
                  console.warn(`[Collaborator updateCV] PDF ${templateDir} thất bại:`, e.message);
                }
              }
              cv.curriculumVitae = path.relative(backendRoot, tplDir);
            }
            if (cv.curriculumVitae) {
              await cv.save();
              await cv.reload();
            }
          } catch (pdfErr) {
            console.warn('[Collaborator updateCV] Không thể tạo PDF template (Rirekisho/Shokumu):', pdfErr.message);
          }

          res.json({
            success: true,
            message: 'Cập nhật CV thành công',
            data: { cv }
          });
        } catch (error) {
          // Delete uploaded files if update fails
          if (req.files?.cvFile) {
            for (const f of req.files.cvFile) await fs.unlink(f.path).catch(() => {});
          }
          if (req.files?.avatarPhoto?.[0]) await fs.unlink(req.files.avatarPhoto[0].path).catch(() => {});
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete CV (only own CV, soft delete)
   * DELETE /api/ctv/cvs/:id
   */
  deleteCV: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if CV exists and belongs to this collaborator
      const cv = await CVStorage.findByPk(id);
      if (!cv || cv.collaboratorId !== req.collaborator.id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy CV hoặc bạn không có quyền xóa'
        });
      }

      // Check if CV has applications
      const applicationsCount = await JobApplication.count({
        where: { cvCode: cv.code }
      });

      if (applicationsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa CV vì đã có ${applicationsCount} đơn ứng tuyển liên quan`
        });
      }

      // Soft delete
      await cv.destroy();

      res.json({
        success: true,
        message: 'Xóa CV thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get CV statistics and list
   * GET /api/ctv/cvs/statistics
   * Trả về danh sách CV và thống kê đơn ứng tuyển
   */
  getCVStatistics: async (req, res, next) => {
    try {
      const collaboratorId = req.collaborator.id;

      // Lấy danh sách CV của CTV này
      const cvs = await CVStorage.findAll({
        where: {
          collaboratorId: collaboratorId
        },
        attributes: ['id', 'code', 'name', 'email', 'phone', 'status', 'createdAt', 'updatedAt'],
        order: [['created_at', 'DESC']]
      });

      // Đếm tổng số đơn ứng tuyển đã tạo
      const totalApplications = await JobApplication.count({
        where: {
          collaboratorId: collaboratorId
        }
      });

      // Đếm số đơn đã đến vòng phỏng vấn (status = 4)
      const interviewedApplications = await JobApplication.count({
        where: {
          collaboratorId: collaboratorId,
          status: 4
        }
      });

      // Đếm số đơn đã được tuyển (status = 8)
      const hiredApplications = await JobApplication.count({
        where: {
          collaboratorId: collaboratorId,
          status: 8
        }
      });

      res.json({
        success: true,
        data: {
          cvs: cvs.map(cv => cv.toJSON()),
          statistics: {
            totalCVs: cvs.length,
            totalApplications: totalApplications,
            interviewedApplications: interviewedApplications,
            hiredApplications: hiredApplications
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recently updated CVs (sorted by updatedAt DESC)
   * GET /api/ctv/cvs/recent
   */
  getRecentCVs: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        isDuplicate,
        sortBy = 'updatedAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        collaboratorId: req.collaborator.id // Chỉ lấy CV của CTV này
      };

      // Search by name, email, or code
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by duplicate status
      if (isDuplicate !== undefined) {
        where.isDuplicate = isDuplicate === '1' || isDuplicate === 'true';
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'name', 'code'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'updatedAt';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause - always prioritize updatedAt DESC
      const orderClause = [['updated_at', 'DESC']];
      if (sortField !== 'updatedAt') {
        orderClause.push([dbSortField, orderDirection]);
      }
      orderClause.push(['id', 'DESC']);

      const { count, rows } = await CVStorage.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get applications count for each CV
      const cvCodes = rows.map(cv => cv.code).filter(code => code);
      let countMap = {};
      
      if (cvCodes.length > 0) {
        const applications = await JobApplication.findAll({
          attributes: [
            'cvCode',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            cvCode: {
              [Op.in]: cvCodes
            }
          },
          group: ['cvCode'],
          raw: true,
          paranoid: true
        });
        
        applications.forEach((item) => {
          if (item.cvCode) {
            countMap[item.cvCode] = parseInt(item.count) || 0;
          }
        });
      }

      // Attach applications count to each CV
      const cvsWithCount = rows.map(cv => {
        const cvData = cv.toJSON();
        cvData.applicationsCount = countMap[cv.code] || 0;
        return cvData;
      });

      res.json({
        success: true,
        data: {
          cvs: cvsWithCount,
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
   * Kiểm tra CV trùng (name, email, phone)
   * POST /api/ctv/cvs/check-duplicate
   * Body: { name?, nameKanji?, email?, phone? }
   */
  checkDuplicate: async (req, res, next) => {
    try {
      const { name, nameKanji, email, phone } = req.body || {};
      const cvName = (name || nameKanji || '').trim();
      const cvEmail = (email || '').trim();
      const cvPhone = (phone || '').trim();
      const duplicate = await checkDuplicateCV(cvName, cvEmail, cvPhone);
      res.json({
        success: true,
        data: { isDuplicate: !!duplicate }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Preview CV template HTML (khi tạo/sửa UV – CTV cũng cần xem form xuất ra)
   * POST /api/ctv/cvs/preview
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
        educations: rawData.educations ? (typeof rawData.educations === 'string' ? (rawData.educations.trim() ? JSON.parse(rawData.educations) : null) : Array.isArray(rawData.educations) ? rawData.educations : null) : null,
        workExperiences: rawData.workExperiences ? (typeof rawData.workExperiences === 'string' ? (rawData.workExperiences.trim() ? JSON.parse(rawData.workExperiences) : null) : Array.isArray(rawData.workExperiences) ? rawData.workExperiences : null) : null,
        certificates: rawData.certificates ? (typeof rawData.certificates === 'string' ? (rawData.certificates.trim() ? JSON.parse(rawData.certificates) : null) : Array.isArray(rawData.certificates) ? rawData.certificates : null) : null,
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
          ? (typeof rawData.toolsSoftwareNotes === 'string' ? (rawData.toolsSoftwareNotes.trim() ? JSON.parse(rawData.toolsSoftwareNotes) : null) : rawData.toolsSoftwareNotes)
          : null,
        learnedTools: rawData.learnedTools ? (typeof rawData.learnedTools === 'string' ? JSON.parse(rawData.learnedTools) : rawData.learnedTools) : null,
        experienceTools: rawData.experienceTools ? (typeof rawData.experienceTools === 'string' ? JSON.parse(rawData.experienceTools) : rawData.experienceTools) : null,
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
      const avatarDataUrl = (rawData.avatarBase64 && typeof rawData.avatarBase64 === 'string' && rawData.avatarBase64.startsWith('data:image/')) ? rawData.avatarBase64 : '';
      const cvTemplate = (rawData.cvTemplate && String(rawData.cvTemplate).trim()) || 'common';
      const tab = (rawData.tab === 'rirekisho' || rawData.tab === 'shokumu') ? rawData.tab : 'all';
      const html = generateCvTemplateHtml(cvData, { avatarDataUrl, cvTemplate, tab });
      res.status(200).set('Content-Type', 'text/html; charset=utf-8').send(html);
    } catch (error) {
      next(error);
    }
  }
};

