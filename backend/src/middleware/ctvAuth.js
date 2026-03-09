import { verifyToken } from '../utils/jwt.js';
import { Collaborator } from '../models/index.js';

/**
 * CTV Authentication Middleware
 */
export const authenticateCTV = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      // Check if user is CTV
      if (decoded.role !== 'CTV') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. CTV role required.'
        });
      }

      // Find collaborator (paranoid: true will automatically exclude soft-deleted records)
      const collaborator = await Collaborator.findByPk(decoded.id);

      if (!collaborator) {
        return res.status(401).json({
          success: false,
          message: 'Collaborator not found'
        });
      }

      // Check if account is approved
      if (!collaborator.approvedAt) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval'
        });
      }

      // Check if account is active
      if (collaborator.status !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive'
        });
      }

      // Attach collaborator to request
      req.collaborator = collaborator;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    next(error);
  }
};

