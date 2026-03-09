import { OutlookConnection, SyncedEmail } from '../../models/index.js';
import outlookService from '../../services/outlookService.js';
import { Op } from 'sequelize';

/**
 * Outlook Email Controller
 * Quản lý kết nối và đồng bộ email với Outlook
 */
export const outlookEmailController = {
  /**
   * Lấy authorization URL để kết nối Outlook
   * GET /api/admin/emails/outlook/authorize
   */
  getAuthorizationUrl: async (req, res, next) => {
    try {
      const authUrl = outlookService.getAuthorizationUrl();
      res.json({
        success: true,
        data: {
          authorizationUrl: authUrl
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xử lý OAuth callback và lưu tokens
   * GET /api/admin/emails/outlook/oauth/callback
   */
  handleOAuthCallback: async (req, res, next) => {
    try {
      const { code, error } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/emails?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/emails?error=no_code`);
      }

      // Lấy access token
      const tokens = await outlookService.getAccessTokenFromCode(code);
      
      // Lấy thông tin user
      outlookService.setAccessToken(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
      const userProfile = await outlookService.getUserProfile();

      // Lưu hoặc cập nhật connection
      const [connection, created] = await OutlookConnection.upsert({
        email: userProfile.mail || userProfile.userPrincipalName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(tokens.expiresAt),
        isActive: true,
        syncEnabled: true
      }, {
        returning: true
      });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/emails?success=connected&email=${encodeURIComponent(connection.email)}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/emails?error=${encodeURIComponent(error.message)}`);
    }
  },

  /**
   * Lấy danh sách connections
   * GET /api/admin/emails/outlook/connections
   */
  getConnections: async (req, res, next) => {
    try {
      const connections = await OutlookConnection.findAll({
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: connections.map(conn => ({
          id: conn.id,
          email: conn.email,
          isActive: conn.isActive,
          syncEnabled: conn.syncEnabled,
          lastSyncAt: conn.lastSyncAt,
          createdAt: conn.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Đồng bộ email từ Outlook
   * POST /api/admin/emails/outlook/sync
   */
  syncEmails: async (req, res, next) => {
    try {
      const { connectionId, folder = 'inbox', limit = 50 } = req.body;

      const connection = await OutlookConnection.findByPk(connectionId);
      if (!connection) {
        return res.status(404).json({
          success: false,
          message: 'Connection not found'
        });
      }

      if (!connection.isActive || !connection.syncEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Connection is not active or sync is disabled'
        });
      }

      // Set tokens
      outlookService.setAccessToken(
        connection.accessToken,
        connection.refreshToken,
        connection.expiresAt
      );

      // Đảm bảo token còn hiệu lực
      const newTokens = await outlookService.ensureValidToken();
      if (newTokens) {
        // Cập nhật tokens mới
        await connection.update({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: new Date(newTokens.expiresAt)
        });
        outlookService.setAccessToken(
          newTokens.accessToken,
          newTokens.refreshToken,
          newTokens.expiresAt
        );
      }

      // Lấy email từ Outlook
      const messages = await outlookService.getMessages(folder, limit);

      let syncedCount = 0;
      let updatedCount = 0;

      for (const message of messages.value || []) {
        const emailData = {
          outlookConnectionId: connection.id,
          messageId: message.id,
          conversationId: message.conversationId,
          internetMessageId: message.internetMessageId,
          subject: message.subject,
          body: message.body?.content || '',
          bodyPreview: message.bodyPreview || '',
          fromEmail: message.from?.emailAddress?.address || '',
          fromName: message.from?.emailAddress?.name || '',
          toRecipients: message.toRecipients?.map(r => ({
            email: r.emailAddress?.address,
            name: r.emailAddress?.name
          })) || [],
          ccRecipients: message.ccRecipients?.map(r => ({
            email: r.emailAddress?.address,
            name: r.emailAddress?.name
          })) || [],
          bccRecipients: message.bccRecipients?.map(r => ({
            email: r.emailAddress?.address,
            name: r.emailAddress?.name
          })) || [],
          receivedDateTime: message.receivedDateTime ? new Date(message.receivedDateTime) : null,
          sentDateTime: message.sentDateTime ? new Date(message.sentDateTime) : null,
          isRead: message.isRead || false,
          hasAttachments: message.hasAttachments || false,
          importance: message.importance || 'normal',
          folder: folder,
          direction: message.from?.emailAddress?.address === connection.email ? 'outbound' : 'inbound'
        };

        const [syncedEmail, created] = await SyncedEmail.upsert(emailData, {
          conflictFields: ['message_id'],
          returning: true
        });

        if (created) {
          syncedCount++;
        } else {
          updatedCount++;
        }
      }

      // Cập nhật lastSyncAt
      await connection.update({
        lastSyncAt: new Date()
      });

      res.json({
        success: true,
        data: {
          syncedCount,
          updatedCount,
          total: (messages.value || []).length,
          lastSyncAt: new Date()
        }
      });
    } catch (error) {
      console.error('Sync emails error:', error);
      next(error);
    }
  },

  /**
   * Lấy danh sách email đã đồng bộ
   * GET /api/admin/emails/outlook/synced
   */
  getSyncedEmails: async (req, res, next) => {
    try {
      const {
        connectionId,
        folder = 'inbox',
        isRead,
        page = 1,
        limit = 50,
        search
      } = req.query;

      const where = {};
      if (connectionId) where.outlookConnectionId = connectionId;
      if (folder) where.folder = folder;
      if (isRead !== undefined) where.isRead = isRead === 'true';

      if (search) {
        where[Op.or] = [
          { subject: { [Op.like]: `%${search}%` } },
          { fromEmail: { [Op.like]: `%${search}%` } },
          { fromName: { [Op.like]: `%${search}%` } },
          { bodyPreview: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await SyncedEmail.findAndCountAll({
        where,
        include: [{
          model: OutlookConnection,
          as: 'outlookConnection',
          attributes: ['id', 'email']
        }],
        order: [['received_date_time', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          emails: rows,
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
   * Lấy chi tiết một email
   * GET /api/admin/emails/outlook/synced/:id
   */
  getEmailDetail: async (req, res, next) => {
    try {
      const { id } = req.params;

      const email = await SyncedEmail.findByPk(id, {
        include: [{
          model: OutlookConnection,
          as: 'outlookConnection',
          attributes: ['id', 'email']
        }]
      });

      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }

      res.json({
        success: true,
        data: email
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gửi email qua Outlook
   * POST /api/admin/emails/outlook/send
   */
  sendEmail: async (req, res, next) => {
    try {
      const { connectionId, to, cc, bcc, subject, body, bodyType = 'HTML', attachments } = req.body;

      const connection = await OutlookConnection.findByPk(connectionId);
      if (!connection || !connection.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Connection not found or not active'
        });
      }

      // Set tokens
      outlookService.setAccessToken(
        connection.accessToken,
        connection.refreshToken,
        connection.expiresAt
      );

      // Đảm bảo token còn hiệu lực
      const newTokens = await outlookService.ensureValidToken();
      if (newTokens) {
        await connection.update({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresAt: new Date(newTokens.expiresAt)
        });
        outlookService.setAccessToken(
          newTokens.accessToken,
          newTokens.refreshToken,
          newTokens.expiresAt
        );
      }

      // Gửi email
      const result = await outlookService.sendMessage({
        to: Array.isArray(to) ? to : [to],
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        subject,
        body,
        bodyType,
        attachments,
        saveToSentItems: true
      });

      // Đồng bộ thư mục "Đã gửi" vào DB để email vừa gửi hiển thị trong phần Đã gửi
      try {
        const sentMessages = await outlookService.getMessages('sentitems', 20);
        for (const message of sentMessages.value || []) {
          const emailData = {
            outlookConnectionId: connection.id,
            messageId: message.id,
            conversationId: message.conversationId,
            internetMessageId: message.internetMessageId,
            subject: message.subject,
            body: message.body?.content || '',
            bodyPreview: message.bodyPreview || '',
            fromEmail: message.from?.emailAddress?.address || '',
            fromName: message.from?.emailAddress?.name || '',
            toRecipients: message.toRecipients?.map(r => ({
              email: r.emailAddress?.address,
              name: r.emailAddress?.name
            })) || [],
            ccRecipients: message.ccRecipients?.map(r => ({
              email: r.emailAddress?.address,
              name: r.emailAddress?.name
            })) || [],
            bccRecipients: message.bccRecipients?.map(r => ({
              email: r.emailAddress?.address,
              name: r.emailAddress?.name
            })) || [],
            receivedDateTime: message.receivedDateTime ? new Date(message.receivedDateTime) : null,
            sentDateTime: message.sentDateTime ? new Date(message.sentDateTime) : null,
            isRead: message.isRead || false,
            hasAttachments: message.hasAttachments || false,
            importance: message.importance || 'normal',
            folder: 'sentitems',
            direction: message.from?.emailAddress?.address === connection.email ? 'outbound' : 'inbound'
          };
          await SyncedEmail.upsert(emailData, {
            conflictFields: ['message_id'],
            returning: false
          });
        }
      } catch (syncErr) {
        console.error('Sync sent items after send:', syncErr);
        // Không fail request gửi email vì đã gửi thành công
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Send email error:', error);
      next(error);
    }
  },

  /**
   * Đánh dấu email đã đọc
   * PATCH /api/admin/emails/outlook/synced/:id/read
   */
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;

      const email = await SyncedEmail.findByPk(id, {
        include: [{
          model: OutlookConnection,
          as: 'outlookConnection'
        }]
      });

      if (!email) {
        return res.status(404).json({
          success: false,
          message: 'Email not found'
        });
      }

      // Đánh dấu đọc trong Outlook
      outlookService.setAccessToken(
        email.outlookConnection.accessToken,
        email.outlookConnection.refreshToken,
        email.outlookConnection.expiresAt
      );

      try {
        await outlookService.markAsRead(email.messageId);
      } catch (error) {
        console.error('Failed to mark as read in Outlook:', error);
      }

      // Cập nhật trong DB
      await email.update({ isRead: true });

      res.json({
        success: true,
        data: email
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Xóa connection
   * DELETE /api/admin/emails/outlook/connections/:id
   */
  deleteConnection: async (req, res, next) => {
    try {
      const { id } = req.params;

      const connection = await OutlookConnection.findByPk(id);
      if (!connection) {
        return res.status(404).json({
          success: false,
          message: 'Connection not found'
        });
      }

      await connection.destroy();

      res.json({
        success: true,
        message: 'Connection deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle sync enabled
   * PATCH /api/admin/emails/outlook/connections/:id/toggle-sync
   */
  toggleSync: async (req, res, next) => {
    try {
      const { id } = req.params;

      const connection = await OutlookConnection.findByPk(id);
      if (!connection) {
        return res.status(404).json({
          success: false,
          message: 'Connection not found'
        });
      }

      await connection.update({
        syncEnabled: !connection.syncEnabled
      });

      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      next(error);
    }
  }
};

