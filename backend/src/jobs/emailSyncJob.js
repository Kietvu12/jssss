import { OutlookConnection, SyncedEmail } from '../models/index.js';
import outlookService from '../services/outlookService.js';
import { Op } from 'sequelize';

/**
 * Email Sync Job
 * Đồng bộ email từ Outlook định kỳ
 */
export const emailSyncJob = {
  /**
   * Đồng bộ email cho tất cả các connection đang active
   */
  syncAllConnections: async () => {
    try {
      console.log('[Email Sync Job] Starting sync for all active connections...');
      
      const connections = await OutlookConnection.findAll({
        where: {
          isActive: true,
          syncEnabled: true
        }
      });

      if (connections.length === 0) {
        console.log('[Email Sync Job] No active connections found');
        return;
      }

      let totalSynced = 0;
      let totalUpdated = 0;
      let errors = [];

      for (const connection of connections) {
        try {
          console.log(`[Email Sync Job] Syncing connection: ${connection.email}`);
          
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

          // Đồng bộ inbox
          const inboxMessages = await outlookService.getMessages('inbox', 100);
          const inboxResult = await syncMessages(connection, inboxMessages, 'inbox');
          totalSynced += inboxResult.synced;
          totalUpdated += inboxResult.updated;

          // Đồng bộ sent items
          const sentMessages = await outlookService.getMessages('sentitems', 50);
          const sentResult = await syncMessages(connection, sentMessages, 'sentitems');
          totalSynced += sentResult.synced;
          totalUpdated += sentResult.updated;

          // Cập nhật lastSyncAt
          await connection.update({
            lastSyncAt: new Date()
          });

          console.log(`[Email Sync Job] Completed sync for ${connection.email}: ${inboxResult.synced + sentResult.synced} new, ${inboxResult.updated + sentResult.updated} updated`);
        } catch (error) {
          console.error(`[Email Sync Job] Error syncing ${connection.email}:`, error);
          errors.push({
            email: connection.email,
            error: error.message
          });
        }
      }

      console.log(`[Email Sync Job] Sync completed. Total: ${totalSynced} new, ${totalUpdated} updated. Errors: ${errors.length}`);
      
      return {
        success: true,
        synced: totalSynced,
        updated: totalUpdated,
        errors
      };
    } catch (error) {
      console.error('[Email Sync Job] Fatal error:', error);
      throw error;
    }
  },

  /**
   * Đồng bộ email cho một connection cụ thể
   */
  syncConnection: async (connectionId) => {
    try {
      const connection = await OutlookConnection.findByPk(connectionId);
      if (!connection || !connection.isActive || !connection.syncEnabled) {
        throw new Error('Connection not found or not active');
      }

      outlookService.setAccessToken(
        connection.accessToken,
        connection.refreshToken,
        connection.expiresAt
      );

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

      const inboxMessages = await outlookService.getMessages('inbox', 100);
      const inboxResult = await syncMessages(connection, inboxMessages, 'inbox');

      const sentMessages = await outlookService.getMessages('sentitems', 50);
      const sentResult = await syncMessages(connection, sentMessages, 'sentitems');

      await connection.update({
        lastSyncAt: new Date()
      });

      return {
        success: true,
        synced: inboxResult.synced + sentResult.synced,
        updated: inboxResult.updated + sentResult.updated
      };
    } catch (error) {
      console.error(`[Email Sync Job] Error syncing connection ${connectionId}:`, error);
      throw error;
    }
  }
};

/**
 * Helper function để đồng bộ messages vào database
 */
async function syncMessages(connection, messages, folder) {
  let synced = 0;
  let updated = 0;

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
      synced++;
    } else {
      updated++;
    }
  }

  return { synced, updated };
}

