# 📚 Tài Liệu API CTV (Cộng Tác Viên)

## 📋 Tổng Quan

Tài liệu này mô tả các API dành cho CTV (Cộng Tác Viên) trong hệ thống JobShare 2.0.

**Base URL:** `/api/ctv`

**Authentication:** Sử dụng JWT Bearer Token (trừ các endpoint đăng ký/đăng nhập)

---

## 🔐 1. XÁC THỰC (AUTHENTICATION)

### 1.1. Đăng ký tài khoản CTV
**POST** `/api/ctv/auth/register`

**Mô tả:** Đăng ký tài khoản CTV mới. Tài khoản sẽ ở trạng thái chờ duyệt (`approvedAt = null`) cho đến khi admin duyệt.

**Access:** Public

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "password123",
  "phone": "0123456789",
  "country": "Việt Nam",
  "postCode": "100000",
  "address": "123 Đường ABC, Quận XYZ",
  "organizationType": "individual",
  "companyName": null,
  "taxCode": null,
  "website": null,
  "businessAddress": null,
  "businessLicense": null,
  "birthday": "1990-01-01",
  "gender": 1,
  "facebook": "https://facebook.com/nguyenvana",
  "zalo": "0123456789",
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "bankAccountName": "NGUYEN VAN A",
  "bankBranch": "Chi nhánh Hà Nội",
  "organizationLink": null,
  "description": "Mô tả về CTV"
}
```

**Trường bắt buộc:**
- `name` (string): Tên CTV
- `email` (string): Email (phải unique)
- `password` (string): Mật khẩu (tối thiểu 8 ký tự)

**Trường tùy chọn:**
- `phone`: Số điện thoại
- `country`: Quốc gia
- `postCode`: Mã bưu điện
- `address`: Địa chỉ
- `organizationType`: Loại tổ chức (`'individual'` hoặc `'company'`, default: `'individual'`)
- `companyName`: Tên công ty (nếu `organizationType = 'company'`)
- `taxCode`: Mã số thuế (nếu `organizationType = 'company'`)
- `website`: Website (nếu `organizationType = 'company'`)
- `businessAddress`: Địa chỉ kinh doanh (nếu `organizationType = 'company'`)
- `businessLicense`: Giấy phép kinh doanh (nếu `organizationType = 'company'`)
- `birthday`: Ngày sinh (YYYY-MM-DD)
- `gender`: Giới tính (1: Nam, 2: Nữ, 3: Khác)
- `facebook`: Link Facebook
- `zalo`: Số Zalo
- `bankName`: Tên ngân hàng
- `bankAccount`: Số tài khoản ngân hàng
- `bankAccountName`: Tên chủ tài khoản
- `bankBranch`: Chi nhánh ngân hàng
- `organizationLink`: Link tổ chức
- `description`: Mô tả

**Response 201:**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Tài khoản của bạn đang chờ được duyệt bởi quản trị viên.",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "code": "CTV1704067200ABC123",
      "email": "nguyenvana@example.com",
      "phone": "0123456789",
      "organizationType": "individual",
      "status": 1,
      "approvedAt": null,
      "points": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Thiếu trường bắt buộc hoặc mật khẩu không đủ mạnh
- `409`: Email đã được sử dụng

---

### 1.2. Đăng nhập CTV
**POST** `/api/ctv/auth/login`

**Mô tả:** Đăng nhập vào hệ thống. Chỉ có thể đăng nhập khi tài khoản đã được admin duyệt (`approvedAt` không null) và đang active (`status = 1`).

**Access:** Public

**Request Body:**
```json
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "code": "CTV1704067200ABC123",
      "email": "nguyenvana@example.com",
      "phone": "0123456789",
      "points": 1000,
      "status": 1,
      "approvedAt": "2024-01-02T00:00:00.000Z",
      "group": {
        "id": 1,
        "name": "Nhóm A"
      },
      "rankLevel": {
        "id": 1,
        "name": "Bronze",
        "minPoints": 0
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400`: Thiếu email hoặc mật khẩu
- `401`: Email hoặc mật khẩu không đúng
- `403`: Tài khoản chưa được duyệt hoặc đã bị vô hiệu hóa

**Lưu ý:**
- Token có thời hạn (mặc định 7 ngày, có thể cấu hình trong `.env`)
- Lưu token để sử dụng cho các request tiếp theo
- Gửi token trong header: `Authorization: Bearer <token>`

---

### 1.3. Lấy thông tin CTV hiện tại
**GET** `/api/ctv/auth/me`

**Mô tả:** Lấy thông tin chi tiết của CTV đang đăng nhập.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "code": "CTV1704067200ABC123",
      "email": "nguyenvana@example.com",
      "phone": "0123456789",
      "country": "Việt Nam",
      "address": "123 Đường ABC",
      "organizationType": "individual",
      "points": 1000,
      "status": 1,
      "approvedAt": "2024-01-02T00:00:00.000Z",
      "group": {
        "id": 1,
        "name": "Nhóm A",
        "description": "Mô tả nhóm"
      },
      "rankLevel": {
        "id": 1,
        "name": "Bronze",
        "minPoints": 0,
        "maxPoints": 1000
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401`: Không có token hoặc token không hợp lệ
- `403`: Token không phải của CTV hoặc tài khoản chưa được duyệt

---

### 1.4. Đăng xuất
**POST** `/api/ctv/auth/logout`

**Mô tả:** Đăng xuất khỏi hệ thống. Trong hệ thống JWT stateless, logout chủ yếu được xử lý ở phía client (xóa token).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## 📌 Ghi chú về Authentication

### Token Format
- **Type:** JWT (JSON Web Token)
- **Algorithm:** HS256
- **Expiration:** 7 ngày (có thể cấu hình)
- **Payload:** `{ id, email, role: 'CTV' }`

### Cách sử dụng Token
1. Sau khi đăng nhập thành công, lưu token từ response
2. Gửi token trong header của mọi request cần authentication:
   ```
   Authorization: Bearer <token>
   ```
3. Khi token hết hạn, cần đăng nhập lại để lấy token mới

### Trạng thái tài khoản
- **Chờ duyệt:** `approvedAt = null` → Không thể đăng nhập
- **Đã duyệt:** `approvedAt` có giá trị, `status = 1` → Có thể đăng nhập
- **Bị vô hiệu hóa:** `status = 0` → Không thể đăng nhập

### Validation Rules
- **Email:** Phải unique, format email hợp lệ
- **Password:** Tối thiểu 8 ký tự
- **Code:** Tự động tạo khi đăng ký (format: `CTV{timestamp}{random}`)

---

---

## 📄 2. QUẢN LÝ HỒ SƠ ỨNG VIÊN (CVs)

### 2.1. Xem danh sách CV
**GET** `/api/ctv/cvs`

**Mô tả:** Lấy danh sách CV của CTV đang đăng nhập (chỉ CV do chính CTV tạo).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tên, email, mã CV
- `status` (number): Lọc theo trạng thái
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, createdAt, updatedAt, name, code)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "id": 1,
        "code": "CV1704067200ABC123",
        "name": "Nguyễn Văn B",
        "email": "nguyenvanb@example.com",
        "phone": "0987654321",
        "status": 1,
        "applicationsCount": 3,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 2.2. Xem chi tiết CV
