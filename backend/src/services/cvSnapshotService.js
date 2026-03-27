/**
 * Lưu CV gốc (snapshot) + sinh PDF template — dùng chung cho createCV và bulk import.
 * Caller chịu trách nhiệm xóa file tạm trên đĩa (multer disk) sau khi gọi xong.
 */
import path from 'path';
import fs from 'fs/promises';
import {
  s3Enabled,
  getCvSnapshotDateTime,
  buildCvOriginalFolderKey,
  buildCvTemplateFolderKey,
  buildCvTemplateFileKey,
  uploadCvOriginalsToSnapshot,
  uploadBufferToS3
} from './s3Service.js';
import { generateCvRirekishoPdfBuffer, generateCvShokumuPdfBuffer } from './cvPdfService.js';
import { Collaborator, Admin } from '../models/index.js';

const templateList = [
  { cvTemplate: 'common', dir: 'Common' },
  { cvTemplate: 'cv_it', dir: 'IT' },
  { cvTemplate: 'cv_technical', dir: 'Technical' }
];

/**
 * @param {import('../models/index.js').CVStorage} cv
 * @param {object} opts
 * @param {Array<{ buffer?: Buffer, path?: string, originalname?: string, mimetype?: string }>} [opts.cvFiles]
 * @param {string} [opts.avatarDataUrl]
 * @param {string} opts.backendRoot
 * @param {string} opts.uploadDir - thư mục gốc uploads/cvs (local)
 * @param {string} [opts.logPrefix]
 */
export async function saveCvOriginalsAndTemplatesForCv(cv, opts) {
  const {
    cvFiles = [],
    avatarDataUrl = '',
    backendRoot,
    uploadDir,
    logPrefix = '[cvSnapshot]'
  } = opts;

  const dateTime = getCvSnapshotDateTime();
  const files = Array.isArray(cvFiles) ? cvFiles.filter(Boolean) : [];

  if (files.length) {
    try {
      if (s3Enabled()) {
        cv.cvOriginalPath = await uploadCvOriginalsToSnapshot(cv.id, dateTime, files);
      } else {
        const snapshotDir = path.join(uploadDir, String(cv.id), dateTime);
        const origDir = path.join(snapshotDir, 'CV_original');
        await fs.mkdir(origDir, { recursive: true });
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const ext = (f.originalname && path.extname(f.originalname)) ? path.extname(f.originalname) : '.pdf';
          const dest = path.join(origDir, `cv-original-${i + 1}${ext}`);
          if (f.path) await fs.copyFile(f.path, dest);
          else if (f.buffer) await fs.writeFile(dest, f.buffer);
        }
        cv.cvOriginalPath = path.relative(backendRoot, origDir);
      }
      await cv.save();
    } catch (e) {
      console.warn(`${logPrefix} Lưu CV gốc thất bại:`, e.message);
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
          console.warn(`${logPrefix} PDF ${templateDir} thất bại:`, e.message);
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
          console.warn(`${logPrefix} PDF ${templateDir} thất bại:`, e.message);
        }
      }
      cv.curriculumVitae = path.relative(backendRoot, tplDir);
    }
    if (cv.curriculumVitae) {
      await cv.save();
      await cv.reload({
        include: [
          { model: Collaborator, as: 'collaborator', required: false },
          { model: Admin, as: 'admin', required: false }
        ]
      });
    }
  } catch (e) {
    console.warn(`${logPrefix} Không thể tạo PDF template:`, e.message);
  }
}
