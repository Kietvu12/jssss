# Hướng dẫn deploy lên server

Khi deploy lên server, nếu **upload file** hoặc **tạo CV theo template (PDF)** không hoạt động, kiểm tra các mục sau.

## 1. Frontend gọi đúng backend (API Base URL)

Build production của frontend cần biết URL backend. **Bắt buộc** set biến môi trường khi build:

```bash
# Ví dụ: backend chạy tại https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api pnpm run build
```

- Nếu **không** set `VITE_API_BASE_URL`, code sẽ dùng fallback (localhost / IP cũ) → request từ trình duyệt gửi sai host → upload / tạo CV lỗi.
- Giá trị phải **kết thúc bằng `/api`** (ví dụ: `https://api.yourdomain.com/api`).

## 2. Giới hạn kích thước request (Nginx / reverse proxy) – **413 Request Entity Too Large**

Khi thấy lỗi **413** hoặc "Request Entity Too Large" khi upload CV/ảnh:

- Nginx mặc định giới hạn body **1MB** → request lớn bị chặn, Nginx trả trang HTML 413 (frontend parse JSON sẽ báo "Unexpected token '<'").
- **Cách xử lý:** Trong block `server { ... }` (block chứa `proxy_pass` đến backend), thêm:

```nginx
client_max_body_size 15m;
```

Sau đó reload Nginx: `sudo nginx -s reload`. Backend đã cấu hình limit 15MB; Nginx phải cho phép ít nhất bằng hoặc lớn hơn.

## 3. Tạo CV theo template (PDF) – Puppeteer / Chromium

Tạo PDF (Lý lịch, Lịch sử việc làm) dùng Puppeteer (Chromium). Trên server (Linux/Docker) thường **không** có sẵn Chrome:

- **Cài Chromium** trên server, ví dụ:
  - Ubuntu/Debian: `sudo apt-get install -y chromium-browser`
  - Docker: dùng image có Chromium hoặc cài trong Dockerfile.
- (Tùy chọn) Trỏ Puppeteer tới Chromium đã cài bằng biến môi trường:

```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

Nếu không cài Chromium hoặc path sai, log backend sẽ có dòng kiểu:  
`[cvPdfService] Trên server cần cài Chromium và (tùy chọn) set PUPPETEER_EXECUTABLE_PATH=...`  
Khi đó CV vẫn được tạo và lưu, nhưng **file PDF template sẽ không sinh** (curriculumVitae / cvCareerHistoryPath có thể null).

**Khi cả 3 loại file đều không lưu được:** xem log backend khi tạo/cập nhật ứng viên:
- `[Admin createCV] Không có file upload` → request không có file (kiểm tra Nginx, FormData frontend).
- `[Admin createCV] Lưu CV gốc thất bại` → lỗi S3 hoặc quyền ghi thư mục upload.
- `[Admin createCV] Tạo/lưu PDF Lý lịch (rirekisho) thất bại` / `(shokumu) thất bại` → thường do thiếu Chromium (xem mục 3).
Mỗi bước có try/catch riêng nên lỗi một bước không chặn các bước còn lại (vd: vẫn lưu được CV gốc dù PDF template lỗi).

## 5. AWS S3 – chỉ lưu trên AWS, không dùng thư mục local

Khi **S3 được bật** (env đủ `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`): backend **không ghi file lên đĩa**; multer dùng **memoryStorage**, file upload và PDF template được đẩy thẳng lên S3 với key dạng `prefix/cvs/{id}/cv-original.*`, `cvs/{id}/cv-rirekisho.pdf`, `cvs/{id}/cv-shokumu.pdf`. Trên server chỉ cần cấu hình S3 đúng, không cần thư mục `uploads` hay quyền ghi đĩa cho CV. Khi **không dùng S3** (dev local): file vẫn lưu vào `uploads/cvs/{id}`. CV theo template (PDF) trên server cần cài Chromium (mục 3).

**Nếu trên server không thấy folder/file trong bucket S3 khi tạo ứng viên:** trong `.env` của backend trên server cần có đủ:
- `AWS_S3_BUCKET` (tên bucket)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- (tùy chọn) `AWS_REGION`, `AWS_S3_KEY_PREFIX`

Thiếu một trong ba biến bắt buộc thì backend dùng lưu local (`uploads/cvs/{id}`), link tải sẽ trỏ tới `/uploads/cvs/...` thay vì S3.

## 4. CORS

Backend chỉ chấp nhận origin nằm trong `CORS_ORIGIN` (hoặc localhost / Dev Tunnels khi dev). Trên production, set đúng origin frontend:

```bash
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Nếu sai hoặc thiếu, trình duyệt có thể chặn request (upload, API) do CORS.