**GET** `/api/ctv/cvs/:id`

**Mô tả:** Lấy thông tin chi tiết của một CV (chỉ CV của chính CTV).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cv": {
      "id": 1,
      "code": "CV1704067200ABC123",
      "name": "Nguyễn Văn B",
      "email": "nguyenvanb@example.com",
      "phone": "0987654321",
      "furigana": "グエン バン ビー",
      "birthDate": "1990-01-01",
      "gender": 1,
      "addressCurrent": "Tokyo, Japan",
      "jlptLevel": 2,
      "experienceYears": 5,
      "applicationsCount": 3,
      "cvFile": "uploads/cvs/cv-1234567890.pdf",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404`: CV không tồn tại hoặc không thuộc về CTV

### 2.3. Tạo CV mới
**POST** `/api/ctv/cvs`

**Mô tả:** Tạo một CV mới. CV sẽ tự động thuộc về CTV đang đăng nhập.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- Tất cả các trường của CV (xem schema `cv_storages`)
- `cvFile` (file, optional): File CV (PDF, DOC, DOCX, JPG, JPEG, PNG)

**Trường bắt buộc:** Không có (nhưng nên có ít nhất name hoặc email)

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo CV thành công",
  "data": {
    "cv": {
      "id": 1,
      "code": "CV1704067200ABC123",
      "name": "Nguyễn Văn B",
      "email": "nguyenvanb@example.com",
      "collaboratorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Lỗi upload file (file quá lớn, sai định dạng)
- `500`: Lỗi server

### 2.4. Cập nhật CV
**PUT** `/api/ctv/cvs/:id`

**Mô tả:** Cập nhật thông tin CV (chỉ CV của chính CTV).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:** (Tất cả các trường đều optional, có thể upload file mới)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật CV thành công",
  "data": {
    "cv": {...}
  }
}
```

**Error Responses:**
- `404`: CV không tồn tại hoặc không thuộc về CTV
- `400`: Lỗi upload file

### 2.5. Xóa CV

**DELETE** `/api/ctv/cvs/:id`

**Mô tả:** Xóa CV (soft delete). CTV chỉ có thể xóa CV của chính mình.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` (number, required): ID của CV cần xóa

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa CV thành công"
}
```

**Error Responses:**
- `404`: Không tìm thấy CV hoặc không có quyền truy cập
- `401`: Không có token hoặc token không hợp lệ

