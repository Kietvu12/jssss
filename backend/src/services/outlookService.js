// Using built-in fetch (Node.js 18+)

/**
 * Outlook/Microsoft Graph API Service
 * Kết nối với tài khoản Outlook để đồng bộ email
 */
// Microsoft Identity Platform v2. PHẢI dùng login.microsoftonline.com; KHÔNG dùng login.live.com (legacy).
const OAUTH_BASE = 'https://login.microsoftonline.com/common/oauth2/v2.0';
const OAUTH_AUTHORIZE_URL = `${OAUTH_BASE}/authorize`;
const OAUTH_TOKEN_URL = `${OAUTH_BASE}/token`;

class OutlookService {
  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID;
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    this.tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
    this.redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/admin/emails/outlook/oauth/callback';
    // Delegated permissions (Authorization Code Flow). KHÔNG dùng .default (chỉ cho client credentials).
    this.scope = 'openid offline_access User.Read Mail.Read Mail.Send';
    this.graphApiUrl = 'https://graph.microsoft.com/v1.0';
    
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Lấy authorization URL để người dùng đăng nhập.
   * PHẢI dùng endpoint Microsoft Identity v2 (login.microsoftonline.com). KHÔNG dùng login.live.com.
   */
  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      response_mode: 'query',
      scope: 'openid offline_access User.Read Mail.Read Mail.Send'
    });
    const authUrl = `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
    if (!authUrl.startsWith('https://login.microsoftonline.com/')) {
      throw new Error('Outlook authorize URL must use login.microsoftonline.com');
    }
    return authUrl;
  }

  /**
   * Đổi authorization code lấy access token
   */
  async getAccessTokenFromCode(code) {
    try {
      const tokenUrl = OAUTH_TOKEN_URL;
      
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('code', code);
      params.append('redirect_uri', this.redirectUri);
      params.append('grant_type', 'authorization_code');
      params.append('scope', 'openid offline_access User.Read Mail.Read Mail.Send');

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        expiresAt: this.tokenExpiresAt
      };
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const tokenUrl = OAUTH_TOKEN_URL;
      
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);
      params.append('grant_type', 'refresh_token');
      params.append('scope', 'openid offline_access User.Read Mail.Read Mail.Send');

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || refreshToken;
      this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in,
        expiresAt: this.tokenExpiresAt
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Set access token (từ database)
   */
  setAccessToken(accessToken, refreshToken, expiresAt) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiresAt = expiresAt;
  }

  /**
   * Kiểm tra và refresh token nếu cần
   */
  async ensureValidToken() {
    if (!this.accessToken || !this.refreshToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    // Refresh nếu token sắp hết hạn (trước 5 phút)
    if (this.tokenExpiresAt && Date.now() >= (this.tokenExpiresAt - 5 * 60 * 1000)) {
      const newTokens = await this.refreshAccessToken(this.refreshToken);
      return newTokens;
    }

    return null;
  }

  /**
   * Lấy danh sách email từ inbox
   */
  async getMessages(folder = 'inbox', top = 50, skip = 0, filter = null) {
    await this.ensureValidToken();

    let url = `${this.graphApiUrl}/me/mailFolders/${folder}/messages?$top=${top}&$skip=${skip}&$orderby=receivedDateTime desc`;
    
    if (filter) {
      url += `&$filter=${encodeURIComponent(filter)}`;
    }

    // Include các trường cần thiết
    url += `&$select=id,subject,bodyPreview,body,from,toRecipients,ccRecipients,bccRecipients,receivedDateTime,sentDateTime,isRead,hasAttachments,importance,conversationId,internetMessageId`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get messages: ${error}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Lấy chi tiết một email
   */
  async getMessage(messageId) {
    await this.ensureValidToken();

    const url = `${this.graphApiUrl}/me/messages/${messageId}?$select=id,subject,body,bodyPreview,from,toRecipients,ccRecipients,bccRecipients,receivedDateTime,sentDateTime,isRead,hasAttachments,importance,conversationId,internetMessageId,attachments`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get message: ${error}`);
    }

    return await response.json();
  }

  /**
   * Gửi email
   */
  async sendMessage(message) {
    await this.ensureValidToken();

    const url = `${this.graphApiUrl}/me/sendMail`;

    const emailPayload = {
      message: {
        subject: message.subject,
        body: {
          contentType: message.bodyType || 'HTML',
          content: message.body
        },
        toRecipients: message.to.map(email => ({
          emailAddress: {
            address: email
          }
        })),
        ...(message.cc && message.cc.length > 0 && {
          ccRecipients: message.cc.map(email => ({
            emailAddress: {
              address: email
            }
          }))
        }),
        ...(message.bcc && message.bcc.length > 0 && {
          bccRecipients: message.bcc.map(email => ({
            emailAddress: {
              address: email
            }
          }))
        }),
        ...(message.attachments && message.attachments.length > 0 && {
          attachments: message.attachments.map(att => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: att.name,
            contentType: att.contentType,
            contentBytes: att.contentBytes
          }))
        })
      },
      saveToSentItems: message.saveToSentItems !== false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send message: ${error}`);
    }

    return { success: true };
  }

  /**
   * Đánh dấu email đã đọc
   */
  async markAsRead(messageId) {
    await this.ensureValidToken();

    const url = `${this.graphApiUrl}/me/messages/${messageId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isRead: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to mark as read: ${error}`);
    }

    return { success: true };
  }

  /**
   * Lấy thông tin user profile
   */
  async getUserProfile() {
    await this.ensureValidToken();

    const url = `${this.graphApiUrl}/me?$select=id,displayName,mail,userPrincipalName`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user profile: ${error}`);
    }

    return await response.json();
  }
}

export default new OutlookService();

