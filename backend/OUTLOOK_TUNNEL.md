# Outlook OAuth khi test qua Dev Tunnel (HTTPS)

Khi mở app qua tunnel (vd: `https://73mlvrh5-5173.asse.devtunnels.ms/admin/emails`), sau bước đăng nhập Microsoft phải **không** bị chuyển về localhost. Cần cấu hình đúng 2 biến trong **backend** `.env` và **restart backend**.

## 1. `MICROSOFT_REDIRECT_URI`

- Đây là URL mà **Microsoft** chuyển trình duyệt tới sau khi user đăng nhập (kèm `?code=...`).
- URL này **phải trỏ tới backend** (để backend đổi `code` lấy token).
- Khi dùng tunnel: backend cũng phải mở qua tunnel (vd port 3000 → `https://xxx-3000.asse.devtunnels.ms`).

**Ví dụ tunnel:**
```env
MICROSOFT_REDIRECT_URI=https://73mlvrh5-3000.asse.devtunnels.ms/api/oauth/outlook/callback
```

- Trong **Azure Portal** → App registration → Authentication → Redirect URIs: thêm **đúng** URL trên.

## 2. `FRONTEND_URL`

- Sau khi backend xử lý callback (đổi code lấy token, lưu connection), backend **redirect** user về trang email.
- Nếu không set: mặc định là `http://localhost:5173` → user bị đưa về localhost thay vì tiếp tục dùng tunnel.

**Ví dụ tunnel (frontend 5173):**
```env
FRONTEND_URL=https://73mlvrh5-5173.asse.devtunnels.ms
```

Kết quả: user đăng nhập Microsoft → Microsoft redirect về `https://...-3000.../callback` → backend xử lý → redirect về `https://...-5173.../admin/emails?outlook=connected` → user vẫn ở tunnel.

## Checklist

1. Backend chạy qua tunnel (port 3000) và frontend qua tunnel (port 5173).
2. Trong backend `.env`: `MICROSOFT_REDIRECT_URI` = URL callback **của backend** (tunnel 3000); `FRONTEND_URL` = URL **frontend** (tunnel 5173).
3. Azure Portal: Redirect URI trùng với `MICROSOFT_REDIRECT_URI`.
4. **Restart backend** sau khi sửa `.env`.