---

### 2.6. Xem thống kê CV và đơn ứng tuyển

**GET** `/api/ctv/cvs/statistics`

**Mô tả:** Lấy danh sách CV và thống kê đơn ứng tuyển của CTV đang đăng nhập. Trả về:
- Danh sách tất cả CV của CTV
- Tổng số đơn ứng tuyển đã tạo
- Số lượng đơn ứng tuyển đã đến vòng phỏng vấn (status = 4)
- Số lượng đơn ứng tuyển đã được tuyển (status = 8)

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "id": 1,
        "code": "CV1704067200ABC123",
        "name": "Nguyễn Văn B",
        "email": "nguyenvanb@example.com",
        "phone": "0987654321",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "statistics": {
      "totalCVs": 5,
      "totalApplications": 20,
      "interviewedApplications": 8,
      "hiredApplications": 3
    }
  }
}
```

**Response Fields:**
- `cvs` (array): Danh sách CV của CTV, sắp xếp theo ngày tạo mới nhất
  - `id`: ID của CV
  - `code`: Mã CV
  - `name`: Tên ứng viên
  - `email`: Email ứng viên
  - `phone`: Số điện thoại ứng viên
  - `status`: Trạng thái CV (1 = active, 0 = inactive)
  - `createdAt`: Ngày tạo
  - `updatedAt`: Ngày cập nhật
- `statistics` (object): Thống kê đơn ứng tuyển
  - `totalCVs`: Tổng số CV của CTV
  - `totalApplications`: Tổng số đơn ứng tuyển đã tạo
  - `interviewedApplications`: Số đơn đã đến vòng phỏng vấn (status = 4)
  - `hiredApplications`: Số đơn đã được tuyển (status = 8)

**Error Responses:**
- `401`: Không có token hoặc token không hợp lệ
- `403`: Token không phải của CTV hoặc tài khoản chưa được duyệt

---

### 2.5. Xóa CV
**DELETE** `/api/ctv/cvs/:id`

**Mô tả:** Xóa CV (soft delete). Chỉ có thể xóa CV không có đơn ứng tuyển nào.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa CV thành công"
}
```

**Error Responses:**
- `404`: CV không tồn tại hoặc không thuộc về CTV
- `400`: CV đã có đơn ứng tuyển, không thể xóa

---

### 2.6. Xem thống kê CV và đơn ứng tuyển

**GET** `/api/ctv/cvs/statistics`

**Mô tả:** Lấy danh sách CV và thống kê đơn ứng tuyển của CTV đang đăng nhập. Trả về:
- Danh sách tất cả CV của CTV
- Tổng số đơn ứng tuyển đã tạo
- Số lượng đơn ứng tuyển đã đến vòng phỏng vấn (status = 4)
- Số lượng đơn ứng tuyển đã được tuyển (status = 8)

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "id": 1,
        "code": "CV1704067200ABC123",
        "name": "Nguyễn Văn B",
        "email": "nguyenvanb@example.com",
        "phone": "0987654321",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "statistics": {
      "totalCVs": 5,
      "totalApplications": 20,
      "interviewedApplications": 8,
      "hiredApplications": 3
    }
  }
}
```

**Response Fields:**
- `cvs` (array): Danh sách CV của CTV, sắp xếp theo ngày tạo mới nhất
  - `id`: ID của CV
  - `code`: Mã CV
  - `name`: Tên ứng viên
  - `email`: Email ứng viên
  - `phone`: Số điện thoại ứng viên
  - `status`: Trạng thái CV (1 = active, 0 = inactive)
  - `createdAt`: Ngày tạo
  - `updatedAt`: Ngày cập nhật
- `statistics` (object): Thống kê đơn ứng tuyển
  - `totalCVs`: Tổng số CV của CTV
  - `totalApplications`: Tổng số đơn ứng tuyển đã tạo
  - `interviewedApplications`: Số đơn đã đến vòng phỏng vấn (status = 4)
  - `hiredApplications`: Số đơn đã được tuyển (status = 8)

**Error Responses:**
- `401`: Không có token hoặc token không hợp lệ
- `403`: Token không phải của CTV hoặc tài khoản chưa được duyệt

---

## 💼 3. QUẢN LÝ ĐƠN ỨNG TUYỂN (JOB APPLICATIONS)

### 3.1. Xem danh sách đơn ứng tuyển
**GET** `/api/ctv/job-applications`

**Mô tả:** Lấy danh sách đơn ứng tuyển của CTV đang đăng nhập.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `status` (number): Lọc theo trạng thái (1-17)
- `jobId` (number): Lọc theo việc làm
- `appliedFrom` (date): Lọc từ ngày ứng tuyển
- `appliedTo` (date): Lọc đến ngày ứng tuyển
- `interviewFrom` (date): Lọc từ ngày phỏng vấn
- `interviewTo` (date): Lọc đến ngày phỏng vấn
- `nyushaFrom` (date): Lọc từ ngày nyusha
- `nyushaTo` (date): Lọc đến ngày nyusha
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, status, appliedAt, interviewDate, nyushaDate, createdAt, updatedAt)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "jobApplications": [
      {
        "id": 1,
        "jobId": 1,
        "title": "Ứng tuyển Lập trình viên PHP",
        "status": 4,
        "cvCode": "CV1704067200ABC123",
        "monthlySalary": "500000.00",
        "appliedAt": "2024-01-01T00:00:00.000Z",
        "interviewDate": "2024-01-15T00:00:00.000Z",
        "nyushaDate": "2024-02-01",
        "job": {
          "id": 1,
          "jobCode": "JOB001",
          "title": "Lập trình viên PHP",
          "category": {
            "id": 1,
            "name": "IT",
            "slug": "it"
          },
          "company": {
            "id": 1,
            "name": "Công ty ABC",
            "companyCode": "COMP001"
          }
        },
        "cv": {
          "id": 1,
          "code": "CV1704067200ABC123",
          "name": "Nguyễn Văn B",
          "email": "nguyenvanb@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

### 3.2. Xem chi tiết đơn ứng tuyển
**GET** `/api/ctv/job-applications/:id`

**Mô tả:** Lấy thông tin chi tiết của một đơn ứng tuyển (chỉ đơn của chính CTV).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "jobApplication": {
      "id": 1,
      "jobId": 1,
      "title": "Ứng tuyển Lập trình viên PHP",
      "status": 4,
      "cvCode": "CV1704067200ABC123",
      "monthlySalary": "500000.00",
      "appliedAt": "2024-01-01T00:00:00.000Z",
      "interviewDate": "2024-01-15T00:00:00.000Z",
      "nyushaDate": "2024-02-01",
      "expectedPaymentDate": "2024-03-01",
      "job": {
        "id": 1,
        "jobCode": "JOB001",
        "title": "Lập trình viên PHP",
        "category": {...},
        "company": {...}
      },
      "cv": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404`: Đơn ứng tuyển không tồn tại hoặc không thuộc về CTV

