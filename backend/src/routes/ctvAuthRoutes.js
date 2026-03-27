import express from 'express';
import { collaboratorAuthController } from '../controllers/collaborator/collaboratorAuthController.js';
import { authenticateCTV } from '../middleware/ctvAuth.js';

const router = express.Router();

/**
 * @route   POST /api/ctv/auth/register
 * @desc    Đăng ký tài khoản CTV mới
 * @access  Public
 */
router.post('/register', collaboratorAuthController.register);

/**
 * @route   GET /api/ctv/auth/verify-email
 * @desc    Xác thực email CTV và tự động duyệt tài khoản
 * @access  Public
 */
router.get('/verify-email', collaboratorAuthController.verifyEmail);

/**
 * @route   POST /api/ctv/auth/login
 * @desc    Đăng nhập CTV
 * @access  Public
 */
router.post('/login', collaboratorAuthController.login);

/**
 * @route   GET /api/ctv/auth/me
 * @desc    Lấy thông tin CTV hiện tại
 * @access  Private (CTV)
 */
router.get('/me', authenticateCTV, collaboratorAuthController.getMe);

/**
 * @route   PUT /api/ctv/auth/me
 * @desc    Cập nhật thông tin cá nhân CTV (chỉ các trường được phép)
 * @access  Private (CTV)
 */
router.put('/me', authenticateCTV, collaboratorAuthController.updateMe);

/**
 * @route   POST /api/ctv/auth/logout
 * @desc    Đăng xuất CTV
 * @access  Private (CTV)
 */
router.post('/logout', authenticateCTV, collaboratorAuthController.logout);

export default router;

