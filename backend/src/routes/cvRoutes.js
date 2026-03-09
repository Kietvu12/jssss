import express from 'express';
import { cvController } from '../controllers/admin/cvController.js';
import { authenticate, isSuperAdminOrBackoffice } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/cvs
 * @desc    Lấy danh sách CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.get('/', authenticate, isSuperAdminOrBackoffice, cvController.getCVs);

/**
 * @route   POST /api/admin/cvs/mark-overdue
 * @desc    Đánh dấu CV quá hạn 6 tháng và chuyển CV trùng mới nhất sang Hồ sơ mới
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.post('/mark-overdue', authenticate, isSuperAdminOrBackoffice, cvController.markOverdueCVs);

/**
 * @route   GET /api/admin/cvs/:id
 * @desc    Lấy thông tin CV theo ID
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.get('/:id', authenticate, isSuperAdminOrBackoffice, cvController.getCVById);

/**
 * @route   POST /api/admin/cvs
 * @desc    Tạo CV mới
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.post('/', authenticate, isSuperAdminOrBackoffice, cvController.createCV);

/**
 * @route   POST /api/admin/cvs/preview
 * @desc    Preview CV template HTML (không lưu, chỉ render)
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.post('/preview', authenticate, isSuperAdminOrBackoffice, cvController.previewCVTemplate);

/**
 * @route   PUT /api/admin/cvs/:id
 * @desc    Cập nhật CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.put('/:id', authenticate, isSuperAdminOrBackoffice, cvController.updateCV);

/**
 * @route   DELETE /api/admin/cvs/:id
 * @desc    Xóa CV (soft delete)
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.delete('/:id', authenticate, isSuperAdminOrBackoffice, cvController.deleteCV);

/**
 * @route   GET /api/admin/cvs/:id/history
 * @desc    Lấy lịch sử cập nhật CV
 * @access  Private (Super Admin or Admin Backoffice)
 */
router.get('/:id/history', authenticate, isSuperAdminOrBackoffice, cvController.getCVHistory);

export default router;