### 3.3. Tạo đơn ứng tuyển mới
**POST** `/api/ctv/job-applications`

**Mô tả:** Tạo một đơn ứng tuyển mới. Đơn sẽ tự động thuộc về CTV đang đăng nhập.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": 1,
  "title": "Ứng tuyển Lập trình viên PHP",
  "cvCode": "CV1704067200ABC123",
  "monthlySalary": "500000.00",
  "appliedAt": "2024-01-01T00:00:00.000Z",
  "interviewDate": "2024-01-15T00:00:00.000Z",
  "interviewRound2Date": null,
  "nyushaDate": "2024-02-01",
  "expectedPaymentDate": "2024-03-01"
}
```

**Trường bắt buộc:**
- `jobId` (number): ID việc làm

**Trường tùy chọn:**
- `title`: Tiêu đề (mặc định: "Ứng tuyển {job.title}")
- `cvCode`: Mã CV (phải thuộc về CTV này)
- `monthlySalary`: Mức lương tháng
- `appliedAt`: Ngày ứng tuyển (mặc định: hiện tại)
- `interviewDate`: Ngày phỏng vấn
- `interviewRound2Date`: Ngày phỏng vấn vòng 2
- `nyushaDate`: Ngày nyusha (nhập công ty)
- `expectedPaymentDate`: Ngày dự kiến thanh toán

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo đơn ứng tuyển thành công",
  "data": {
    "jobApplication": {
      "id": 1,
      "jobId": 1,
      "collaboratorId": 1,
      "title": "Ứng tuyển Lập trình viên PHP",
      "status": 1,
      "cvCode": "CV1704067200ABC123",
      "appliedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Thiếu jobId hoặc job không tồn tại
- `404`: CV không tồn tại hoặc không thuộc về CTV

**Lưu ý:**
- Status mặc định = 1 (Admin đang xử lý hồ sơ)
- CTV không thể thay đổi status (chỉ admin mới có quyền)

### 3.4. Cập nhật đơn ứng tuyển
**PUT** `/api/ctv/job-applications/:id`

**Mô tả:** Cập nhật đơn ứng tuyển (chỉ đơn của chính CTV). CTV chỉ có thể cập nhật một số trường nhất định, không thể thay đổi status.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tất cả các trường đều optional)
```json
{
  "title": "Ứng tuyển Lập trình viên PHP (Cập nhật)",
  "cvCode": "CV1704067200ABC123",
  "monthlySalary": "550000.00",
  "appliedAt": "2024-01-02T00:00:00.000Z",
  "interviewDate": "2024-01-16T00:00:00.000Z",
  "nyushaDate": "2024-02-02",
  "expectedPaymentDate": "2024-03-02"
}
```

**Các trường CTV có thể cập nhật:**
- `title`
- `cvCode` (phải thuộc về CTV này)
- `monthlySalary`
- `appliedAt`
- `interviewDate`
- `interviewRound2Date`
- `nyushaDate`
- `expectedPaymentDate`

**CTV không thể cập nhật:**
- `status` (chỉ admin mới có quyền)
- `rejectNote` (chỉ admin mới có quyền)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật đơn ứng tuyển thành công",
  "data": {
    "jobApplication": {...}
  }
}
```

