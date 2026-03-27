import { Collaborator, Group, RankLevel } from '../../models/index.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
import emailService from '../../services/emailService.js';

const EMAIL_VERIFY_EXPIRES_HOURS = parseInt(process.env.EMAIL_VERIFY_EXPIRES_HOURS || '72', 10);
const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.WEB_URL || 'http://localhost:5173').replace(/\/+$/, '');

function buildEmailVerificationData() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + EMAIL_VERIFY_EXPIRES_HOURS * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

function buildVerifyEmailUrl(token) {
  return `${FRONTEND_URL}/register/verify-email?token=${encodeURIComponent(token)}`;
}

function buildRegistrationVerificationEmail(verifyUrl) {
  const subject = '[WS Job Share] 登録完了のお知らせ / Registration Completed / Xác nhận đăng ký cộng tác viên';
  const text = `ご登録いただき、誠にありがとうございました。
アカウントが作成されました。
以下のリンクよりログインしてご利用ください:
${verifyUrl}

========================================
Your account has been successfully created.
Please click the link below to verify your email and activate your account:
${verifyUrl}

========================================
Cảm ơn bạn đã đăng ký tham gia cộng tác viên.
Tài khoản của bạn đã được tạo thành công.
Vui lòng nhấn vào link dưới đây để xác thực email và kích hoạt tài khoản:
${verifyUrl}

ご不明な点がございましたら、本文返信にてお問い合わせください。`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.55;">
      <p style="margin: 0 0 8px;">ご登録いただき、誠にありがとうございました。<br/>アカウントが作成されました。<br/>以下のリンクよりログインしてご利用ください:<br/>
        <a href="${verifyUrl}" style="color: #2563eb; text-decoration: underline;">${verifyUrl}</a>
      </p>

      <p style="margin: 14px 0;">========================================</p>

      <p style="margin: 0 0 8px;">Your account has been successfully created.<br/>Please click the link below to verify your email and activate your account:<br/>
        <a href="${verifyUrl}" style="color: #2563eb; text-decoration: underline;">${verifyUrl}</a>
      </p>

      <p style="margin: 14px 0;">========================================</p>

      <p style="margin: 0 0 8px;">Cảm ơn bạn đã đăng ký tham gia cộng tác viên.<br/>Tài khoản của bạn đã được tạo thành công.<br/>Vui lòng nhấn vào link dưới đây để xác thực email và kích hoạt tài khoản:<br/>
        <a href="${verifyUrl}" style="color: #2563eb; text-decoration: underline;">${verifyUrl}</a>
      </p>

      <p style="margin: 16px 0 0;">ご不明な点がございましたら、本文返信にてお問い合わせください。</p>
      <p style="margin: 16px 0 0; font-weight: 700;">Workstation JobShare</p>
      <p style="margin: 4px 0 0;">Email: <a href="mailto:jobshare@work-station.vn" style="color: #111827;">jobshare@work-station.vn</a></p>
      <p style="margin: 2px 0 0;">Hotline: (+81)944811975（日本）/ (+84) 906130296（ベトナム）</p>
    </div>
  `;

  return { subject, text, html };
}

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
      const verifyData = buildEmailVerificationData();

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
        approvedAt: null, // Admin phê duyệt sẽ set approvedAt + status = 1
        emailVerifiedAt: null,
        emailVerificationTokenHash: verifyData.tokenHash,
        emailVerificationExpiresAt: verifyData.expiresAt,
        emailVerificationSentAt: new Date()
      });

      // Send verification email (non-blocking flow)
      try {
        const verifyUrl = buildVerifyEmailUrl(verifyData.token);
        const emailContent = buildRegistrationVerificationEmail(verifyUrl);
        await emailService.sendEmail({
          to: collaborator.email,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html
        });
      } catch (emailError) {
        console.error('[register] Send verification email failed:', emailError);
      }

      // Return collaborator data (without password)
      const collaboratorData = collaborator.toJSON();
      delete collaboratorData.password;
      delete collaboratorData.rememberToken;

      res.status(201).json({
        success: true,
        message: 'Dang ky thanh cong. Vui long kiem tra email de xac thuc tai khoan.',
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
   * Verify collaborator email and auto approve account
   * GET /api/ctv/auth/verify-email?token=...
   */
  verifyEmail: async (req, res, next) => {
    try {
      const token = String(req.query.token || '').trim();
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Thieu token xac thuc email'
        });
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const collaborator = await Collaborator.findOne({
        where: {
          emailVerificationTokenHash: tokenHash
        }
      });

      if (!collaborator) {
        return res.status(400).json({
          success: false,
          message: 'Link xác thực không hợp lệ hoặc đã được sử dụng'
        });
      }

      const now = new Date();
      const isExpired =
        collaborator.emailVerificationExpiresAt &&
        new Date(collaborator.emailVerificationExpiresAt).getTime() < now.getTime();
      const alreadyApproved = !!collaborator.approvedAt || collaborator.status === 1;

      if (isExpired && !alreadyApproved) {
        return res.status(400).json({
          success: false,
          message: 'Link xác thực đã hết hạn'
        });
      }

      const updates = {
        emailVerifiedAt: collaborator.emailVerifiedAt || now,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null
      };

      let result = 'verified_and_approved';
      if (alreadyApproved) {
        result = 'already_approved';
      } else {
        updates.status = 1;
        updates.approvedAt = now;
      }

      await collaborator.update(updates);

      return res.json({
        success: true,
        message: result === 'already_approved'
          ? 'Tài khoản đã được phê duyệt trước đó'
          : 'Xác thực email thành công và tài khoản đã được phê duyệt',
        data: {
          result
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

