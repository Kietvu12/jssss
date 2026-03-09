import { Post } from '../../models/index.js';
import { Op } from 'sequelize';

// Helper function to map model field names to database column names
const mapOrderField = (fieldName) => {
  const fieldMap = {
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    'publishedAt': 'published_at',
    'viewCount': 'view_count',
    'likeCount': 'like_count'
  };
  return fieldMap[fieldName] || fieldName;
};

/**
 * Post Controller (CTV)
 * CTV chỉ có thể xem posts đã được publish (status = 2)
 */
export const postController = {
  /**
   * Get list of posts (CTV)
   * GET /api/ctv/posts
   */
  getPosts: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status = 2, // Mặc định chỉ lấy posts đã publish (status = 2)
        categoryId,
        sortBy = 'published_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Chỉ lấy posts đã publish (status = 2)
      where.status = 2;

      // Search by title, slug, or content
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by category (category_id is string)
      if (categoryId) {
        where.categoryId = categoryId.toString();
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'publishedAt', 'viewCount', 'likeCount', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'published_at';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'DESC']);
      }

      const { count, rows } = await Post.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      res.json({
        success: true,
        data: {
          posts: rows,
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
   * Get post by ID (CTV)
   * GET /api/ctv/posts/:id
   */
  getPostById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await Post.findOne({
        where: {
          id,
          status: 2 // Chỉ lấy posts đã publish
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy post hoặc post chưa được publish'
        });
      }

      res.json({
        success: true,
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  }
};

