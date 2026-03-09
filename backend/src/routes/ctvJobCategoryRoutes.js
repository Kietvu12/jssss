import express from 'express';
import { ctvJobCategoryController } from '../controllers/collaborator/jobCategoryController.js';
import { authenticateCTV } from '../middleware/ctvAuth.js';

const router = express.Router();

/**
 * @route   GET /api/ctv/job-categories
 * @desc    Get list of job categories for CTVs
 * @access  Private (CTV)
 */
router.get('/', authenticateCTV, ctvJobCategoryController.getJobCategories);

/**
 * @route   GET /api/ctv/job-categories/tree
 * @desc    Get job category tree (hierarchical structure) for CTVs
 * @access  Private (CTV)
 */
router.get('/tree', authenticateCTV, ctvJobCategoryController.getJobCategoryTree);

export default router;

