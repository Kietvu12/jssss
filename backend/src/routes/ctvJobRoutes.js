import express from 'express';
import { jobController } from '../controllers/collaborator/jobController.js';
import { authenticateCTV } from '../middleware/ctvAuth.js';

const router = express.Router();

/**
 * @route   GET /api/ctv/jobs
 * @desc    Get list of jobs (with filters)
 * @access  Private (CTV)
 */
router.get('/', authenticateCTV, jobController.getJobs);

/**
 * @route   GET /api/ctv/jobs/by-campaign/:campaignId
 * @desc    Get jobs by campaign ID
 * @access  Private (CTV)
 */
router.get('/by-campaign/:campaignId', authenticateCTV, jobController.getJobsByCampaign);

/**
 * @route   GET /api/ctv/jobs/by-job-pickup/:jobPickupId
 * @desc    Get jobs by job pickup ID
 * @access  Private (CTV)
 */
router.get('/by-job-pickup/:jobPickupId', authenticateCTV, jobController.getJobsByJobPickup);

/**
 * @route   GET /api/ctv/jobs/:id/view-url
 * @desc    Lấy URL xem/tải file JD hoặc required CV form
 * @access  Private (CTV)
 */
router.get('/:id/view-url', authenticateCTV, jobController.getJobFileUrl);

/**
 * @route   GET /api/ctv/jobs/:id
 * @desc    Get job by ID
 * @access  Private (CTV)
 */
router.get('/:id', authenticateCTV, jobController.getJobById);

export default router;

