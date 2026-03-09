import { Post, Category, Admin, ActionLog } from '../../models/index.js';
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
 * Post Management Controller (Admin)
 */
export const postController = {
  /**
   * Get list of posts
   * GET /api/admin/posts
   */
  getPosts: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        type,
        categoryId,
        authorId,
        publishedFrom,
        publishedTo,
        sortBy = 'id',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search by title, slug, or content
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filter by status
      if (status !== undefined) {
        where.status = parseInt(status);
      }

      // Filter by type
      if (type !== undefined) {
        where.type = parseInt(type);
      }

      // Filter by category (category_id is string)
      if (categoryId) {
        where.categoryId = categoryId.toString();
      }

      // Filter by author
      if (authorId) {
        where.authorId = parseInt(authorId);
      }

      // Filter by published date
      if (publishedFrom || publishedTo) {
        where.published_at = {};
        if (publishedFrom) {
          where.published_at[Op.gte] = new Date(publishedFrom);
        }
        if (publishedTo) {
          where.published_at[Op.lte] = new Date(publishedTo);
        }
      }

      // Validate sortBy
      const allowedSortFields = ['id', 'title', 'status', 'publishedAt', 'viewCount', 'likeCount', 'createdAt', 'updatedAt'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      const dbSortField = mapOrderField(sortField);

      // Build order clause
      const orderClause = [[dbSortField, orderDirection]];
      if (sortField !== 'id') {
        orderClause.push(['id', 'ASC']);
      }

      const { count, rows } = await Post.findAndCountAll({
        where,
        include: [
          {
            model: Admin,
            as: 'author',
            required: false,
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: orderClause
      });

      // Get category info for each post (category_id is string)
      for (const post of rows) {
        if (post.categoryId) {
          const category = await Category.findByPk(post.categoryId);
          post.dataValues.category = category;
        } else {
          post.dataValues.category = null;
        }
      }

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
   * Get post by ID
   * GET /api/admin/posts/:id
   */
  getPostById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id, {
        include: [
          {
            model: Admin,
            as: 'author',
            required: false
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      // Get category info (category_id is string)
      if (post.categoryId) {
        const category = await Category.findByPk(post.categoryId);
        post.dataValues.category = category;
      } else {
        post.dataValues.category = null;
      }

      res.json({
        success: true,
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new post
   * POST /api/admin/posts
   */
  createPost: async (req, res, next) => {
    try {
      const {
        title,
        content,
        slug,
        image,
        status = 1,
        type = 1,
        categoryId,
        tag,
        metaTitle,
        metaDescription,
        metaKeywords,
        metaImage,
        metaUrl,
        publishedAt
      } = req.body;

      // Validate required fields
      if (!title || !content || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Tiêu đề, nội dung và slug là bắt buộc'
        });
      }

      // Check if slug already exists
      const existingPost = await Post.findOne({ where: { slug } });
      if (existingPost) {
        return res.status(409).json({
          success: false,
          message: 'Slug đã tồn tại'
        });
      }

      // Validate category if provided (category_id is string)
      if (categoryId) {
        const category = await Category.findByPk(categoryId.toString());
        if (!category) {
          return res.status(404).json({
            success: false,
            message: 'Danh mục không tồn tại'
          });
        }
      }

      const post = await Post.create({
        title,
        content,
        slug,
        image,
        status,
        type,
        categoryId: categoryId ? categoryId.toString() : null,
        authorId: req.admin.id,
        tag,
        metaTitle,
        metaDescription,
        metaKeywords,
        metaImage,
        metaUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : null
      });

      // Reload with relations
      await post.reload({
        include: [
          {
            model: Admin,
            as: 'author',
            required: false
          }
        ]
      });

      // Get category info
      if (post.categoryId) {
        const category = await Category.findByPk(post.categoryId);
        post.dataValues.category = category;
      }

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Post',
        action: 'create',
        ip: req.ip || req.connection.remoteAddress,
        after: post.toJSON(),
        description: `Tạo mới bài viết: ${post.title}`
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bài viết thành công',
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update post
   * PUT /api/admin/posts/:id
   */
  updatePost: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      const oldData = post.toJSON();

      // Check if new slug already exists (excluding current post)
      if (updateData.slug && updateData.slug !== post.slug) {
        const existingPost = await Post.findOne({
          where: { slug: updateData.slug, id: { [Op.ne]: id } }
        });
        if (existingPost) {
          return res.status(409).json({
            success: false,
            message: 'Slug đã tồn tại'
          });
        }
      }

      // Validate category if being changed (category_id is string)
      if (updateData.categoryId !== undefined && updateData.categoryId !== post.categoryId) {
        if (updateData.categoryId) {
          const category = await Category.findByPk(updateData.categoryId.toString());
          if (!category) {
            return res.status(404).json({
              success: false,
              message: 'Danh mục không tồn tại'
            });
          }
        }
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          if (key === 'categoryId') {
            post[key] = updateData[key] ? updateData[key].toString() : null;
          } else if (key === 'publishedAt' && updateData[key]) {
            post[key] = new Date(updateData[key]);
          } else {
            post[key] = updateData[key];
          }
        }
      });

      await post.save();

      // Reload with relations
      await post.reload({
        include: [
          {
            model: Admin,
            as: 'author',
            required: false
          }
        ]
      });

      // Get category info
      if (post.categoryId) {
        const category = await Category.findByPk(post.categoryId);
        post.dataValues.category = category;
      }

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Post',
        action: 'edit',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: post.toJSON(),
        description: `Cập nhật bài viết: ${post.title}`
      });

      res.json({
        success: true,
        message: 'Cập nhật bài viết thành công',
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update post status
   * PATCH /api/admin/posts/:id/status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái là bắt buộc'
        });
      }

      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      const oldData = post.toJSON();

      post.status = parseInt(status);
      await post.save();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Post',
        action: 'update_status',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        after: post.toJSON(),
        description: `Cập nhật trạng thái bài viết: ${post.title} - Status: ${status}`
      });

      res.json({
        success: true,
        message: 'Cập nhật trạng thái bài viết thành công',
        data: { post }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete post (soft delete)
   * DELETE /api/admin/posts/:id
   */
  deletePost: async (req, res, next) => {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }

      const oldData = post.toJSON();

      // Soft delete
      await post.destroy();

      // Log action
      await ActionLog.create({
        adminId: req.admin.id,
        object: 'Post',
        action: 'delete',
        ip: req.ip || req.connection.remoteAddress,
        before: oldData,
        description: `Xóa bài viết: ${post.title}`
      });

      res.json({
        success: true,
        message: 'Xóa bài viết thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