**Error Responses:**
- `404`: Đơn ứng tuyển không tồn tại hoặc không thuộc về CTV
- `404`: CV không tồn tại hoặc không thuộc về CTV (nếu đổi cvCode)

### 3.5. Xóa đơn ứng tuyển
**DELETE** `/api/ctv/job-applications/:id`

**Mô tả:** Xóa đơn ứng tuyển (soft delete). Chỉ có thể xóa đơn ở một số trạng thái nhất định.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa đơn ứng tuyển thành công"
}
```

**Error Responses:**
- `404`: Đơn ứng tuyển không tồn tại hoặc không thuộc về CTV
- `400`: Không thể xóa đơn ở trạng thái này (đã nyusha hoặc đã thanh toán)

**Lưu ý:**
- Không thể xóa đơn ở trạng thái:
  - 8: Đã nyusha
  - 11: Đã thanh toán
- Các trạng thái khác có thể xóa được

---

## 💼 4. QUẢN LÝ VIỆC LÀM (JOBS)

### 4.1. Xem danh sách việc làm
**GET** `/api/ctv/jobs`

**Mô tả:** Lấy danh sách việc làm với các bộ lọc. Mặc định chỉ hiển thị job đã published (status = 1).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tiêu đề, mã job, slug
- `status` (number, default: 1): Trạng thái job (0: Draft, 1: Published, 2: Closed, 3: Expired)
- `jobCategoryId` (number): Lọc theo danh mục việc làm
- `companyId` (number): Lọc theo công ty
- `isPinned` (boolean): Lọc job được ghim
- `isHot` (boolean): Lọc job hot
- `deadlineFrom` (date): Lọc từ ngày hết hạn
- `deadlineTo` (date): Lọc đến ngày hết hạn
- `recruitmentType` (number): Lọc theo loại tuyển dụng (1-4)
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, title, jobCode, createdAt, updatedAt, deadline, viewsCount)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)
- `saveSearch` (boolean, default: false): Có lưu lịch sử tìm kiếm không

**Response 200:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "jobCode": "JOB001",
        "title": "Lập trình viên PHP",
        "slug": "lap-trinh-vien-php",
        "description": "Mô tả công việc...",
        "status": 1,
        "isPinned": true,
        "isHot": false,
        "viewsCount": 100,
        "deadline": "2024-12-31",
        "isFavorite": false,
        "category": {
          "id": 1,
          "name": "IT",
          "slug": "it"
        },
        "company": {
          "id": 1,
          "name": "Công ty ABC",
          "companyCode": "COMP001",
          "logo": "logo.png"
        },
        "jobValues": [...]
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

**Lưu ý:**
- Mỗi job có trường `isFavorite` cho biết job đó có trong danh sách yêu thích của CTV không
- Nếu `saveSearch=true`, hệ thống sẽ tự động lưu lịch sử tìm kiếm (nếu có từ khóa hoặc filter)

### 4.2. Xem chi tiết việc làm
**GET** `/api/ctv/jobs/:id`

**Mô tả:** Lấy thông tin chi tiết của một việc làm. Tự động tăng lượt xem.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": 1,
      "jobCode": "JOB001",
      "title": "Lập trình viên PHP",
      "slug": "lap-trinh-vien-php",
      "description": "Mô tả chi tiết...",
      "instruction": "Hướng dẫn ứng tuyển...",
      "status": 1,
      "isPinned": true,
      "isHot": false,
      "viewsCount": 101,
      "deadline": "2024-12-31",
      "isFavorite": false,
      "category": {...},
      "company": {...},
      "jobValues": [...]
    }
  }
}
```

**Error Responses:**
- `404`: Việc làm không tồn tại
- `403`: Việc làm chưa được công bố

---

## ⭐ 5. QUẢN LÝ JOB YÊU THÍCH (FAVORITE JOBS)

### 5.1. Xem danh sách job yêu thích
**GET** `/api/ctv/favorite-jobs`

