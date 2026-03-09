import {
  Message,
  JobApplication,
  Job,
  Admin,
  Collaborator
} from '../../models/index.js';
import { Op, col } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Message Controller (CTV)
 * CTV có thể xem và gửi tin nhắn với Admin
 */
export const messageController = {
  /**
   * Get messages by job application
   * GET /api/ctv/messages/job-application/:jobApplicationId
   */
  getMessagesByJobApplication: async (req, res, next) => {
    try {
      const { jobApplicationId } = req.params;
      const collaboratorId = req.collaborator.id;

      // Verify that the job application belongs to this collaborator
      const jobApplication = await JobApplication.findOne({
        where: {
          id: jobApplicationId,
          collaboratorId: collaboratorId
        }
      });

      if (!jobApplication) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem tin nhắn của đơn ứng tuyển này'
        });
      }

      const messages = await Message.findAll({
        where: {
          jobApplicationId: parseInt(jobApplicationId)
        },
        include: [
          {
            model: JobApplication,
            as: 'jobApplication',
            required: false,
            attributes: ['id', 'status'],
            include: [
              {
                model: Job,
                as: 'job',
                required: false,
                attributes: ['id', 'title', 'jobCode']
              }
            ]
          },
          {
            model: Admin,
            as: 'admin',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false,
            attributes: ['id', 'name', 'email', 'code']
          }
        ],
        order: [[col('Message.created_at'), 'ASC']],
        paranoid: true
      });

      res.json({
        success: true,
        data: { messages }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new message
   * POST /api/ctv/messages
   */
  createMessage: async (req, res, next) => {
    try {
      const {
        jobApplicationId,
        content,
        senderType = 2, // Default: Collaborator
        adminId // Optional: specify which admin to send to
      } = req.body;

      const collaboratorId = req.collaborator.id;

      // Validate required fields
      if (!jobApplicationId || !content) {
        return res.status(400).json({
          success: false,
          message: 'ID đơn ứng tuyển và nội dung tin nhắn là bắt buộc'
        });
      }

      // Verify that the job application belongs to this collaborator
      const jobApplication = await JobApplication.findOne({
        where: {
          id: jobApplicationId,
          collaboratorId: collaboratorId
        }
      });

      if (!jobApplication) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền gửi tin nhắn cho đơn ứng tuyển này'
        });
      }

      // Validate sender type (CTV can only send as Collaborator or System)
      if (![2, 3].includes(senderType)) {
        return res.status(400).json({
          success: false,
          message: 'Loại người gửi không hợp lệ (2: Collaborator, 3: System)'
        });
      }

      // Validate adminId if provided
      let adminIdToUse = null;
      if (adminId) {
        const admin = await Admin.findByPk(adminId);
        if (!admin) {
          return res.status(404).json({
            success: false,
            message: 'Admin không tồn tại'
          });
        }
        // Only allow super admin (role = 1) or backoffice (role = 2)
        if (admin.role !== 1 && admin.role !== 2) {
          return res.status(403).json({
            success: false,
            message: 'Chỉ có thể gửi tin nhắn đến Super Admin hoặc Admin Backoffice'
          });
        }
        adminIdToUse = parseInt(adminId);
      }

      const message = await Message.create({
        jobApplicationId,
        adminId: adminIdToUse,
        collaboratorId: collaboratorId,
        senderType,
        content,
        isReadByAdmin: false,
        isReadByCollaborator: true // CTV đã đọc tin nhắn của chính mình
      });

      // Reload with relations
      await message.reload({
        include: [
          {
            model: JobApplication,
            as: 'jobApplication',
            required: false,
            include: [
              {
                model: Job,
                as: 'job',
                required: false
              }
            ]
          },
          {
            model: Admin,
            as: 'admin',
            required: false
          },
          {
            model: Collaborator,
            as: 'collaborator',
            required: false
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Gửi tin nhắn thành công',
        data: { message }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark message as read by collaborator
   * PATCH /api/ctv/messages/:id/mark-read
   */
  markReadByCollaborator: async (req, res, next) => {
    try {
      const { id } = req.params;
      const collaboratorId = req.collaborator.id;

      // Get job applications for this collaborator
      const jobApplications = await JobApplication.findAll({
        where: { collaboratorId },
        attributes: ['id']
      });
      const jobApplicationIds = jobApplications.map(ja => ja.id);

      const message = await Message.findOne({
        where: {
          id: parseInt(id),
          jobApplicationId: {
            [Op.in]: jobApplicationIds
          }
        }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin nhắn'
        });
      }

      message.isReadByCollaborator = true;
      await message.save();

      res.json({
        success: true,
        message: 'Đã đánh dấu đã đọc',
        data: { message }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all messages as read by collaborator for a job application
   * PATCH /api/ctv/messages/job-application/:jobApplicationId/mark-all-read
   */
  markAllReadByCollaborator: async (req, res, next) => {
    try {
      const { jobApplicationId } = req.params;
      const collaboratorId = req.collaborator.id;

      // Verify that the job application belongs to this collaborator
      const jobApplication = await JobApplication.findOne({
        where: {
          id: jobApplicationId,
          collaboratorId: collaboratorId
        }
      });

      if (!jobApplication) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem tin nhắn của đơn ứng tuyển này'
        });
      }

      await Message.update(
        { isReadByCollaborator: true },
        {
          where: {
            jobApplicationId: parseInt(jobApplicationId),
            isReadByCollaborator: false
          }
        }
      );

      res.json({
        success: true,
        message: 'Đã đánh dấu tất cả tin nhắn là đã đọc'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete message (soft delete)
   * DELETE /api/ctv/messages/:id
   */
  deleteMessage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const collaboratorId = req.collaborator.id;

      const message = await Message.findOne({
        where: {
          id: parseInt(id),
          collaboratorId: collaboratorId,
          senderType: 2 // CTV chỉ có thể xóa tin nhắn của chính mình
        }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin nhắn hoặc bạn không có quyền xóa'
        });
      }

      await message.destroy();

      res.json({
        success: true,
        message: 'Xóa tin nhắn thành công'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread message count (messages from Admin that CTV has not read)
   * GET /api/ctv/messages/unread-count
   */
  getUnreadCount: async (req, res, next) => {
    try {
      const collaboratorId = req.collaborator.id;
      const count = await Message.count({
        where: {
          senderType: 1, // Admin
          isReadByCollaborator: false
        },
        include: [{
          model: JobApplication,
          as: 'jobApplication',
          required: true,
          attributes: [],
          where: { collaboratorId }
        }],
        paranoid: true
      });
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread message count per job application (for CTV list badge)
   * GET /api/ctv/messages/unread-by-application
   */
  getUnreadByJobApplication: async (req, res, next) => {
    try {
      const collaboratorId = req.collaborator.id;
      const rows = await Message.findAll({
        attributes: [
          'jobApplicationId',
          [sequelize.fn('COUNT', sequelize.col('Message.id')), 'count']
        ],
        where: {
          senderType: 1,
          isReadByCollaborator: false
        },
        include: [{
          model: JobApplication,
          as: 'jobApplication',
          required: true,
          attributes: [],
          where: { collaboratorId }
        }],
        group: ['Message.job_application_id'],
        raw: true,
        paranoid: true
      });
      const map = {};
      rows.forEach((r) => {
        const jaId = r.jobApplicationId ?? r.job_application_id;
        if (jaId != null) map[jaId] = parseInt(r.count, 10) || 0;
      });
      res.json({ success: true, data: { unreadByJobApplication: map } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get list of admins (Super Admin and Backoffice only) for CTV to send messages
   * GET /api/ctv/messages/admins
   */
  getAdminsForMessage: async (req, res, next) => {
    try {
      const { search, status = 1 } = req.query;

      const where = {
        role: { [Op.in]: [1, 2] }, // Only Super Admin (1) and Backoffice (2)
        status: parseInt(status) // Only active admins by default
      };

      // Search by name or email
      if (search) {
        where[Op.and] = [
          { role: { [Op.in]: [1, 2] } },
          { status: parseInt(status) },
          {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } }
            ]
          }
        ];
        delete where.role;
        delete where.status;
      }

      const admins = await Admin.findAll({
        where,
        attributes: ['id', 'name', 'email', 'role', 'status'],
        order: [['name', 'ASC']],
        limit: 100
      });

      res.json({
        success: true,
        data: { admins }
      });
    } catch (error) {
      next(error);
    }
  }
};

