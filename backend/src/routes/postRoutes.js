import express from 'express';
import { postController } from '../controllers/admin/postController.js';
import { authenticate } from '../middleware/auth.js';
import { isSuperAdminOrBackoffice } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/posts
 * @desc    Get list of posts
 * @access  Private (Super Admin, Backoffice)
 */
router.get('/', authenticate, isSuperAdminOrBackoffice, postController.getPosts);

/**
 * @route   GET /api/admin/posts/:id
 * @desc    Get post by ID
 * @access  Private (Super Admin, Backoffice)
 */
router.get('/:id', authenticate, isSuperAdminOrBackoffice, postController.getPostById);

/**
 * @route   POST /api/admin/posts
 * @desc    Create new post
 * @access  Private (Super Admin, Backoffice)
 */
router.post('/', authenticate, isSuperAdminOrBackoffice, postController.createPost);

/**
 * @route   PUT /api/admin/posts/:id
 * @desc    Update post
 * @access  Private (Super Admin, Backoffice)
 */
router.put('/:id', authenticate, isSuperAdminOrBackoffice, postController.updatePost);

/**
 * @route   PATCH /api/admin/posts/:id/status
 * @desc    Update post status
 * @access  Private (Super Admin, Backoffice)
 */
router.patch('/:id/status', authenticate, isSuperAdminOrBackoffice, postController.updateStatus);

/**
 * @route   DELETE /api/admin/posts/:id
 * @desc    Delete post (soft delete)
 * @access  Private (Super Admin, Backoffice)
 */
router.delete('/:id', authenticate, isSuperAdminOrBackoffice, postController.deletePost);

export default router;