**Mô tả:** Lấy danh sách các việc làm đã được CTV lưu vào yêu thích.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `sortBy` (string, default: 'createdAt'): Sắp xếp theo (id, createdAt, updatedAt)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "favoriteJobs": [
      {
        "id": 1,
        "collaboratorId": 1,
        "jobId": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "job": {
          "id": 1,
          "jobCode": "JOB001",
          "title": "Lập trình viên PHP",
          "status": 1,
          "isFavorite": true,
          "category": {...},
          "company": {...}
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Lưu ý:** Chỉ hiển thị các job đã published (status = 1)

### 5.2. Thêm job vào yêu thích
**POST** `/api/ctv/favorite-jobs`

**Mô tả:** Lưu một việc làm vào danh sách yêu thích.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": 1
}
```

**Trường bắt buộc:**
- `jobId` (number): ID việc làm

**Response 201:**
```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "favoriteJob": {
      "id": 1,
      "collaboratorId": 1,
      "jobId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "job": {...}
    }
  }
}
```

**Error Responses:**
- `400`: Thiếu jobId
- `404`: Việc làm không tồn tại
- `403`: Không thể lưu việc làm chưa được công bố
- `409`: Việc làm đã có trong danh sách yêu thích

### 5.3. Xóa job khỏi yêu thích
**DELETE** `/api/ctv/favorite-jobs/:jobId`

**Mô tả:** Xóa một việc làm khỏi danh sách yêu thích.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

**Error Responses:**
- `404`: Không tìm thấy trong danh sách yêu thích

### 5.4. Kiểm tra job có trong yêu thích
**GET** `/api/ctv/favorite-jobs/check/:jobId`

**Mô tả:** Kiểm tra xem một việc làm có trong danh sách yêu thích của CTV không.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

---

## 🔍 6. QUẢN LÝ LỊCH SỬ TÌM KIẾM (SEARCH HISTORY)

### 6.1. Xem danh sách lịch sử tìm kiếm
**GET** `/api/ctv/search-history`

**Mô tả:** Lấy danh sách lịch sử tìm kiếm của CTV.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 20): Số lượng mỗi trang
- `sortBy` (string, default: 'createdAt'): Sắp xếp theo (id, createdAt, updatedAt)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "searchHistory": [
      {
        "id": 1,
        "collaboratorId": 1,
        "keyword": "lập trình viên",
        "filters": {
          "status": 1,
          "jobCategoryId": 1,
          "isHot": true
        },
        "resultCount": 25,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### 6.2. Lưu lịch sử tìm kiếm
**POST** `/api/ctv/search-history`

**Mô tả:** Lưu một lịch sử tìm kiếm mới.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "keyword": "lập trình viên",
  "filters": {
    "status": 1,
    "jobCategoryId": 1,
    "isHot": true,
    "sortBy": "viewsCount",
    "sortOrder": "DESC"
  },
  "resultCount": 25
}
```

**Trường bắt buộc:**
- Phải có ít nhất một trong hai: `keyword` hoặc `filters`

**Trường tùy chọn:**
- `keyword` (string): Từ khóa tìm kiếm
- `filters` (object): Các điều kiện lọc (JSON)
- `resultCount` (number): Số lượng kết quả tìm được

**Response 201:**
```json
{
  "success": true,
  "message": "Đã lưu lịch sử tìm kiếm",
  "data": {
    "searchHistory": {
      "id": 1,
      "collaboratorId": 1,
      "keyword": "lập trình viên",
      "filters": {...},
      "resultCount": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Thiếu từ khóa và điều kiện lọc

**Lưu ý:**
- Lịch sử tìm kiếm cũng có thể được lưu tự động khi gọi API `/api/ctv/jobs` với `saveSearch=true`

### 6.3. Xóa một lịch sử tìm kiếm
**DELETE** `/api/ctv/search-history/:id`

**Mô tả:** Xóa một lịch sử tìm kiếm cụ thể.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã xóa lịch sử tìm kiếm"
}
```

**Error Responses:**
- `404`: Không tìm thấy lịch sử tìm kiếm

### 6.4. Xóa tất cả lịch sử tìm kiếm
**DELETE** `/api/ctv/search-history`

