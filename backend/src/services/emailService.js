import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Email Service - Tích hợp với Outlook/Gmail
 * Sử dụng kietvu389@gmail.com làm email nguồn
 */
class EmailService {
  constructor() {
    // Cấu hình email nguồn (Outlook/Gmail)
    this.fromEmail = config.email.from;
    this.fromName = config.email.fromName;
    
    // Tạo transporter với Outlook/Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: config.email.service, // 'gmail' or 'outlook'
      auth: {
        user: config.email.user,
        pass: config.email.password // App Password cho Gmail
      }
    });
  }

  /**
   * Gửi email đơn giản
   * @param {Object} options - { to, subject, text, html, attachments }
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || options.text,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        attachments: options.attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Gửi email với file đính kèm
   * @param {Object} options - { to, subject, text, html, filePath, fileName }
   */
  async sendEmailWithAttachment(options) {
    try {
      const attachments = [];
      
      if (options.filePath && fs.existsSync(options.filePath)) {
        attachments.push({
          filename: options.fileName || path.basename(options.filePath),
          path: options.filePath
        });
      }

      return await this.sendEmail({
        ...options,
        attachments
      });
    } catch (error) {
      console.error('Error sending email with attachment:', error);
      throw error;
    }
  }

  /**
   * Gửi email đến nhiều người nhận
   * @param {Object} options - { recipients (array), subject, text, html, attachments }
   */
  async sendBulkEmail(options) {
    try {
      const results = [];
      const recipients = Array.isArray(options.recipients) ? options.recipients : [options.recipients];
      
      for (const recipient of recipients) {
        try {
          const result = await this.sendEmail({
            to: recipient.email || recipient,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments
          });
          
          results.push({
            recipient,
            success: true,
            messageId: result.messageId
          });
        } catch (error) {
          results.push({
            recipient,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        total: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối email
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('Email service verification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();

