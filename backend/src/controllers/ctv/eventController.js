import { Event, Post, EventParticipant } from '../../models/index.js';
import { Op } from 'sequelize';

/**
 * CTV Event controller
 * GET /api/ctv/events
 * GET /api/ctv/events/:id
 * POST /api/ctv/events/:id/register
 */
export const ctvEventController = {
  list: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        upcoming = '1',
        sortBy = 'start_at',
        sortOrder = 'ASC',
      } = req.query;

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const where = { status: 1 };

      if (String(upcoming) === '1') {
        where.startAt = { [Op.gte]: new Date() };
      }

      const orderField = ['start_at', 'end_at', 'title', 'created_at'].includes(sortBy) ? sortBy : 'start_at';
      const orderDir = (sortOrder || '').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const orderAttr =
        orderField === 'start_at' ? 'startAt' :
        orderField === 'end_at' ? 'endAt' :
        orderField === 'title' ? 'title' : 'createdAt';

      const { count, rows } = await Event.findAndCountAll({
        where,
        limit: parseInt(limit, 10),
        offset,
        order: [[orderAttr, orderDir], ['id', 'ASC']],
      });

      const totalPages = Math.ceil(count / parseInt(limit, 10)) || 1;
      const events = rows.map((e) => {
        const plain = e.get ? e.get({ plain: true }) : e;
        return {
          ...plain,
          start_at: plain.start_at || plain.startAt,
          end_at: plain.end_at || plain.endAt,
        };
      });

      return res.json({
        success: true,
        data: {
          events,
          pagination: {
            total: count,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages,
          },
        },
      });
    } catch (err) {
      console.error('CTV Event list error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi khi tải danh sách sự kiện' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id, {
        include: [
          {
            model: Post,
            through: { attributes: [] },
            required: false,
            where: { status: 1 },
          },
        ],
        order: [[Post, 'publishedAt', 'DESC'], [Post, 'id', 'DESC']],
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
      }

      const plain = event.get ? event.get({ plain: true }) : event;
      const collaboratorId = req.collaborator?.id;

      let isRegistered = false;
      if (collaboratorId) {
        const existed = await EventParticipant.findOne({
          where: { eventId: id, collaboratorId },
        });
        isRegistered = !!existed;
      }

      return res.json({
        success: true,
        data: {
          event: {
            ...plain,
            start_at: plain.start_at || plain.startAt,
            end_at: plain.end_at || plain.endAt,
            is_registered: isRegistered,
          },
        },
      });
    } catch (err) {
      console.error('CTV Event getById error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi khi tải sự kiện' });
    }
  },

  register: async (req, res) => {
    try {
      const { id } = req.params;
      const collaboratorId = req.collaborator?.id;
      const { name, email, phone } = req.body || {};

      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
      }

      const existed = await EventParticipant.findOne({
        where: { eventId: id, collaboratorId },
      });
      if (existed) {
        return res.json({ success: true, message: 'Đã đăng ký sự kiện', data: { participant: existed } });
      }

      const participant = await EventParticipant.create({
        eventId: id,
        collaboratorId,
        email: (email || '').trim() || null,
        name: (name || '').trim() || null,
        phone: (phone || '').trim() || null,
        isInternal: true,
      });

      return res.status(201).json({
        success: true,
        message: 'Đăng ký sự kiện thành công',
        data: { participant },
      });
    } catch (err) {
      console.error('CTV Event register error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Lỗi khi đăng ký sự kiện' });
    }
  },
};