**Mô tả:** Xóa tất cả lịch sử tìm kiếm của CTV.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã xóa tất cả lịch sử tìm kiếm"
}
```

---

## 💰 7. QUẢN LÝ YÊU CẦU THANH TOÁN (PAYMENT REQUESTS)

### 7.1. Xem danh sách yêu cầu thanh toán
**GET** `/api/ctv/payment-requests`

**Mô tả:** Lấy danh sách yêu cầu thanh toán của CTV đang đăng nhập.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `status` (number): Lọc theo trạng thái (0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối, 3: Đã thanh toán)
- `jobApplicationId` (number): Lọc theo đơn ứng tuyển
- `minAmount` (number): Lọc từ số tiền
- `maxAmount` (number): Lọc đến số tiền
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, amount, status, createdAt, updatedAt, approvedAt, rejectedAt)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "paymentRequests": [
      {
        "id": 1,
        "collaboratorId": 1,
        "jobApplicationId": 1,
        "amount": "5000000.00",
        "status": 0,
        "note": "Thanh toán cho đơn ứng tuyển thành công",
        "filePath": "uploads/payment-requests/ctv/payment-1234567890.pdf",
        "approvedAt": null,
        "rejectedAt": null,
        "rejectedReason": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "jobApplication": {
          "id": 1,
          "title": "Ứng tuyển Lập trình viên PHP",
          "status": 8,
          "nyushaDate": "2024-02-01",
          "expectedPaymentDate": "2024-03-01",
          "job": {
            "id": 1,
            "jobCode": "JOB001",
            "title": "Lập trình viên PHP",
            "company": {
              "id": 1,
              "name": "Công ty ABC",
              "companyCode": "COMP001"
            }
          },
          "cv": {
            "id": 1,
            "code": "CV1704067200ABC123",
            "name": "Nguyễn Văn B",
            "email": "nguyenvanb@example.com"
          }
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Trạng thái (Status):**
- `0`: Chờ duyệt
- `1`: Đã duyệt
- `2`: Từ chối
- `3`: Đã thanh toán

### 7.2. Xem chi tiết yêu cầu thanh toán
**GET** `/api/ctv/payment-requests/:id`

**Mô tả:** Lấy thông tin chi tiết của một yêu cầu thanh toán (chỉ yêu cầu của chính CTV).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "paymentRequest": {
      "id": 1,
      "collaboratorId": 1,
      "jobApplicationId": 1,
      "amount": "5000000.00",
      "status": 1,
      "note": "Thanh toán cho đơn ứng tuyển thành công",
      "filePath": "uploads/payment-requests/ctv/payment-1234567890.pdf",
      "approvedAt": "2024-01-15T00:00:00.000Z",
      "rejectedAt": null,
      "rejectedReason": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "jobApplication": {
        "id": 1,
        "title": "Ứng tuyển Lập trình viên PHP",
        "status": 8,
        "job": {...},
        "cv": {...}
      }
    }
  }
}
```

**Error Responses:**
- `404`: Yêu cầu thanh toán không tồn tại hoặc không thuộc về CTV

### 7.3. Tạo yêu cầu thanh toán mới
**POST** `/api/ctv/payment-requests`

