import express from 'express';
import { reportsController } from '../controllers/admin/reportsController.js';
import { authenticate, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/reports/nomination-effectiveness
 * @desc    Get nomination effectiveness statistics (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/nomination-effectiveness', authenticate, isSuperAdmin, reportsController.getNominationEffectiveness);

/**
 * @route   GET /api/admin/reports/platform-effectiveness
 * @desc    Get platform operation effectiveness (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/platform-effectiveness', authenticate, isSuperAdmin, reportsController.getPlatformEffectiveness);

/**
 * @route   GET /api/admin/reports/hr-effectiveness
 * @desc    Get HR management effectiveness (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/hr-effectiveness', authenticate, isSuperAdmin, reportsController.getHREffectiveness);

/**
 * @route   GET /api/admin/reports/my-performance
 * @desc    Get admin's own performance report (All admins)
 * @access  Private
 */
router.get('/my-performance', authenticate, reportsController.getMyPerformance);

export default router;

