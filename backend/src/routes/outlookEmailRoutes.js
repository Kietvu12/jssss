import express from 'express';
import { outlookEmailController } from '../controllers/admin/outlookEmailController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/emails/outlook/authorize
 * @desc    Lấy authorization URL để kết nối Outlook
 * @access  Private
 */
router.get('/authorize', authenticate, outlookEmailController.getAuthorizationUrl);

/**
 * @route   GET /api/admin/emails/outlook/oauth/callback
 * @desc    Xử lý OAuth callback từ Microsoft
 * @access  Public (callback từ Microsoft)
 */
router.get('/oauth/callback', outlookEmailController.handleOAuthCallback);

/**
 * @route   GET /api/admin/emails/outlook/connections
 * @desc    Lấy danh sách Outlook connections
 * @access  Private
 */
router.get('/connections', authenticate, outlookEmailController.getConnections);

/**
 * @route   POST /api/admin/emails/outlook/sync
 * @desc    Đồng bộ email từ Outlook
 * @access  Private
 */
router.post('/sync', authenticate, outlookEmailController.syncEmails);

/**
 * @route   GET /api/admin/emails/outlook/synced
 * @desc    Lấy danh sách email đã đồng bộ
 * @access  Private
 */
router.get('/synced', authenticate, outlookEmailController.getSyncedEmails);

/**
 * @route   GET /api/admin/emails/outlook/synced/:id
 * @desc    Lấy chi tiết một email
 * @access  Private
 */
router.get('/synced/:id', authenticate, outlookEmailController.getEmailDetail);

/**
 * @route   POST /api/admin/emails/outlook/send
 * @desc    Gửi email qua Outlook
 * @access  Private
 */
router.post('/send', authenticate, outlookEmailController.sendEmail);

/**
 * @route   PATCH /api/admin/emails/outlook/synced/:id/read
 * @desc    Đánh dấu email đã đọc
 * @access  Private
 */
router.patch('/synced/:id/read', authenticate, outlookEmailController.markAsRead);

/**
 * @route   DELETE /api/admin/emails/outlook/connections/:id
 * @desc    Xóa Outlook connection
 * @access  Private
 */
router.delete('/connections/:id', authenticate, outlookEmailController.deleteConnection);

/**
 * @route   PATCH /api/admin/emails/outlook/connections/:id/toggle-sync
 * @desc    Bật/tắt đồng bộ cho connection
 * @access  Private
 */
router.patch('/connections/:id/toggle-sync', authenticate, outlookEmailController.toggleSync);

/**
 * @route   POST /api/admin/emails/outlook/sync-all
 * @desc    Đồng bộ tất cả connections (cron job endpoint)
 * @access  Private
 */
router.post('/sync-all', authenticate, async (req, res, next) => {
  try {
    const { emailSyncJob } = await import('../jobs/emailSyncJob.js');
    const result = await emailSyncJob.syncAllConnections();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export default router;