**Mô tả:** Tạo một yêu cầu thanh toán mới. Yêu cầu sẽ tự động thuộc về CTV đang đăng nhập.

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `jobApplicationId` (number, required): ID đơn ứng tuyển
- `amount` (number, required): Số tiền (phải > 0)
- `note` (string, optional): Ghi chú
- `file` (file, optional): File đính kèm (PDF, DOC, DOCX, JPG, JPEG, PNG, XLS, XLSX)

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo yêu cầu thanh toán thành công",
  "data": {
    "paymentRequest": {
      "id": 1,
      "collaboratorId": 1,
      "jobApplicationId": 1,
      "amount": "5000000.00",
      "status": 0,
      "note": "Thanh toán cho đơn ứng tuyển thành công",
      "filePath": "uploads/payment-requests/ctv/payment-1234567890.pdf",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Thiếu jobApplicationId hoặc amount không hợp lệ
- `404`: Đơn ứng tuyển không tồn tại hoặc không thuộc về CTV
- `409`: Đã có yêu cầu thanh toán đang chờ duyệt cho đơn ứng tuyển này
- `400`: Lỗi upload file (file quá lớn, sai định dạng)

**Lưu ý:**
- Status mặc định = 0 (Chờ duyệt)
- Mỗi đơn ứng tuyển chỉ có thể có một yêu cầu thanh toán đang chờ duyệt
- File đính kèm là tùy chọn

### 7.4. Cập nhật yêu cầu thanh toán
**PUT** `/api/ctv/payment-requests/:id`

**Mô tả:** Cập nhật yêu cầu thanh toán (chỉ yêu cầu của chính CTV, chỉ khi status = 0 - Chờ duyệt).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
- `amount` (number, optional): Số tiền (phải > 0)
- `note` (string, optional): Ghi chú
- `file` (file, optional): File đính kèm mới (sẽ thay thế file cũ)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật yêu cầu thanh toán thành công",
  "data": {
    "paymentRequest": {...}
  }
}
```

**Error Responses:**
- `404`: Yêu cầu thanh toán không tồn tại hoặc không thuộc về CTV
- `400`: Chỉ có thể cập nhật yêu cầu thanh toán đang chờ duyệt
- `400`: Số tiền không hợp lệ
- `400`: Lỗi upload file

**Lưu ý:**
- Chỉ có thể cập nhật khi status = 0 (Chờ duyệt)
- Nếu upload file mới, file cũ sẽ bị xóa tự động

### 7.5. Xóa yêu cầu thanh toán
**DELETE** `/api/ctv/payment-requests/:id`

**Mô tả:** Xóa yêu cầu thanh toán (chỉ yêu cầu của chính CTV, chỉ khi status = 0 - Chờ duyệt).

**Access:** Private (CTV)

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa yêu cầu thanh toán thành công"
}
```

**Error Responses:**
- `404`: Yêu cầu thanh toán không tồn tại hoặc không thuộc về CTV
- `400`: Chỉ có thể xóa yêu cầu thanh toán đang chờ duyệt

**Lưu ý:**
- Chỉ có thể xóa khi status = 0 (Chờ duyệt)
- File đính kèm sẽ bị xóa tự động khi xóa yêu cầu

---

## 📝 Tổng kết các API đã triển khai

### ✅ Đã hoàn thành:
1. **Xác thực (Authentication)**
   - Đăng ký tài khoản
   - Đăng nhập
   - Lấy thông tin profile
   - Đăng xuất

2. **Quản lý CV**
   - Xem danh sách CV
   - Xem chi tiết CV
   - Tạo CV mới
   - Cập nhật CV
   - Xóa CV

3. **Quản lý đơn ứng tuyển**
   - Xem danh sách đơn ứng tuyển
   - Xem chi tiết đơn ứng tuyển
   - Tạo đơn ứng tuyển mới
   - Cập nhật đơn ứng tuyển
   - Xóa đơn ứng tuyển

4. **Quản lý việc làm**
   - Xem danh sách việc làm (có filter)
   - Xem chi tiết việc làm

5. **Quản lý job yêu thích**
   - Xem danh sách job yêu thích
   - Thêm job vào yêu thích
   - Xóa job khỏi yêu thích
   - Kiểm tra job có trong yêu thích

6. **Quản lý lịch sử tìm kiếm**
   - Xem danh sách lịch sử tìm kiếm
   - Lưu lịch sử tìm kiếm
   - Xóa lịch sử tìm kiếm
   - Xóa tất cả lịch sử tìm kiếm

7. **Quản lý yêu cầu thanh toán**
   - Xem danh sách yêu cầu thanh toán
   - Xem chi tiết yêu cầu thanh toán
   - Tạo yêu cầu thanh toán mới
   - Cập nhật yêu cầu thanh toán
   - Xóa yêu cầu thanh toán

---

## 📝 Các API khác sẽ được cập nhật tiếp theo...

Các API sau sẽ được thêm vào tài liệu khi được triển khai:

- **Quản lý CV**
  - Xem danh sách CV
  - Tạo CV mới
  - Cập nhật CV
  - Xóa CV
  - Upload file CV

- **Quản lý đơn ứng tuyển**
  - Xem danh sách đơn ứng tuyển
  - Tạo đơn ứng tuyển mới
  - Cập nhật đơn ứng tuyển
  - Xem chi tiết đơn ứng tuyển
  - Cập nhật trạng thái đơn ứng tuyển

- **Quản lý yêu cầu thanh toán**
  - Xem danh sách yêu cầu thanh toán
  - Tạo yêu cầu thanh toán mới
  - Xem chi tiết yêu cầu thanh toán
  - Xem lịch sử thanh toán

- **Xem danh sách việc làm**
  - Xem danh sách việc làm
  - Xem chi tiết việc làm
  - Tìm kiếm việc làm
  - Lọc việc làm

- **Xem thông báo**
  - Xem danh sách thông báo
  - Đánh dấu đã đọc
  - Xem số thông báo chưa đọc

- **Xem thống kê**
  - Thống kê đơn ứng tuyển
  - Thống kê điểm tích lũy
  - Thống kê thanh toán

---

## 🔒 Bảo mật và Best Practices

### 1. Bảo mật Token
- **Không lưu token trong localStorage** (dễ bị XSS attack)
- **Nên lưu token trong httpOnly cookie** hoặc **secure storage**
- **Không gửi token trong URL** (dễ bị log)
- **Kiểm tra token expiration** trước khi gửi request

### 2. Xử lý lỗi
- Luôn kiểm tra `success` field trong response
- Xử lý các error code phù hợp:
  - `400`: Bad Request (thiếu hoặc sai dữ liệu)
  - `401`: Unauthorized (chưa đăng nhập hoặc token hết hạn)
  - `403`: Forbidden (không có quyền hoặc tài khoản chưa được duyệt)
  - `404`: Not Found (không tìm thấy resource)
  - `409`: Conflict (dữ liệu trùng lặp)
  - `500`: Server Error (lỗi server)

### 3. Rate Limiting
- API có thể có rate limiting để tránh abuse
- Nếu gặp lỗi 429 (Too Many Requests), cần giảm tần suất request

### 4. Validation
- Luôn validate dữ liệu ở client trước khi gửi
- Server sẽ validate lại và trả về lỗi nếu không hợp lệ

---

## 📞 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi về API, vui lòng liên hệ:
- Email: support@jobshare.com
- Hotline: 0123456789

---

**Lưu ý:** Tài liệu này sẽ được cập nhật thường xuyên khi có thêm các API mới hoặc thay đổi.

