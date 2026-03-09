# Hướng dẫn thiết lập Outlook Email Sync

## 1. Đăng ký ứng dụng trên Microsoft Azure

1. Truy cập [Azure Portal](https://portal.azure.com/)
2. Vào **Azure Active Directory** > **App registrations** > **New registration**
3. Điền thông tin:
   - **Name**: JobShare Email Sync
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI** (bắt buộc khớp với backend):
     - Type: **Web**
     - URI (dev): `http://localhost:3000/api/admin/emails/outlook/oauth/callback`
     - URI (prod): `https://<domain-backend>/api/admin/emails/outlook/oauth/callback`
4. Sau khi tạo, lưu lại:
   - **Application (client) ID**
   - **Directory (tenant) ID**
5. Vào **Certificates & secrets** > **New client secret**
   - Lưu lại **Value** của secret (chỉ hiển thị 1 lần)

## 2. Cấu hình API Permissions

1. Vào **API permissions** > **Add a permission**
2. Chọn **Microsoft Graph** > **Delegated permissions**
3. Thêm các permissions (Delegated - dùng Authorization Code Flow):
   - `openid` - Đăng nhập
   - `offline_access` - Refresh token
   - `User.Read` - Đọc thông tin user
   - `Mail.Read` - Đọc email
   - `Mail.Send` - Gửi email
4. Click **Grant admin consent** (nếu có quyền)

## 3. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Microsoft Graph API
MICROSOFT_CLIENT_ID=your-application-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret-value
# Dùng common để cho phép cả tài khoản cơ quan và cá nhân (outlook.com, hotmail.com)
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/admin/emails/outlook/oauth/callback

# Frontend URL (cho OAuth callback)
FRONTEND_URL=http://localhost:5173
```

**Lưu ý:** Nếu chỉ dùng tài khoản công ty (Azure AD của 1 tổ chức), có thể đặt `MICROSOFT_TENANT_ID` = Directory (tenant) ID của tổ chức. Để đăng nhập được **outlook.com / hotmail.com** bắt buộc dùng `common` và app phải chọn "Accounts in any organizational directory and personal Microsoft accounts" khi đăng ký.

## 4. Chạy Migration

Chạy SQL migration để tạo các bảng:

```bash
mysql -u your_user -p your_database < backend/schema/migrations/create_outlook_tables.sql
```

Hoặc import file SQL vào database.

## 5. Xử lý lỗi thường gặp

### "The client does not exist or is not enabled for consumers" (kể cả khi dùng đúng URL login.microsoftonline.com)

- **Hiện tượng:** Trình duyệt có thể bị redirect sang `login.live.com` (Microsoft tự chuyển khi nhận diện tài khoản cá nhân), sau đó báo lỗi **unauthorized_client: The client does not exist or is not enabled for consumers**.
- **Nguyên nhân:** App Azure của bạn **không** được bật cho **personal Microsoft accounts** (outlook.com, hotmail.com, live.com). Trong Azure, mục **Supported account types** / **signInAudience** của app đang là single-tenant hoặc multitenant (chỉ work/school), không có “personal”.
- **Quan trọng:** **Supported account types không thể đổi** sau khi tạo app. Cần **tạo App registration mới** và chọn đúng ngay từ đầu.

**Cách sửa (tạo app mới):**

1. Vào [Azure Portal](https://portal.azure.com/) → **Microsoft Entra ID** (hoặc Azure Active Directory) → **App registrations** → **New registration**.
2. **Name:** đặt tên (vd: JobShare Email Sync).
3. **Supported account types:** chọn **"Accounts in any organizational directory and personal Microsoft accounts"** (dòng thứ 2). **Không** chọn "Single tenant" hay "Multitenant" (chỉ org).
4. **Redirect URI:** Platform **Web** → `http://localhost:3000/api/admin/emails/outlook/oauth/callback` (dev). Production thêm URI tương ứng.
5. **Register** → vào app mới → **Overview** → copy **Application (client) ID**.
6. **Certificates & secrets** → **New client secret** → copy **Value** (chỉ hiển thị 1 lần).
7. **API permissions** → Add permission → **Microsoft Graph** → **Delegated** → thêm: `openid`, `offline_access`, `User.Read`, `Mail.Read`, `Mail.Send` → **Grant admin consent** (nếu có quyền).
8. Trong `.env` của backend:
   - `MICROSOFT_CLIENT_ID` = Application (client) ID của **app mới**
   - `MICROSOFT_CLIENT_SECRET` = Value secret của **app mới**
   - `MICROSOFT_REDIRECT_URI=http://localhost:3000/api/admin/emails/outlook/oauth/callback`
9. Restart backend và thử **Kết nối Outlook** lại.

**Kiểm tra app hiện tại (nếu vẫn lỗi):**

- **App registrations** → chọn app → **Manifest**. Tìm `"signInAudience"`:
  - `AzureADMyOrg` = chỉ 1 tổ chức → **không** dùng được outlook.com.
  - `AzureADMultipleOrgs` = nhiều tổ chức, **không** có personal → **không** dùng được outlook.com.
  - **Cần:** `AzureADandPersonalMicrosoftAccount` (hoặc `PersonalMicrosoftAccount`) thì mới đăng nhập được tài khoản cá nhân.
- Nếu `signInAudience` không phải một trong hai giá trị trên → bắt buộc tạo app mới như các bước trên.

## 6. Sử dụng

### Kết nối tài khoản Outlook

1. Vào trang **Quản lý Email** trong admin panel
2. Click **Kết nối Outlook**
3. Đăng nhập bằng tài khoản Microsoft (outlook.com, hotmail.com hoặc tài khoản cơ quan)
4. Chấp nhận permissions
5. Hệ thống sẽ tự động lưu tokens

### Đồng bộ email

- **Thủ công**: Click nút **Đồng bộ** trên giao diện
- **Tự động**: Có thể setup cron job để gọi endpoint `/api/admin/emails/outlook/sync-all` định kỳ

### Cron Job Setup (tùy chọn)

Thêm vào crontab để đồng bộ tự động mỗi 15 phút:

```bash
*/15 * * * * curl -X POST http://localhost:3000/api/admin/emails/outlook/sync-all -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Hoặc sử dụng node-cron trong ứng dụng:

```javascript
import cron from 'node-cron';
import { emailSyncJob } from './jobs/emailSyncJob.js';

// Đồng bộ mỗi 15 phút
cron.schedule('*/15 * * * *', async () => {
  await emailSyncJob.syncAllConnections();
});
```

## 6. API Endpoints

- `GET /api/admin/emails/outlook/authorize` - Lấy authorization URL
- `GET /api/admin/emails/outlook/oauth/callback` - OAuth callback
- `GET /api/admin/emails/outlook/connections` - Danh sách connections
- `POST /api/admin/emails/outlook/sync` - Đồng bộ email cho một connection
- `GET /api/admin/emails/outlook/synced` - Danh sách email đã đồng bộ
- `GET /api/admin/emails/outlook/synced/:id` - Chi tiết email
- `POST /api/admin/emails/outlook/send` - Gửi email
- `PATCH /api/admin/emails/outlook/synced/:id/read` - Đánh dấu đã đọc
- `DELETE /api/admin/emails/outlook/connections/:id` - Xóa connection
- `PATCH /api/admin/emails/outlook/connections/:id/toggle-sync` - Bật/tắt đồng bộ

## Lưu ý

- Access token có thời hạn, hệ thống sẽ tự động refresh khi cần
- Email được lưu vào bảng `synced_emails` để truy vấn nhanh
- Có thể filter và search email đã đồng bộ
- Hỗ trợ gửi email qua Outlook API

