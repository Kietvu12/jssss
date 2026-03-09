import { Collaborator, Group, RankLevel } from '../../models/index.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import { Op } from 'sequelize';

/**
 * CTV Authentication Controller
 */
export const collaboratorAuthController = {
  /**
   * Register new collaborator
   * POST /api/ctv/auth/register
   */
  register: async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        country,
        postCode,
        address,
        organizationType = 'individual',
        companyName,
        taxCode,
        website,
        businessAddress,
        businessLicense,
        birthday,
        gender,
        facebook,
        zalo,
        bankName,
        bankAccount,
        bankAccountName,
        bankBranch,
        organizationLink,
        description
      } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tên, email và mật khẩu là bắt buộc'
        });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu phải có ít nhất 8 ký tự'
        });
      }

      // Check if email already exists
      const existingCollaborator = await Collaborator.findOne({
        where: { email }
      });

      if (existingCollaborator) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }

      // Generate unique code for collaborator
      const code = `CTV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create collaborator
      const collaborator = await Collaborator.create({
        name,
        code,
        email,
        password: hashedPassword,
        phone,
        country,
        postCode,
        address,
        organizationType,
        companyName: organizationType === 'company' ? companyName : null,
        taxCode: organizationType === 'company' ? taxCode : null,
        website: organizationType === 'company' ? website : null,
        businessAddress: organizationType === 'company' ? businessAddress : null,
        businessLicense: organizationType === 'company' ? businessLicense : null,
        birthday,
        gender,
        facebook,
        zalo,
        bankName,
        bankAccount,
        bankAccountName,
        bankBranch,
        organizationLink,
        description,
        status: 0, // Inactive cho đến khi admin phê duyệt
        points: 0,
        approvedAt: null // Admin phê duyệt sẽ set approvedAt + status = 1
      });

      // Return collaborator data (without password)
      const collaboratorData = collaborator.toJSON();
      delete collaboratorData.password;
      delete collaboratorData.rememberToken;

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công. Tài khoản của bạn đang chờ được duyệt bởi quản trị viên.',
        data: {
          collaborator: collaboratorData
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login collaborator
   * POST /api/ctv/auth/login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email và mật khẩu là bắt buộc'
        });
      }

      // Normalize email (trim)
      const normalizedEmail = email.trim();

      // Find collaborator by email
      // MySQL/MariaDB with utf8mb4_unicode_ci collation is case-insensitive by default
      const collaborator = await Collaborator.findOne({
        where: {
          email: normalizedEmail
        },
        include: [
          {
            model: Group,
            as: 'group',
            required: false
          },
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Check if account is approved
      if (!collaborator.approvedAt) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn chưa được duyệt. Vui lòng chờ quản trị viên duyệt tài khoản.'
        });
      }

      // Check if account is active
      if (collaborator.status !== 1) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
        });
      }

      // Verify password
      // Check if password exists and is not null
      if (!collaborator.password) {
        console.error('Collaborator password is null or undefined:', collaborator.id, collaborator.email);
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Check if password is hashed (bcrypt hash starts with $2a$, $2b$, or $2y$)
      const isPasswordHashed = collaborator.password.startsWith('$2a$') || 
                                 collaborator.password.startsWith('$2b$') || 
                                 collaborator.password.startsWith('$2y$');

      let isPasswordValid = false;

      if (isPasswordHashed) {
        // Password is hashed, use bcrypt compare
        isPasswordValid = await comparePassword(password, collaborator.password);
      } else {
        // Password is plain text (legacy data), compare directly
        // This should not happen in production, but handle it for migration
        console.warn('Collaborator password is not hashed (plain text):', collaborator.id, collaborator.email);
        isPasswordValid = password === collaborator.password;
        
        // If password matches, hash it and save
        if (isPasswordValid) {
          const hashedPassword = await hashPassword(password);
          collaborator.password = hashedPassword;
          await collaborator.save();
          console.log('Password has been hashed and saved for collaborator:', collaborator.id);
        }
      }
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Generate JWT token
      const token = generateToken({
        id: collaborator.id,
        email: collaborator.email,
        role: 'CTV'
      });

      // Return collaborator data (without password)
      const collaboratorData = collaborator.toJSON();
      delete collaboratorData.password;
      delete collaboratorData.rememberToken;

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          collaborator: collaboratorData,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current collaborator profile
   * GET /api/ctv/auth/me
   */
  getMe: async (req, res, next) => {
    try {
      const collaborator = await Collaborator.findByPk(req.collaborator.id, {
        include: [
          {
            model: Group,
            as: 'group',
            required: false
          },
          {
            model: RankLevel,
            as: 'rankLevel',
            required: false
          }
        ]
      });

      if (!collaborator) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin CTV'
        });
      }

      const collaboratorData = collaborator.toJSON();
      delete collaboratorData.password;
      delete collaboratorData.rememberToken;

      res.json({
        success: true,
        data: {
          collaborator: collaboratorData
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update current collaborator profile (chỉ các trường được phép tự sửa)
   * PUT /api/ctv/auth/me
   */
  updateMe: async (req, res, next) => {
    try {
      const collaborator = await Collaborator.findByPk(req.collaborator.id, {
        include: [
          { model: Group, as: 'group', required: false },
          { model: RankLevel, as: 'rankLevel', required: false }
        ]
      });
      if (!collaborator) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin CTV'
        });
      }

      const allowed = [
        'name', 'phone', 'country', 'postCode', 'address', 'organizationType',
        'companyName', 'taxCode', 'website', 'businessAddress', 'businessLicense',
        'avatar', 'birthday', 'gender', 'facebook', 'zalo',
        'bankName', 'bankAccount', 'bankAccountName', 'bankBranch', 'organizationLink',
        'description'
      ];
      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          collaborator[key] = req.body[key];
        }
      }
      await collaborator.save();
      await collaborator.reload({
        include: [
          { model: Group, as: 'group', required: false },
          { model: RankLevel, as: 'rankLevel', required: false }
        ]
      });

      const collaboratorData = collaborator.toJSON();
      delete collaboratorData.password;
      delete collaboratorData.rememberToken;

      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: { collaborator: collaboratorData }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout collaborator
   * POST /api/ctv/auth/logout
   */
  logout: async (req, res, next) => {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can log the action if needed
      res.json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      next(error);
    }
  }
};

