# API Documentation - Quản lý Admin & Nhóm quyền

## Base URL
```
http://localhost:3000/api
```

## Authentication
Hầu hết các API yêu cầu authentication. Sử dụng JWT token trong header:
```
Authorization: Bearer <token>
```

**Lưu ý về phân quyền:**
- `role = 1`: Super Admin (có quyền tất cả)
- `role = 2`: Admin Backoffice
- `role = 3`: Admin CA Team

---

## 🔐 Admin Authentication

### 1. Đăng nhập
**POST** `/api/admin/auth/login`

**Mô tả:** Đăng nhập vào hệ thống với email và mật khẩu.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com",
      "phone": "0123456789",
      "avatar": null,
      "isActive": true,
      "status": 1,
      "role": 1,
      "groupId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "group": {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN",
        "referralCode": "REF001"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên."
}
```

---

### 2. Lấy thông tin admin hiện tại
**GET** `/api/admin/auth/me`

**Mô tả:** Lấy thông tin của admin đang đăng nhập.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com",
      "phone": "0123456789",
      "avatar": null,
      "isActive": true,
      "status": 1,
      "role": 1,
      "groupId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "group": {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN",
        "referralCode": "REF001"
      }
    }
  }
}
```

---

### 3. Đăng xuất
**POST** `/api/admin/auth/logout`

**Mô tả:** Đăng xuất khỏi hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## 👥 Quản lý Admin

**Lưu ý:** Tất cả các API quản lý admin yêu cầu quyền **Super Admin (role = 1)**.

---

### 1. Lấy danh sách admin
**GET** `/api/admin/admins`

**Mô tả:** Lấy danh sách tất cả admin với phân trang và tìm kiếm.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10)
- `search` (optional): Tìm kiếm theo tên hoặc email
- `role` (optional): Lọc theo role (1: Super Admin, 2: Admin Backoffice, 3: Admin CA Team)
- `status` (optional): Lọc theo status (0: inactive, 1: active)
- `groupId` (optional): Lọc theo nhóm quyền

**Example Request:**
```
GET /api/admin/admins?page=1&limit=10&search=admin&role=1&status=1
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": 1,
        "name": "Admin Name",
        "email": "admin@example.com",
        "phone": "0123456789",
        "avatar": null,
        "isActive": true,
        "status": 1,
        "role": 1,
        "groupId": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "group": {
          "id": 1,
          "name": "CA Huyện",
          "code": "CA_HUYEN"
        }
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

---

### 2. Lấy thông tin admin theo ID
**GET** `/api/admin/admins/:id`

**Mô tả:** Lấy thông tin chi tiết của một admin.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của admin

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com",
      "phone": "0123456789",
      "avatar": null,
      "isActive": true,
      "status": 1,
      "role": 1,
      "groupId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "group": {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN"
      }
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy admin"
}
```

---

### 3. Tạo admin mới
**POST** `/api/admin/admins`

**Mô tả:** Tạo một admin mới trong hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "phone": "0123456789",
  "avatar": "https://example.com/avatar.jpg",
  "role": 1,
  "groupId": 1,
  "isActive": true
}
```

**Request Body Fields:**
- `name` (required): Tên admin
- `email` (required): Email admin (phải unique)
- `password` (required): Mật khẩu
- `phone` (optional): Số điện thoại
- `avatar` (optional): URL avatar
- `role` (optional): Role (1: Super Admin, 2: Admin Backoffice, 3: Admin CA Team, default: 1)
- `groupId` (optional): ID nhóm quyền
- `isActive` (optional): Trạng thái kích hoạt (default: true)

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo admin thành công",
  "data": {
    "admin": {
      "id": 2,
      "name": "Admin Name",
      "email": "admin@example.com",
      "phone": "0123456789",
      "avatar": null,
      "isActive": true,
      "status": 1,
      "role": 1,
      "groupId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "group": {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN"
      }
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Tên, email và mật khẩu là bắt buộc"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Email đã tồn tại"
}
```

---

### 4. Cập nhật admin
**PUT** `/api/admin/admins/:id`

**Mô tả:** Cập nhật thông tin của một admin.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của admin

**Request Body:**
```json
{
  "name": "Updated Admin Name",
  "email": "updated@example.com",
  "phone": "0987654321",
  "avatar": "https://example.com/new-avatar.jpg",
  "role": 2,
  "groupId": 2,
  "isActive": false,
  "status": 0
}
```

**Request Body Fields (tất cả optional):**
- `name`: Tên admin
- `email`: Email admin (phải unique nếu thay đổi)
- `password`: Mật khẩu mới (nếu muốn đổi)
- `phone`: Số điện thoại
- `avatar`: URL avatar
- `role`: Role (1, 2, hoặc 3)
- `groupId`: ID nhóm quyền
- `isActive`: Trạng thái kích hoạt
- `status`: Status (0 hoặc 1)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật admin thành công",
  "data": {
    "admin": {
      "id": 1,
      "name": "Updated Admin Name",
      "email": "updated@example.com",
      "phone": "0987654321",
      "avatar": "https://example.com/new-avatar.jpg",
      "isActive": false,
      "status": 0,
      "role": 2,
      "groupId": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z",
      "group": {
        "id": 2,
        "name": "CA Team",
        "code": "CA_TEAM"
      }
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy admin"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Email đã tồn tại"
}
```

---

### 5. Xóa admin
**DELETE** `/api/admin/admins/:id`

**Mô tả:** Xóa (soft delete) một admin khỏi hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của admin

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xóa admin thành công"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Bạn không thể xóa tài khoản của chính mình"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy admin"
}
```

---

### 6. Đặt lại mật khẩu
**POST** `/api/admin/admins/:id/reset-password`

**Mô tả:** Đặt lại mật khẩu cho một admin.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của admin

**Request Body:**
```json
{
  "newPassword": "newPassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Mật khẩu mới là bắt buộc"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy admin"
}
```

---

### 7. Kích hoạt/Vô hiệu hóa admin
**PATCH** `/api/admin/admins/:id/toggle-status`

**Mô tả:** Chuyển đổi trạng thái kích hoạt/vô hiệu hóa của một admin.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của admin

**Response Success (200):**
```json
{
  "success": true,
  "message": "Kích hoạt admin thành công",
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com",
      "isActive": true,
      "status": 1,
      ...
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Bạn không thể vô hiệu hóa tài khoản của chính mình"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy admin"
}
```

---

## 👨‍👩‍👧‍👦 Quản lý Nhóm quyền (Groups)

**Lưu ý:** Tất cả các API quản lý nhóm quyền yêu cầu quyền **Super Admin (role = 1)**.

---

### 1. Lấy danh sách nhóm quyền
**GET** `/api/admin/groups`

**Mô tả:** Lấy danh sách tất cả nhóm quyền với phân trang và tìm kiếm.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10)
- `search` (optional): Tìm kiếm theo tên, mã nhóm hoặc mã giới thiệu
- `status` (optional): Lọc theo status (0: inactive, 1: active)

**Example Request:**
```
GET /api/admin/groups?page=1&limit=10&search=CA&status=1
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN",
        "referralCode": "REF001",
        "description": "Nhóm quyền cho CA Huyện",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "admins": [
          {
            "id": 1,
            "name": "Admin Name",
            "email": "admin@example.com"
          }
        ]
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

---

### 2. Lấy tất cả nhóm quyền (cho dropdown)
**GET** `/api/admin/groups/all`

**Mô tả:** Lấy danh sách tất cả nhóm quyền đang active (không phân trang, dùng cho dropdown/select).

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN",
        "referralCode": "REF001"
      },
      {
        "id": 2,
        "name": "CA Team",
        "code": "CA_TEAM",
        "referralCode": "REF002"
      }
    ]
  }
}
```

---

### 3. Lấy thông tin nhóm quyền theo ID
**GET** `/api/admin/groups/:id`

**Mô tả:** Lấy thông tin chi tiết của một nhóm quyền kèm danh sách admin trong nhóm.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của nhóm quyền

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 1,
      "name": "CA Huyện",
      "code": "CA_HUYEN",
      "referralCode": "REF001",
      "description": "Nhóm quyền cho CA Huyện",
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "admins": [
        {
          "id": 1,
          "name": "Admin Name",
          "email": "admin@example.com",
          "role": 3,
          "isActive": true,
          "status": 1
        }
      ]
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy nhóm quyền"
}
```

---

### 4. Tạo nhóm quyền mới
**POST** `/api/admin/groups`

**Mô tả:** Tạo một nhóm quyền mới trong hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "CA Huyện",
  "code": "CA_HUYEN",
  "referralCode": "REF001",
  "description": "Nhóm quyền cho CA Huyện",
  "status": 1
}
```

**Request Body Fields:**
- `name` (required): Tên nhóm quyền
- `code` (required): Mã nhóm (phải unique)
- `referralCode` (required): Mã giới thiệu (phải unique)
- `description` (optional): Mô tả nhóm quyền
- `status` (optional): Trạng thái (0: inactive, 1: active, default: 1)

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo nhóm quyền thành công",
  "data": {
    "group": {
      "id": 1,
      "name": "CA Huyện",
      "code": "CA_HUYEN",
      "referralCode": "REF001",
      "description": "Nhóm quyền cho CA Huyện",
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Tên, mã nhóm và mã giới thiệu là bắt buộc"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Mã nhóm đã tồn tại"
}
```
hoặc
```json
{
  "success": false,
  "message": "Mã giới thiệu đã tồn tại"
}
```

---

### 5. Cập nhật nhóm quyền
**PUT** `/api/admin/groups/:id`

**Mô tả:** Cập nhật thông tin của một nhóm quyền.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của nhóm quyền

**Request Body:**
```json
{
  "name": "CA Huyện Updated",
  "code": "CA_HUYEN_UPDATED",
  "referralCode": "REF001_UPDATED",
  "description": "Mô tả cập nhật",
  "status": 0
}
```

**Request Body Fields (tất cả optional):**
- `name`: Tên nhóm quyền
- `code`: Mã nhóm (phải unique nếu thay đổi)
- `referralCode`: Mã giới thiệu (phải unique nếu thay đổi)
- `description`: Mô tả nhóm quyền
- `status`: Trạng thái (0 hoặc 1)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật nhóm quyền thành công",
  "data": {
    "group": {
      "id": 1,
      "name": "CA Huyện Updated",
      "code": "CA_HUYEN_UPDATED",
      "referralCode": "REF001_UPDATED",
      "description": "Mô tả cập nhật",
      "status": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy nhóm quyền"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Mã nhóm đã tồn tại"
}
```
hoặc
```json
{
  "success": false,
  "message": "Mã giới thiệu đã tồn tại"
}
```

---

### 6. Xóa nhóm quyền
**DELETE** `/api/admin/groups/:id`

**Mô tả:** Xóa (soft delete) một nhóm quyền khỏi hệ thống. Không thể xóa nhóm đang có admin.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của nhóm quyền

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xóa nhóm quyền thành công"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Không thể xóa nhóm quyền đang có admin. Vui lòng chuyển admin sang nhóm khác trước."
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy nhóm quyền"
}
```

---

---

## 👥 Quản lý CTV (Collaborator)

**Lưu ý:** Tất cả các API quản lý CTV yêu cầu quyền **Super Admin (role = 1) hoặc Admin Backoffice (role = 2)**.

---

### 1. Lấy danh sách CTV
**GET** `/api/admin/collaborators`

**Mô tả:** Lấy danh sách tất cả CTV với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10)
- `search` (optional): Tìm kiếm theo tên, email, mã CTV, hoặc SĐT
- `status` (optional): Lọc theo status (0: inactive, 1: active)
- `rankLevelId` (optional): Lọc theo cấp bậc
- `groupId` (optional): Lọc theo nhóm quyền
- `sortBy` (optional): Sắp xếp theo (createdAt, updatedAt, points, approvedAt, default: createdAt)
- `sortOrder` (optional): Thứ tự sắp xếp (ASC, DESC, default: DESC)

**Example Request:**
```
GET /api/admin/collaborators?page=1&limit=10&search=john&status=1&rankLevelId=1&sortBy=points&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "id": 1,
        "name": "John Doe",
        "code": "CTV001",
        "email": "john@example.com",
        "phone": "0123456789",
        "points": 1000,
        "status": 1,
        "approvedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "applicationsCount": 5,
        "rankLevel": {
          "id": 1,
          "name": "Gold",
          "percent": 10.5,
          "pointsRequired": 1000
        },
        "group": {
          "id": 1,
          "name": "CA Huyện",
          "code": "CA_HUYEN"
        }
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

### 2. Lấy thông tin CTV theo ID
**GET** `/api/admin/collaborators/:id`

**Mô tả:** Lấy thông tin chi tiết của một CTV.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "collaborator": {
      "id": 1,
      "name": "John Doe",
      "code": "CTV001",
      "email": "john@example.com",
      "phone": "0123456789",
      "country": "Vietnam",
      "postCode": "100000",
      "address": "123 Main St",
      "organizationType": "individual",
      "companyName": null,
      "taxCode": null,
      "website": null,
      "businessAddress": null,
      "businessLicense": null,
      "avatar": "https://example.com/avatar.jpg",
      "birthday": "1990-01-01",
      "gender": 1,
      "facebook": "https://facebook.com/john",
      "zalo": "0123456789",
      "bankName": "Vietcombank",
      "bankAccount": "1234567890",
      "bankAccountName": "John Doe",
      "bankBranch": "Hanoi",
      "organizationLink": null,
      "points": 1000,
      "description": "Mô tả CTV",
      "status": 1,
      "approvedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "rankLevel": {
        "id": 1,
        "name": "Gold",
        "percent": 10.5,
        "pointsRequired": 1000,
        "description": "Cấp bậc Gold"
      },
      "group": {
        "id": 1,
        "name": "CA Huyện",
        "code": "CA_HUYEN",
        "referralCode": "REF001"
      }
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

---

### 3. Tạo CTV mới
**POST** `/api/admin/collaborators`

**Mô tả:** Tạo một CTV mới trong hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "code": "CTV001",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0123456789",
  "country": "Vietnam",
  "postCode": "100000",
  "address": "123 Main St",
  "organizationType": "individual",
  "companyName": null,
  "taxCode": null,
  "website": null,
  "businessAddress": null,
  "businessLicense": null,
  "avatar": "https://example.com/avatar.jpg",
  "birthday": "1990-01-01",
  "gender": 1,
  "facebook": "https://facebook.com/john",
  "zalo": "0123456789",
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "bankAccountName": "John Doe",
  "bankBranch": "Hanoi",
  "organizationLink": null,
  "rankLevelId": 1,
  "description": "Mô tả CTV",
  "groupId": 1,
  "status": 1,
  "points": 0
}
```

**Request Body Fields:**
- `name` (required): Tên CTV
- `email` (required): Email CTV (phải unique)
- `password` (required): Mật khẩu
- `code` (optional): Mã CTV (phải unique nếu cung cấp)
- `phone` (optional): Số điện thoại
- `country` (optional): Quốc gia
- `postCode` (optional): Mã bưu điện
- `address` (optional): Địa chỉ
- `organizationType` (optional): Loại tổ chức (individual/company, default: individual)
- `companyName` (optional): Tên công ty
- `taxCode` (optional): Mã số thuế
- `website` (optional): Website
- `businessAddress` (optional): Địa chỉ kinh doanh
- `businessLicense` (optional): Giấy phép kinh doanh
- `avatar` (optional): URL avatar
- `birthday` (optional): Ngày sinh (YYYY-MM-DD)
- `gender` (optional): Giới tính (1: male, 2: female, 3: other)
- `facebook` (optional): Facebook
- `zalo` (optional): Zalo
- `bankName` (optional): Tên ngân hàng
- `bankAccount` (optional): Số tài khoản
- `bankAccountName` (optional): Tên chủ tài khoản
- `bankBranch` (optional): Chi nhánh ngân hàng
- `organizationLink` (optional): Link tổ chức
- `rankLevelId` (optional): ID cấp bậc
- `description` (optional): Mô tả
- `groupId` (optional): ID nhóm quyền
- `status` (optional): Trạng thái (0: inactive, 1: active, default: 1)
- `points` (optional): Điểm tích lũy (default: 0)

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo CTV thành công",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "John Doe",
      "code": "CTV001",
      "email": "john@example.com",
      ...
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Tên, email và mật khẩu là bắt buộc"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Email đã tồn tại"
}
```
hoặc
```json
{
  "success": false,
  "message": "Mã CTV đã tồn tại"
}
```

---

### 4. Cập nhật CTV
**PUT** `/api/admin/collaborators/:id`

**Mô tả:** Cập nhật thông tin của một CTV.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Request Body:** (Tất cả các field đều optional)
```json
{
  "name": "John Doe Updated",
  "phone": "0987654321",
  "rankLevelId": 2,
  "groupId": 2,
  "status": 0
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật CTV thành công",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "John Doe Updated",
      ...
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Email đã tồn tại"
}
```
hoặc
```json
{
  "success": false,
  "message": "Mã CTV đã tồn tại"
}
```

---

### 5. Xóa CTV
**DELETE** `/api/admin/collaborators/:id`

**Mô tả:** Xóa (soft delete) một CTV khỏi hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xóa CTV thành công"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

---

### 6. Duyệt CTV
**POST** `/api/admin/collaborators/:id/approve`

**Mô tả:** Duyệt tài khoản CTV (set `approved_at` và `status = 1`).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Response Success (200):**
```json
{
  "success": true,
  "message": "Duyệt CTV thành công",
  "data": {
    "collaborator": {
      "id": 1,
      "approvedAt": "2024-01-01T00:00:00.000Z",
      "status": 1,
      ...
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

---

### 7. Từ chối CTV
**POST** `/api/admin/collaborators/:id/reject`

**Mô tả:** Từ chối tài khoản CTV (set `approved_at = null` và `status = 0`).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Request Body (optional):**
```json
{
  "reason": "Thông tin không đầy đủ"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Từ chối CTV thành công",
  "data": {
    "collaborator": {
      "id": 1,
      "approvedAt": null,
      "status": 0,
      ...
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

---

### 8. Kích hoạt/Vô hiệu hóa CTV
**PATCH** `/api/admin/collaborators/:id/toggle-status`

**Mô tả:** Chuyển đổi trạng thái kích hoạt/vô hiệu hóa của một CTV.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Response Success (200):**
```json
{
  "success": true,
  "message": "Kích hoạt CTV thành công",
  "data": {
    "collaborator": {
      "id": 1,
      "status": 1,
      ...
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

---

### 9. Đặt lại mật khẩu CTV
**POST** `/api/admin/collaborators/:id/reset-password`

**Mô tả:** Đặt lại mật khẩu cho một CTV.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CTV

**Request Body:**
```json
{
  "newPassword": "newPassword123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Mật khẩu mới là bắt buộc"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CTV"
}
```

---

## 📝 Ghi chú

### Về Role (Phân quyền Admin):
- **1 - Super Admin**: Có quyền tất cả, có thể quản lý admin và nhóm quyền
- **2 - Admin Backoffice**: Quản lý backoffice, có quyền quản lý CTV
- **3 - Admin CA Team**: Quản lý CA Team

### Về Status:
- **0**: Inactive
- **1**: Active

### Về Organization Type:
- **individual**: Cá nhân
- **company**: Công ty/Tổ chức

### Về Gender:
- **1**: Nam
- **2**: Nữ
- **3**: Khác

### Về Soft Delete:
- Khi xóa admin, nhóm quyền hoặc CTV, hệ thống sử dụng soft delete (đánh dấu `deleted_at`)
- Dữ liệu vẫn tồn tại trong database nhưng không hiển thị trong danh sách

### Về Action Logs:
- Tất cả các thao tác của admin đều được ghi lại trong bảng `action_logs`
- Bao gồm: login, logout, create, edit, delete, reset_password, activate, deactivate, approve, reject

---

## 🔒 Bảo mật

1. **JWT Token**: Tất cả API (trừ login) yêu cầu JWT token trong header
2. **Password Hashing**: Mật khẩu được hash bằng bcrypt với salt rounds = 12
3. **Authorization**: 
   - Super Admin và Admin Backoffice có quyền quản lý CTV
   - Chỉ Super Admin mới có quyền quản lý admin và nhóm quyền
4. **Self-protection**: Admin không thể xóa hoặc vô hiệu hóa chính mình

---

## 📌 Error Codes

- **400**: Bad Request - Dữ liệu đầu vào không hợp lệ
- **401**: Unauthorized - Chưa đăng nhập hoặc token không hợp lệ
- **403**: Forbidden - Không có quyền truy cập
- **404**: Not Found - Không tìm thấy resource
- **409**: Conflict - Dữ liệu đã tồn tại (email, code, referralCode)
- **500**: Internal Server Error - Lỗi server

---

## 📄 Quản lý CV (Hồ sơ ứng viên)

**Lưu ý:** Tất cả các API quản lý CV yêu cầu quyền **Super Admin (role = 1) hoặc Admin Backoffice (role = 2)**.

---

### 1. Lấy danh sách CV
**GET** `/api/admin/cvs`

**Mô tả:** Lấy danh sách tất cả CV với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng mỗi trang (default: 10)
- `search` (optional): Tìm kiếm theo tên, email, hoặc mã CV
- `status` (optional): Lọc theo status (0: inactive, 1: active)
- `collaboratorId` (optional): Lọc theo CTV tạo CV
- `adminId` (optional): Lọc theo Admin tạo CV
- `startDate` (optional): Lọc từ ngày (YYYY-MM-DD)
- `endDate` (optional): Lọc đến ngày (YYYY-MM-DD)
- `sortBy` (optional): Sắp xếp theo (createdAt, updatedAt, name, code, default: createdAt)
- `sortOrder` (optional): Thứ tự sắp xếp (ASC, DESC, default: DESC)

**Example Request:**
```
GET /api/admin/cvs?page=1&limit=10&search=john&status=1&collaboratorId=1&sortBy=createdAt&sortOrder=DESC
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "id": 1,
        "code": "CV-ABC12345",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "applicationsCount": 3,
        "collaborator": {
          "id": 1,
          "name": "CTV Name",
          "email": "ctv@example.com",
          "code": "CTV001"
        },
        "admin": {
          "id": 1,
          "name": "Admin Name",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

### 2. Lấy thông tin CV theo ID
**GET** `/api/admin/cvs/:id`

**Mô tả:** Lấy thông tin chi tiết của một CV kèm danh sách job applications.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CV

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-ABC12345",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0123456789",
      "furigana": "ジョン・ドウ",
      "birthDate": "1990-01-01",
      "gender": 1,
      "addressOrigin": "Hanoi",
      "addressCurrent": "Tokyo",
      "postalCode": "1000000",
      "curriculumVitae": "/uploads/cvs/cv-1234567890.pdf",
      "otherDocuments": null,
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "collaborator": {
        "id": 1,
        "name": "CTV Name",
        "email": "ctv@example.com",
        "code": "CTV001",
        "phone": "0987654321"
      },
      "admin": {
        "id": 1,
        "name": "Admin Name",
        "email": "admin@example.com"
      },
      "jobApplications": [
        {
          "id": 1,
          "jobId": 10,
          "status": 1,
          "appliedAt": "2024-01-02T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CV"
}
```

---

### 3. Tạo CV mới
**POST** `/api/admin/cvs`

**Mô tả:** Tạo một CV mới trong hệ thống. Nếu không gán `collaboratorId`, CV sẽ thuộc về admin tạo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "code": "CV-ABC12345",
  "collaboratorId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "furigana": "ジョン・ドウ",
  "birthDate": "1990-01-01",
  "gender": 1,
  "addressOrigin": "Hanoi",
  "addressCurrent": "Tokyo",
  "postalCode": "1000000"
}
```

**Request Body Fields:**
- `code` (optional): Mã CV (tự động generate nếu không cung cấp)
- `collaboratorId` (optional): ID của CTV tạo CV (nếu không có thì thuộc về admin)
- `name` (optional): Tên ứng viên
- `email` (optional): Email
- `phone` (optional): Số điện thoại
- Các field khác tùy chọn theo schema của CVStorage

**Response Success (201):**
```json
{
  "success": true,
  "message": "Tạo CV thành công",
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-ABC12345",
      "name": "John Doe",
      ...
    }
  }
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Mã CV đã tồn tại"
}
```

---

### 4. Cập nhật CV
**PUT** `/api/admin/cvs/:id`

**Mô tả:** Cập nhật thông tin của một CV.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CV

**Request Body:** (Tất cả các field đều optional)
```json
{
  "name": "John Doe Updated",
  "email": "updated@example.com",
  "phone": "0987654321",
  "status": 0
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật CV thành công",
  "data": {
    "cv": {
      "id": 1,
      "name": "John Doe Updated",
      ...
    }
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CV"
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Mã CV đã tồn tại"
}
```

---

### 5. Xóa CV
**DELETE** `/api/admin/cvs/:id`

**Mô tả:** Xóa (soft delete) một CV khỏi hệ thống.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CV

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xóa CV thành công"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CV"
}
```

---

### 6. Lấy lịch sử cập nhật CV
**GET** `/api/admin/cvs/:id/history`

**Mô tả:** Lấy lịch sử các thay đổi của một CV từ action_logs.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CV

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-ABC12345",
      "name": "John Doe"
    },
    "history": [
      {
        "id": 1,
        "adminId": 1,
        "object": "CVStorage",
        "action": "edit",
        "description": "Cập nhật CV: CV-ABC12345 - John Doe",
        "before": {...},
        "after": {...},
        "createdAt": "2024-01-02T00:00:00.000Z",
        "admin": {
          "id": 1,
          "name": "Admin Name",
          "email": "admin@example.com"
        }
      }
    ]
  }
}
```

---

## 📁 Quản lý File CV

**Lưu ý:** Tất cả các API quản lý file CV yêu cầu quyền **Super Admin (role = 1) hoặc Admin Backoffice (role = 2)**.

---

### 1. Lấy danh sách file CV
**GET** `/api/admin/cv-storages`

**Mô tả:** Lấy danh sách CV với thông tin file đính kèm.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** (Tương tự như GET /api/admin/cvs)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "cvStorages": [
      {
        "id": 1,
        "code": "CV-ABC12345",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "curriculumVitae": "/uploads/cvs/cv-1234567890.pdf",
        "otherDocuments": null,
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "collaborator": {...},
        "admin": {...}
      }
    ],
    "pagination": {...}
  }
}
```

---

### 2. Upload file CV
**POST** `/api/admin/cv-storages/:id/upload`

**Mô tả:** Upload file CV (PDF, DOC, DOCX, JPG, JPEG, PNG) cho một CV.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Path Parameters:**
- `id`: ID của CV

**Form Data:**
- `cvFile` (required): File CV cần upload
- `fileType` (optional): Loại file - `curriculumVitae` (default) hoặc `otherDocuments`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Upload file thành công",
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-ABC12345",
      "curriculumVitae": "/uploads/cvs/cv-1234567890.pdf",
      "otherDocuments": null
    },
    "file": {
      "filename": "cv-1234567890.pdf",
      "originalname": "John_Doe_CV.pdf",
      "size": 1024000,
      "path": "/uploads/cvs/cv-1234567890.pdf"
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Vui lòng chọn file để upload"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CV"
}
```

---

### 3. Download file CV
**GET** `/api/admin/cv-storages/:id/download`

**Mô tả:** Download file CV từ server.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CV

**Query Parameters:**
- `fileType` (optional): Loại file - `curriculumVitae` (default) hoặc `otherDocuments`

**Response Success (200):**
- File được trả về dưới dạng binary stream
- Headers: `Content-Type: application/octet-stream`, `Content-Disposition: attachment`

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CV"
}
```

```json
{
  "success": false,
  "message": "File không tồn tại"
}
```

---

### 4. Xóa file CV
**DELETE** `/api/admin/cv-storages/:id/file`

**Mô tả:** Xóa file CV khỏi server và cập nhật record CV.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: ID của CV

**Query Parameters:**
- `fileType` (optional): Loại file - `curriculumVitae` (default) hoặc `otherDocuments`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Xóa file thành công"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Không tìm thấy CV"
}
```

```json
{
  "success": false,
  "message": "File không tồn tại"
}
```

---

## 📝 Ghi chú bổ sung

### Về File Upload:
- **Kích thước tối đa**: 10MB (có thể cấu hình trong config)
- **Định dạng cho phép**: PDF, DOC, DOCX, JPG, JPEG, PNG
- **Thư mục lưu trữ**: `uploads/cvs/` (tự động tạo nếu chưa có)
- **Tên file**: Tự động generate với format `cv-{timestamp}-{random}.{ext}`

### Về CV Code:
- Nếu không cung cấp `code` khi tạo CV, hệ thống sẽ tự động generate với format `CV-{UUID}`

### Về Collaborator Assignment:
- Nếu không gán `collaboratorId` khi tạo CV, CV sẽ thuộc về admin tạo (`adminId` = admin hiện tại)
- Có thể cập nhật `collaboratorId` sau khi tạo CV

### Về Lịch sử cập nhật:
- Lịch sử được lấy từ bảng `action_logs` với `object = 'CVStorage'`
- Hiển thị tối đa 50 bản ghi gần nhất

---

## 📂 Quản lý Danh mục Việc làm (Job Categories)

### 1. Lấy danh sách danh mục việc làm
**GET** `/api/admin/job-categories`

**Mô tả:** Lấy danh sách danh mục việc làm với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng mỗi trang (mặc định: 10)
- `search` (string, optional): Tìm kiếm theo tên hoặc slug
- `status` (number, optional): Lọc theo trạng thái (0: inactive, 1: active)
- `parentId` (number|string, optional): Lọc theo danh mục cha (null hoặc 0: chỉ lấy danh mục gốc)
- `sortBy` (string, optional): Sắp xếp theo field (id, name, order, createdAt, updatedAt) - mặc định: id
- `sortOrder` (string, optional): Thứ tự sắp xếp (ASC, DESC) - mặc định: ASC

**Response 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "IT - Phần mềm",
        "slug": "it-phan-mem",
        "description": "Danh mục việc làm IT",
        "parentId": null,
        "order": 1,
        "status": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "parent": null,
        "children": [],
        "jobsCount": 15
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

### 2. Lấy cây danh mục việc làm (hierarchical structure)
**GET** `/api/admin/job-categories/tree`

**Mô tả:** Lấy toàn bộ danh mục việc làm dưới dạng cây phân cấp (parent-child).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (number, optional): Lọc theo trạng thái (0: inactive, 1: active)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tree": [
      {
        "id": 1,
        "name": "IT - Phần mềm",
        "slug": "it-phan-mem",
        "order": 1,
        "status": 1,
        "children": [
          {
            "id": 2,
            "name": "Frontend Developer",
            "slug": "frontend-developer",
            "order": 1,
            "status": 1,
            "children": []
          }
        ]
      }
    ]
  }
}
```

### 3. Lấy thông tin danh mục việc làm theo ID
**GET** `/api/admin/job-categories/:id`

**Mô tả:** Lấy chi tiết một danh mục việc làm bao gồm danh mục cha, danh mục con và danh sách việc làm.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "IT - Phần mềm",
      "slug": "it-phan-mem",
      "description": "Danh mục việc làm IT",
      "parentId": null,
      "order": 1,
      "status": 1,
      "parent": null,
      "children": [
        {
          "id": 2,
          "name": "Frontend Developer",
          "slug": "frontend-developer",
          "order": 1,
          "status": 1
        }
      ],
      "jobs": [
        {
          "id": 1,
          "title": "Senior Frontend Developer",
          "jobCode": "JOB-001",
          "status": 1
        }
      ]
    }
  }
}
```

### 4. Tạo danh mục việc làm mới
**POST** `/api/admin/job-categories`

**Mô tả:** Tạo một danh mục việc làm mới.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "IT - Phần mềm",
  "slug": "it-phan-mem",
  "description": "Danh mục việc làm IT",
  "parentId": null,
  "order": 1,
  "status": 1
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo danh mục việc làm thành công",
  "data": {
    "category": {
      "id": 1,
      "name": "IT - Phần mềm",
      "slug": "it-phan-mem",
      "description": "Danh mục việc làm IT",
      "parentId": null,
      "order": 1,
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Cập nhật danh mục việc làm
**PUT** `/api/admin/job-categories/:id`

**Mô tả:** Cập nhật thông tin danh mục việc làm.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "IT - Phần mềm (Updated)",
  "slug": "it-phan-mem-updated",
  "description": "Mô tả mới",
  "parentId": null,
  "order": 2,
  "status": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật danh mục việc làm thành công",
  "data": {
    "category": {
      "id": 1,
      "name": "IT - Phần mềm (Updated)",
      "slug": "it-phan-mem-updated",
      "description": "Mô tả mới",
      "parentId": null,
      "order": 2,
      "status": 1,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 6. Xóa danh mục việc làm
**DELETE** `/api/admin/job-categories/:id`

**Mô tả:** Xóa mềm (soft delete) một danh mục việc làm. Không thể xóa nếu có danh mục con hoặc có việc làm.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa danh mục việc làm thành công"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Không thể xóa danh mục có danh mục con. Vui lòng xóa hoặc chuyển danh mục con trước."
}
```

---

## 🏢 Quản lý Công ty (Companies)

### 1. Lấy danh sách công ty
**GET** `/api/admin/companies`

**Mô tả:** Lấy danh sách công ty với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, optional): Số trang (mặc định: 1)
- `limit` (number, optional): Số lượng mỗi trang (mặc định: 10)
- `search` (string, optional): Tìm kiếm theo tên, mã công ty, email hoặc SĐT
- `status` (boolean|string, optional): Lọc theo trạng thái (true/false, 1/0, "true"/"false")
- `type` (string, optional): Lọc theo loại công ty
- `sortBy` (string, optional): Sắp xếp theo field (id, name, companyCode, createdAt, updatedAt) - mặc định: id
- `sortOrder` (string, optional): Thứ tự sắp xếp (ASC, DESC) - mặc định: ASC

**Response 200:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": 1,
        "name": "Công ty ABC",
        "logo": "/uploads/companies/logo-abc.jpg",
        "companyCode": "COMP-001",
        "type": "Technology",
        "address": "123 Đường ABC, Quận 1, TP.HCM",
        "phone": "0123456789",
        "email": "contact@abc.com",
        "website": "https://abc.com",
        "description": "Mô tả công ty",
        "status": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "jobsCount": 25
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### 2. Lấy thông tin công ty theo ID
**GET** `/api/admin/companies/:id`

**Mô tả:** Lấy chi tiết một công ty bao gồm lĩnh vực kinh doanh, danh sách email và văn phòng.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": 1,
      "name": "Công ty ABC",
      "logo": "/uploads/companies/logo-abc.jpg",
      "companyCode": "COMP-001",
      "type": "Technology",
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "phone": "0123456789",
      "email": "contact@abc.com",
      "website": "https://abc.com",
      "description": "Mô tả công ty",
      "status": true,
      "businessFields": [
        {
          "id": 1,
          "companyId": 1,
          "content": "Phát triển phần mềm",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "emailAddresses": [
        {
          "id": 1,
          "companyId": 1,
          "email": "hr@abc.com",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "offices": [
        {
          "id": 1,
          "companyId": 1,
          "address": "123 Đường ABC, Quận 1, TP.HCM",
          "isHeadOffice": true,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "jobs": [
        {
          "id": 1,
          "title": "Senior Frontend Developer",
          "jobCode": "JOB-001",
          "status": 1
        }
      ]
    }
  }
}
```

### 3. Tạo công ty mới
**POST** `/api/admin/companies`

**Mô tả:** Tạo một công ty mới cùng với lĩnh vực kinh doanh, danh sách email và văn phòng.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Công ty ABC",
  "logo": "/uploads/companies/logo-abc.jpg",
  "companyCode": "COMP-001",
  "type": "Technology",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "phone": "0123456789",
  "email": "contact@abc.com",
  "website": "https://abc.com",
  "description": "Mô tả công ty",
  "status": true,
  "businessFields": [
    {
      "content": "Phát triển phần mềm"
    },
    {
      "content": "Tư vấn công nghệ"
    }
  ],
  "emailAddresses": [
    {
      "email": "hr@abc.com"
    },
    {
      "email": "contact@abc.com"
    }
  ],
  "offices": [
    {
      "address": "123 Đường ABC, Quận 1, TP.HCM",
      "isHeadOffice": true
    },
    {
      "address": "456 Đường XYZ, Quận 2, TP.HCM",
      "isHeadOffice": false
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo công ty thành công",
  "data": {
    "company": {
      "id": 1,
      "name": "Công ty ABC",
      "companyCode": "COMP-001",
      "status": true,
      "businessFields": [...],
      "emailAddresses": [...],
      "offices": [...]
    }
  }
}
```

### 4. Cập nhật công ty
**PUT** `/api/admin/companies/:id`

**Mô tả:** Cập nhật thông tin công ty và các dữ liệu liên quan (business fields, email addresses, offices).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (Tương tự như tạo mới, tất cả fields đều optional)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật công ty thành công",
  "data": {
    "company": {
      "id": 1,
      "name": "Công ty ABC (Updated)",
      ...
    }
  }
}
```

### 5. Xóa công ty
**DELETE** `/api/admin/companies/:id`

**Mô tả:** Xóa cứng (hard delete) một công ty. Không thể xóa nếu có việc làm.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa công ty thành công"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Không thể xóa công ty có việc làm. Vui lòng xóa hoặc chuyển việc làm trước."
}
```

### 6. Kích hoạt/Vô hiệu hóa công ty
**PATCH** `/api/admin/companies/:id/toggle-status`

**Mô tả:** Chuyển đổi trạng thái hoạt động của công ty.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Kích hoạt công ty thành công",
  "data": {
    "company": {
      "id": 1,
      "name": "Công ty ABC",
      "status": true,
      ...
    }
  }
}
```

---

## 📌 Ghi chú bổ sung

### Về Job Categories:
- Danh mục việc làm hỗ trợ cấu trúc phân cấp (parent-child)
- Không thể xóa danh mục có danh mục con hoặc có việc làm
- Slug phải là duy nhất
- Order dùng để sắp xếp thứ tự hiển thị

### Về Companies:
- Công ty không có soft delete (hard delete)
- Khi cập nhật businessFields, emailAddresses, offices - hệ thống sẽ xóa toàn bộ dữ liệu cũ và tạo mới
- Mỗi công ty có thể có nhiều lĩnh vực kinh doanh, nhiều email và nhiều văn phòng
- `isHeadOffice` trong offices: true = văn phòng chính, false = văn phòng chi nhánh

---

## 📋 4. QUẢN LÝ VIỆC LÀM (JOBS)

### 1. Xem danh sách việc làm
**GET** `/api/admin/jobs`

**Mô tả:** Lấy danh sách việc làm với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo title, job_code, slug
- `status` (number): Lọc theo trạng thái (0: Draft, 1: Published, 2: Closed, 3: Expired)
- `jobCategoryId` (number): Lọc theo danh mục
- `companyId` (number): Lọc theo công ty
- `isPinned` (boolean): Lọc theo việc làm được ghim
- `isHot` (boolean): Lọc theo việc làm hot
- `deadlineFrom` (date): Lọc từ ngày deadline
- `deadlineTo` (date): Lọc đến ngày deadline
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, title, jobCode, createdAt, updatedAt, deadline, viewsCount)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

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
        "isPinned": false,
        "isHot": true,
        "deadline": "2024-12-31",
        "viewsCount": 100,
        "applicationsCount": 5,
        "category": {
          "id": 1,
          "name": "IT",
          "slug": "it"
        },
        "company": {
          "id": 1,
          "name": "Công ty ABC",
          "companyCode": "COMP001"
        },
        "jobValues": [
          {
            "id": 1,
            "typeId": 1,
            "valueId": 1,
            "value": "500000",
            "isRequired": true,
            "type": {
              "id": 1,
              "typename": "Commission"
            },
            "valueRef": {
              "id": 1,
              "valuename": "Fixed Amount"
            }
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### 2. Xem chi tiết việc làm
**GET** `/api/admin/jobs/:id`

**Mô tả:** Lấy thông tin chi tiết của một việc làm, bao gồm tất cả các bảng liên quan.

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
      "description": "Mô tả công việc...",
      "instruction": "Hướng dẫn ứng tuyển...",
      "interviewLocation": 1,
      "bonus": "Thưởng...",
      "salaryReview": "Đánh giá lương...",
      "holidays": "Ngày nghỉ...",
      "socialInsurance": "Bảo hiểm xã hội...",
      "transportation": "Phương tiện đi lại...",
      "breakTime": "Giờ nghỉ...",
      "overtime": "Làm thêm...",
      "recruitmentType": 1,
      "contractPeriod": "Hợp đồng...",
      "companyId": 1,
      "recruitmentProcess": "Quy trình tuyển dụng...",
      "viewsCount": 100,
      "deadline": "2024-12-31",
      "status": 1,
      "isPinned": false,
      "isHot": true,
      "jdFile": "path/to/file.pdf",
      "jdOriginalFilename": "job_description.pdf",
      "jobCommissionType": "fixed",
      "requiredCvForm": "path/to/form.pdf",
      "requiredCvFormOriginalFilename": "cv_form.pdf",
      "category": {
        "id": 1,
        "name": "IT",
        "slug": "it"
      },
      "company": {
        "id": 1,
        "name": "Công ty ABC"
      },
      "workingLocations": [
        {
          "id": 1,
          "location": "Tokyo",
          "country": "Japan"
        }
      ],
      "workingLocationDetails": [
        {
          "id": 1,
          "content": "Chi tiết địa điểm..."
        }
      ],
      "salaryRanges": [
        {
          "id": 1,
          "salaryRange": "300,000 - 500,000",
          "type": "month"
        }
      ],
      "salaryRangeDetails": [
        {
          "id": 1,
          "content": "Chi tiết mức lương..."
        }
      ],
      "overtimeAllowances": [
        {
          "id": 1,
          "overtimeAllowanceRange": "1.25x - 1.5x"
        }
      ],
      "overtimeAllowanceDetails": [
        {
          "id": 1,
          "content": "Chi tiết phụ cấp..."
        }
      ],
      "requirements": [
        {
          "id": 1,
          "content": "Yêu cầu học vấn...",
          "type": "education",
          "status": "required"
        }
      ],
      "smokingPolicies": [
        {
          "id": 1,
          "allow": false
        }
      ],
      "smokingPolicyDetails": [
        {
          "id": 1,
          "content": "Chi tiết chính sách..."
        }
      ],
      "workingHours": [
        {
          "id": 1,
          "workingHours": "9:00 - 18:00"
        }
      ],
      "workingHourDetails": [
        {
          "id": 1,
          "content": "Chi tiết giờ làm việc..."
        }
      ],
      "jobValues": [
        {
          "id": 1,
          "typeId": 1,
          "valueId": 1,
          "value": "N1",
          "isRequired": true,
          "type": {
            "id": 1,
            "typename": "JLPT"
          },
          "valueRef": {
            "id": 1,
            "valuename": "N1"
          }
        }
      ],
      "jobPickupIds": [
        {
          "id": 1,
          "jobPickupId": 1,
          "pickup": {
            "id": 1,
            "name": "Việc làm hot tháng 1"
          }
        }
      ],
      "applications": [
        {
          "id": 1,
          "status": 1,
          "appliedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

### 3. Tạo việc làm mới
**POST** `/api/admin/jobs`

**Mô tả:** Tạo một việc làm mới với đầy đủ thông tin và các bảng liên quan.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobCode": "JOB001",
  "jobCategoryId": 1,
  "title": "Lập trình viên PHP",
  "slug": "lap-trinh-vien-php",
  "description": "Mô tả công việc...",
  "instruction": "Hướng dẫn ứng tuyển...",
  "interviewLocation": 1,
  "bonus": "Thưởng...",
  "salaryReview": "Đánh giá lương...",
  "holidays": "Ngày nghỉ...",
  "socialInsurance": "Bảo hiểm xã hội...",
  "transportation": "Phương tiện đi lại...",
  "breakTime": "Giờ nghỉ...",
  "overtime": "Làm thêm...",
  "recruitmentType": 1,
  "contractPeriod": "Hợp đồng...",
  "companyId": 1,
  "recruitmentProcess": "Quy trình tuyển dụng...",
  "deadline": "2024-12-31",
  "status": 1,
  "isPinned": false,
  "isHot": false,
  "jobCommissionType": "fixed",
  "requiredCvForm": "path/to/form.pdf",
  "requiredCvFormOriginalFilename": "cv_form.pdf",
  "workingLocations": [
    {
      "location": "Tokyo",
      "country": "Japan"
    }
  ],
  "workingLocationDetails": [
    {
      "content": "Chi tiết địa điểm..."
    }
  ],
  "salaryRanges": [
    {
      "salaryRange": "300,000 - 500,000",
      "type": "month"
    }
  ],
  "salaryRangeDetails": [
    {
      "content": "Chi tiết mức lương..."
    }
  ],
  "overtimeAllowances": [
    {
      "overtimeAllowanceRange": "1.25x - 1.5x"
    }
  ],
  "overtimeAllowanceDetails": [
    {
      "content": "Chi tiết phụ cấp..."
    }
  ],
  "requirements": [
    {
      "content": "Yêu cầu học vấn...",
      "type": "education",
      "status": "required"
    }
  ],
  "smokingPolicies": [
    {
      "allow": false
    }
  ],
  "smokingPolicyDetails": [
    {
      "content": "Chi tiết chính sách..."
    }
  ],
  "workingHours": [
    {
      "workingHours": "9:00 - 18:00"
    }
  ],
  "workingHourDetails": [
    {
      "content": "Chi tiết giờ làm việc..."
    }
  ],
  "jobValues": [
    {
      "typeId": 1,
      "valueId": 1,
      "value": "N1",
      "isRequired": true
    },
    {
      "typeId": 2,
      "valueId": 5,
      "value": "3年",
      "isRequired": false
    }
  ],
  "jobPickupIds": [
    {
      "jobPickupId": 1
    }
  ]
}
```

**Giải thích về `jobValues`:**
- `jobValues` là mảng các thuộc tính cấu hình cho việc làm, bao gồm:
  - **Thuộc tính yêu cầu**: JLPT N1, Experience 3年, Specialization, Qualification, etc.
  - **Cấu hình hoa hồng môi giới**: Phần trăm hoặc số tiền cố định
- Mỗi item trong mảng gồm:
  - `typeId` (number, required): ID của loại setting (Type) - ví dụ: 1 = JLPT, 2 = Experience, 3 = Commission
  - `valueId` (number, required): ID của giá trị (Value) - ví dụ: 1 = N1, 5 = 3年
  - `value` (string, optional): **Giá trị hoa hồng môi giới** - ý nghĩa phụ thuộc vào `jobCommissionType` của job:
    - Nếu `jobCommissionType = 'fixed'`: `value` là **số tiền cố định** (ví dụ: "500000" = 500,000 yen)
    - Nếu `jobCommissionType = 'percent'`: `value` là **phần trăm** (ví dụ: "10" = 10%)
  - `isRequired` (boolean, default: false): Có bắt buộc hay không

**Ví dụ:**
- Gán JLPT N1 (bắt buộc): `{ "typeId": 1, "valueId": 1, "isRequired": true }`
- Gán Experience 3年 (không bắt buộc): `{ "typeId": 2, "valueId": 5, "isRequired": false }`
- Gán hoa hồng (với `jobCommissionType = 'fixed'`): `{ "typeId": 3, "valueId": 1, "value": "500000", "isRequired": false }` → 500,000 yen
- Gán hoa hồng (với `jobCommissionType = 'percent'`): `{ "typeId": 3, "valueId": 1, "value": "10", "isRequired": false }` → 10%

**Lưu ý quan trọng:**
- Trường `jobCommissionType` trong job (`'fixed'` hoặc `'percent'`) quyết định cách hiểu trường `value` trong `jobValues`
- Nếu `jobCommissionType = 'fixed'`: Tất cả `value` trong `jobValues` (của type Commission) sẽ được hiểu là số tiền cố định
- Nếu `jobCommissionType = 'percent'`: Tất cả `value` trong `jobValues` (của type Commission) sẽ được hiểu là phần trăm
- Cần tạo Type và Value trước khi gán vào job
- Có thể gán nhiều jobValues cho một job
- Khi cập nhật job, nếu cung cấp `jobValues`, hệ thống sẽ xóa toàn bộ jobValues cũ và tạo mới
- `value` phải là số dương (số tiền hoặc phần trăm)
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo việc làm thành công",
  "data": {
    "job": {
      "id": 1,
      "jobCode": "JOB001",
      "title": "Lập trình viên PHP",
      ...
    }
  }
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Mã việc làm, danh mục, tiêu đề và slug là bắt buộc"
}
```

**Error 409:**
```json
{
  "success": false,
  "message": "Mã việc làm đã tồn tại"
}
```

### 4. Cập nhật việc làm
**PUT** `/api/admin/jobs/:id`

**Mô tả:** Cập nhật thông tin việc làm và các bảng liên quan. Nếu cung cấp mảng cho các bảng liên quan, hệ thống sẽ xóa toàn bộ dữ liệu cũ và tạo mới.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tương tự như tạo mới, tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật việc làm thành công",
  "data": {
    "job": {
      "id": 1,
      ...
    }
  }
}
```

### 5. Xóa việc làm
**DELETE** `/api/admin/jobs/:id`

**Mô tả:** Xóa mềm (soft delete) một việc làm. Không thể xóa nếu có ứng viên đã ứng tuyển.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa việc làm thành công"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Không thể xóa việc làm có ứng viên đã ứng tuyển. Vui lòng đóng việc làm trước."
}
```

### 6. Ghim/Bỏ ghim việc làm
**PATCH** `/api/admin/jobs/:id/toggle-pinned`

**Mô tả:** Chuyển đổi trạng thái ghim của việc làm.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Ghim việc làm thành công",
  "data": {
    "job": {
      "id": 1,
      "isPinned": true,
      ...
    }
  }
}
```

### 7. Đánh dấu/Bỏ đánh dấu việc làm hot
**PATCH** `/api/admin/jobs/:id/toggle-hot`

**Mô tả:** Chuyển đổi trạng thái hot của việc làm.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đánh dấu việc làm hot thành công",
  "data": {
    "job": {
      "id": 1,
      "isHot": true,
      ...
    }
  }
}
```

### 8. Cập nhật trạng thái việc làm
**PATCH** `/api/admin/jobs/:id/status`

**Mô tả:** Cập nhật trạng thái việc làm (0: Draft, 1: Published, 2: Closed, 3: Expired).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái việc làm thành công",
  "data": {
    "job": {
      "id": 1,
      "status": 1,
      ...
    }
  }
}
```

---

## 📌 Ghi chú bổ sung về Jobs

### Về Jobs:
- Việc làm có soft delete (deleted_at)
- Khi cập nhật các bảng liên quan (workingLocations, salaryRanges, requirements, etc.), hệ thống sẽ xóa toàn bộ dữ liệu cũ và tạo mới
- `jobCode` và `slug` phải là duy nhất
- `status`: 0 = Draft, 1 = Published, 2 = Closed, 3 = Expired
- `interviewLocation`: 1 = Việt Nam, 2 = Nhật Bản, 3 = Việt Nam & Nhật Bản
- `recruitmentType`: 1 = Nhân viên chính thức, 2 = Nhân viên chính thức (công ty haken; hợp đồng vô thời hạn), 3 = Nhân viên haken (hợp đồng có thời hạn), 4 = Nhân viên hợp đồng
- `jobCommissionType`: **Quan trọng** - Quyết định cách hiểu `value` trong `jobValues`:
  - `'fixed'` = Hoa hồng cố định (số tiền) → `value` trong `jobValues` là số tiền (ví dụ: "500000" = 500,000 yen)
  - `'percent'` = Hoa hồng phần trăm → `value` trong `jobValues` là phần trăm (ví dụ: "10" = 10%)
- `requirements.type`: 'education' = Học vấn, 'technique' = Kỹ thuật
- `requirements.status`: 'required' = Bắt buộc, 'optional' = Tùy chọn, 'first_stand' = Ưu tiên
- `salaryRanges.type`: 'month' = Theo tháng, 'year' = Theo năm
- Không thể xóa việc làm nếu có ứng viên đã ứng tuyển

---

## ⚙️ 5. QUẢN LÝ CẤU HÌNH THUỘC TÍNH VIỆC LÀM (TYPES & VALUES)

### 1. Xem danh sách loại setting (Types)
**GET** `/api/admin/types`

**Mô tả:** Lấy danh sách loại setting (JLPT, Experience, Specialization, Qualification) với phân trang.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo typename
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, typename, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)
- `includeValues` (boolean, default: false): Bao gồm danh sách values

**Response 200:**
```json
{
  "success": true,
  "data": {
    "types": [
      {
        "id": 1,
        "typename": "JLPT",
        "values": [
          {
            "id": 1,
            "valuename": "N1",
            "createdAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
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

### 2. Lấy tất cả loại setting (cho dropdown)
**GET** `/api/admin/types/all`

**Mô tả:** Lấy tất cả loại setting, thường dùng cho dropdown.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `includeValues` (boolean, default: false): Bao gồm danh sách values

**Response 200:**
```json
{
  "success": true,
  "data": {
    "types": [
      {
        "id": 1,
        "typename": "JLPT",
        "values": [
          {
            "id": 1,
            "valuename": "N1"
          },
          {
            "id": 2,
            "valuename": "N2"
          }
        ]
      }
    ]
  }
}
```

### 3. Xem chi tiết loại setting
**GET** `/api/admin/types/:id`

**Mô tả:** Lấy thông tin chi tiết của một loại setting, bao gồm tất cả values.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "type": {
      "id": 1,
      "typename": "JLPT",
      "values": [
        {
          "id": 1,
          "valuename": "N1",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Tạo loại setting mới
**POST** `/api/admin/types`

**Mô tả:** Tạo một loại setting mới.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "typename": "JLPT"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo loại setting thành công",
  "data": {
    "type": {
      "id": 1,
      "typename": "JLPT",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error 409:**
```json
{
  "success": false,
  "message": "Tên loại setting đã tồn tại"
}
```

### 5. Cập nhật loại setting
**PUT** `/api/admin/types/:id`

**Mô tả:** Cập nhật tên loại setting.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "typename": "Japanese Language Proficiency Test"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật loại setting thành công",
  "data": {
    "type": {
      "id": 1,
      "typename": "Japanese Language Proficiency Test",
      ...
    }
  }
}
```

### 6. Xóa loại setting
**DELETE** `/api/admin/types/:id`

**Mô tả:** Xóa mềm (soft delete) một loại setting. Không thể xóa nếu có values hoặc đang được sử dụng trong job values.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa loại setting thành công"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Không thể xóa loại setting có giá trị. Vui lòng xóa các giá trị trước."
}
```

---

## 📊 6. QUẢN LÝ GIÁ TRỊ (VALUES)

### 1. Xem danh sách giá trị
**GET** `/api/admin/values`

**Mô tả:** Lấy danh sách giá trị với phân trang, có thể lọc theo type.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo valuename
- `typeId` (number): Lọc theo loại setting
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, valuename, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "values": [
      {
        "id": 1,
        "valuename": "N1",
        "typeId": 1,
        "type": {
          "id": 1,
          "typename": "JLPT"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
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

### 2. Lấy giá trị theo loại setting
**GET** `/api/admin/values/by-type/:typeId`

**Mô tả:** Lấy tất cả giá trị của một loại setting, thường dùng cho dropdown.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "values": [
      {
        "id": 1,
        "valuename": "N1",
        "typeId": 1,
        "type": {
          "id": 1,
          "typename": "JLPT"
        }
      },
      {
        "id": 2,
        "valuename": "N2",
        "typeId": 1,
        "type": {
          "id": 1,
          "typename": "JLPT"
        }
      }
    ]
  }
}
```

### 3. Xem chi tiết giá trị
**GET** `/api/admin/values/:id`

**Mô tả:** Lấy thông tin chi tiết của một giá trị.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "value": {
      "id": 1,
      "valuename": "N1",
      "typeId": 1,
      "type": {
        "id": 1,
        "typename": "JLPT"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Tạo giá trị mới
**POST** `/api/admin/values`

**Mô tả:** Tạo một giá trị mới cho một loại setting.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "typeId": 1,
  "valuename": "N1"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo giá trị thành công",
  "data": {
    "value": {
      "id": 1,
      "typeId": 1,
      "valuename": "N1",
      "type": {
        "id": 1,
        "typename": "JLPT"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error 409:**
```json
{
  "success": false,
  "message": "Tên giá trị đã tồn tại cho loại setting này"
}
```

### 5. Cập nhật giá trị
**PUT** `/api/admin/values/:id`

**Mô tả:** Cập nhật thông tin giá trị (có thể đổi type hoặc tên).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "typeId": 1,
  "valuename": "N1 - Advanced"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật giá trị thành công",
  "data": {
    "value": {
      "id": 1,
      "typeId": 1,
      "valuename": "N1 - Advanced",
      ...
    }
  }
}
```

### 6. Xóa giá trị
**DELETE** `/api/admin/values/:id`

**Mô tả:** Xóa mềm (soft delete) một giá trị. Không thể xóa nếu đang được sử dụng trong job values.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa giá trị thành công"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Không thể xóa giá trị đang được sử dụng trong việc làm. Vui lòng xóa các liên kết trước."
}
```

---

## 📌 Ghi chú bổ sung về Types & Values

### Về Types:
- Type là loại setting cho thuộc tính việc làm (ví dụ: JLPT, Experience, Specialization, Qualification)
- Type có soft delete (deleted_at)
- Không thể xóa type nếu có values hoặc đang được sử dụng trong job values
- `typename` phải là duy nhất

### Về Values:
- Value là giá trị cụ thể của một type (ví dụ: N1, N2, N3 cho JLPT; 1年, 2年 cho Experience)
- Value có soft delete (deleted_at)
- Không thể xóa value nếu đang được sử dụng trong job values
- `valuename` phải là duy nhất trong cùng một type
- Một value có thể đổi type, nhưng phải đảm bảo không trùng tên với value khác trong type mới

### Về JobValues:
- JobValue là bảng mapping giữa Job và Value
- Một job có thể có nhiều job values (ví dụ: JLPT N1, Experience 3年)
- `value` field trong JobValue là giá trị tùy chỉnh (ví dụ: số tiền, phần trăm)
- `isRequired` cho biết giá trị này có bắt buộc hay không

---

## 📋 7. QUẢN LÝ ĐƠN ỨNG TUYỂN (JOB APPLICATIONS)

### 1. Xem danh sách đơn ứng tuyển
**GET** `/api/admin/job-applications`

**Mô tả:** Lấy danh sách đơn ứng tuyển với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tên, email, SĐT của CV
- `status` (number): Lọc theo trạng thái (1-17)
- `jobId` (number): Lọc theo việc làm
- `collaboratorId` (number): Lọc theo CTV
- `appliedFrom` (date): Lọc từ ngày ứng tuyển
- `appliedTo` (date): Lọc đến ngày ứng tuyển
- `interviewFrom` (date): Lọc từ ngày phỏng vấn
- `interviewTo` (date): Lọc đến ngày phỏng vấn
- `nyushaFrom` (date): Lọc từ ngày nhập công ty
- `nyushaTo` (date): Lọc đến ngày nhập công ty
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, status, appliedAt, interviewDate, nyushaDate, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "jobApplications": [
      {
        "id": 1,
        "jobId": 1,
        "collaboratorId": 1,
        "title": "Ứng tuyển vị trí...",
        "status": 1,
        "cvCode": "CV001",
        "monthlySalary": "500000.00",
        "appliedAt": "2024-01-01T00:00:00.000Z",
        "interviewDate": "2024-01-15T00:00:00.000Z",
        "nyushaDate": "2024-02-01",
        "expectedPaymentDate": "2024-03-01",
        "rejectNote": null,
        "job": {
          "id": 1,
          "jobCode": "JOB001",
          "title": "Lập trình viên PHP"
        },
        "collaborator": {
          "id": 1,
          "name": "CTV A",
          "email": "ctv@example.com"
        },
        "cv": {
          "id": 1,
          "code": "CV001",
          "name": "Nguyễn Văn A"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### 2. Xem chi tiết đơn ứng tuyển
**GET** `/api/admin/job-applications/:id`

**Mô tả:** Lấy thông tin chi tiết của một đơn ứng tuyển.

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
      "collaboratorId": 1,
      "title": "Ứng tuyển vị trí...",
      "status": 1,
      "cvCode": "CV001",
      "monthlySalary": "500000.00",
      "appliedAt": "2024-01-01T00:00:00.000Z",
      "interviewDate": "2024-01-15T00:00:00.000Z",
      "interviewRound2Date": null,
      "nyushaDate": "2024-02-01",
      "expectedPaymentDate": "2024-03-01",
      "rejectNote": null,
      "job": {
        "id": 1,
        "jobCode": "JOB001",
        "title": "Lập trình viên PHP",
        "category": {...},
        "company": {...}
      },
      "collaborator": {...},
      "cv": {...}
    }
  }
}
```

### 3. Tạo đơn ứng tuyển mới
**POST** `/api/admin/job-applications`

**Mô tả:** Tạo một đơn ứng tuyển mới.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": 1,
  "collaboratorId": 1,
  "title": "Ứng tuyển vị trí...",
  "status": 1,
  "cvCode": "CV001",
  "monthlySalary": "500000.00",
  "appliedAt": "2024-01-01T00:00:00.000Z",
  "interviewDate": "2024-01-15T00:00:00.000Z",
  "nyushaDate": "2024-02-01",
  "expectedPaymentDate": "2024-03-01"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo đơn ứng tuyển thành công",
  "data": {
    "jobApplication": {...}
  }
}
```

### 4. Cập nhật đơn ứng tuyển
**PUT** `/api/admin/job-applications/:id`

**Mô tả:** Cập nhật thông tin đơn ứng tuyển.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tất cả các trường đều optional)

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

### 5. Cập nhật trạng thái đơn ứng tuyển
**PATCH** `/api/admin/job-applications/:id/status`

**Mô tả:** Cập nhật trạng thái đơn ứng tuyển (17 trạng thái).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": 8,
  "rejectNote": "Lý do từ chối (nếu có)"
}
```

**17 Trạng thái:**
1. Admin đang xử lý hồ sơ
2. Đang tiến cử
3. Đang xếp lịch phỏng vấn
4. Đang phỏng vấn
5. Đang đợi naitei
6. Đang thương lượng naitei
7. Đang đợi nyusha
8. **Đã nyusha** (quan trọng - bắt đầu tính phí)
9. Đang chờ thanh toán với công ty
10. Gửi yêu cầu thanh toán
11. **Đã thanh toán** (hoàn thành)
12. Hồ sơ không hợp lệ
13. Hồ sơ bị trùng
14. Hồ sơ không đạt
15. Kết quả trượt
16. Hủy giữa chừng
17. Không shodaku

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn ứng tuyển thành công",
  "data": {
    "jobApplication": {...}
  }
}
```

### 6. Xóa đơn ứng tuyển
**DELETE** `/api/admin/job-applications/:id`

**Mô tả:** Xóa mềm (soft delete) một đơn ứng tuyển.

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

---

## 🎯 8. QUẢN LÝ CHIẾN DỊCH (CAMPAIGNS)

### 1. Xem danh sách chiến dịch
**GET** `/api/admin/campaigns`

**Mô tả:** Lấy danh sách chiến dịch với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tên hoặc mô tả
- `status` (number): Lọc theo trạng thái (0: inactive, 1: active, 2: ended)
- `startDateFrom` (date): Lọc từ ngày bắt đầu
- `startDateTo` (date): Lọc đến ngày bắt đầu
- `endDateFrom` (date): Lọc từ ngày kết thúc
- `endDateTo` (date): Lọc đến ngày kết thúc
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, name, startDate, endDate, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "name": "Chiến dịch tuyển dụng tháng 1",
        "description": "Mô tả chiến dịch...",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-31T23:59:59.000Z",
        "maxCv": 100,
        "percent": 10,
        "status": 1,
        "applicationsCount": 25,
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

### 2. Xem chi tiết chiến dịch
**GET** `/api/admin/campaigns/:id`

**Mô tả:** Lấy thông tin chi tiết của một chiến dịch, bao gồm danh sách đơn ứng tuyển.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "name": "Chiến dịch tuyển dụng tháng 1",
      "description": "Mô tả chiến dịch...",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "maxCv": 100,
      "percent": 10,
      "status": 1,
      "applications": [
        {
          "id": 1,
          "collaborator": {...},
          "job": {...}
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Tạo chiến dịch mới
**POST** `/api/admin/campaigns`

**Mô tả:** Tạo một chiến dịch mới.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chiến dịch tuyển dụng tháng 1",
  "description": "Mô tả chiến dịch...",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z",
  "maxCv": 100,
  "percent": 10,
  "status": 0
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo chiến dịch thành công",
  "data": {
    "campaign": {...}
  }
}
```

### 4. Cập nhật chiến dịch
**PUT** `/api/admin/campaigns/:id`

**Mô tả:** Cập nhật thông tin chiến dịch.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật chiến dịch thành công",
  "data": {
    "campaign": {...}
  }
}
```

### 5. Cập nhật trạng thái chiến dịch
**PATCH** `/api/admin/campaigns/:id/status`

**Mô tả:** Cập nhật trạng thái chiến dịch (0: inactive, 1: active, 2: ended).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái chiến dịch thành công",
  "data": {
    "campaign": {...}
  }
}
```

### 6. Xóa chiến dịch
**DELETE** `/api/admin/campaigns/:id`

**Mô tả:** Xóa mềm (soft delete) một chiến dịch.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa chiến dịch thành công"
}
```

---

## 📝 9. QUẢN LÝ DANH MỤC CMS (CATEGORIES)

### 1. Xem danh sách danh mục
**GET** `/api/admin/categories`

**Mô tả:** Lấy danh sách danh mục với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tên hoặc slug
- `isActive` (boolean): Lọc theo trạng thái hoạt động
- `showInDashboard` (boolean): Lọc theo hiển thị trên dashboard
- `sortBy` (string, default: 'sortOrder'): Sắp xếp theo (id, name, slug, sortOrder, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Tin tức",
        "slug": "tin-tuc",
        "description": "Mô tả...",
        "color": "#007bff",
        "isActive": true,
        "sortOrder": 1,
        "showInDashboard": true,
        "postsCount": 10,
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

### 2. Lấy tất cả danh mục (cho dropdown)
**GET** `/api/admin/categories/all`

**Mô tả:** Lấy tất cả danh mục, thường dùng cho dropdown.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `isActive` (boolean): Lọc theo trạng thái hoạt động

**Response 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Tin tức",
        "slug": "tin-tuc"
      }
    ]
  }
}
```

### 3. Xem chi tiết danh mục
**GET** `/api/admin/categories/:id`

**Mô tả:** Lấy thông tin chi tiết của một danh mục.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "Tin tức",
      "slug": "tin-tuc",
      "description": "Mô tả...",
      "color": "#007bff",
      "isActive": true,
      "sortOrder": 1,
      "showInDashboard": true,
      "postsCount": 10,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Tạo danh mục mới
**POST** `/api/admin/categories`

**Mô tả:** Tạo một danh mục mới.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tin tức",
  "slug": "tin-tuc",
  "description": "Mô tả...",
  "color": "#007bff",
  "isActive": true,
  "sortOrder": 1,
  "showInDashboard": true
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo danh mục thành công",
  "data": {
    "category": {...}
  }
}
```

### 5. Cập nhật danh mục
**PUT** `/api/admin/categories/:id`

**Mô tả:** Cập nhật thông tin danh mục.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật danh mục thành công",
  "data": {
    "category": {...}
  }
}
```

### 6. Xóa danh mục
**DELETE** `/api/admin/categories/:id`

**Mô tả:** Xóa mềm (soft delete) một danh mục. Không thể xóa nếu có bài viết.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa danh mục thành công"
}
```

**Error 400:**
```json
{
  "success": false,
  "message": "Không thể xóa danh mục có bài viết. Vui lòng xóa hoặc chuyển bài viết trước."
}
```

---

## 📰 10. QUẢN LÝ BÀI VIẾT (POSTS)

### 1. Xem danh sách bài viết
**GET** `/api/admin/posts`

**Mô tả:** Lấy danh sách bài viết với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tiêu đề, slug hoặc nội dung
- `status` (number): Lọc theo trạng thái
- `type` (number): Lọc theo loại bài viết
- `categoryId` (string): Lọc theo danh mục (category_id là string)
- `authorId` (number): Lọc theo tác giả
- `publishedFrom` (date): Lọc từ ngày xuất bản
- `publishedTo` (date): Lọc đến ngày xuất bản
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, title, status, publishedAt, viewCount, likeCount, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Tiêu đề bài viết",
        "slug": "tieu-de-bai-viet",
        "content": "Nội dung...",
        "image": "path/to/image.jpg",
        "status": 1,
        "type": 1,
        "categoryId": "1",
        "authorId": 1,
        "viewCount": 100,
        "likeCount": 10,
        "tag": "tag1,tag2",
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "author": {
          "id": 1,
          "name": "Admin A",
          "email": "admin@example.com"
        },
        "category": {
          "id": 1,
          "name": "Tin tức",
          "slug": "tin-tuc"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### 2. Xem chi tiết bài viết
**GET** `/api/admin/posts/:id`

**Mô tả:** Lấy thông tin chi tiết của một bài viết.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": 1,
      "title": "Tiêu đề bài viết",
      "slug": "tieu-de-bai-viet",
      "content": "Nội dung...",
      "image": "path/to/image.jpg",
      "status": 1,
      "type": 1,
      "categoryId": "1",
      "authorId": 1,
      "viewCount": 100,
      "likeCount": 10,
      "tag": "tag1,tag2",
      "metaTitle": "Meta title",
      "metaDescription": "Meta description",
      "metaKeywords": "keyword1,keyword2",
      "metaImage": "path/to/meta-image.jpg",
      "metaUrl": "https://example.com/post",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "author": {...},
      "category": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Tạo bài viết mới
**POST** `/api/admin/posts`

**Mô tả:** Tạo một bài viết mới. Tác giả sẽ tự động là admin đang đăng nhập.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Tiêu đề bài viết",
  "content": "Nội dung bài viết...",
  "slug": "tieu-de-bai-viet",
  "image": "path/to/image.jpg",
  "status": 1,
  "type": 1,
  "categoryId": "1",
  "tag": "tag1,tag2",
  "metaTitle": "Meta title",
  "metaDescription": "Meta description",
  "metaKeywords": "keyword1,keyword2",
  "metaImage": "path/to/meta-image.jpg",
  "metaUrl": "https://example.com/post",
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo bài viết thành công",
  "data": {
    "post": {...}
  }
}
```

### 4. Cập nhật bài viết
**PUT** `/api/admin/posts/:id`

**Mô tả:** Cập nhật thông tin bài viết.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật bài viết thành công",
  "data": {
    "post": {...}
  }
}
```

### 5. Cập nhật trạng thái bài viết
**PATCH** `/api/admin/posts/:id/status`

**Mô tả:** Cập nhật trạng thái bài viết.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái bài viết thành công",
  "data": {
    "post": {...}
  }
}
```

### 6. Xóa bài viết
**DELETE** `/api/admin/posts/:id`

**Mô tả:** Xóa mềm (soft delete) một bài viết.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa bài viết thành công"
}
```

---

## 📌 Ghi chú bổ sung

### Về Job Applications:
- Đơn ứng tuyển có soft delete (deleted_at)
- `status` có 17 trạng thái (xem chi tiết ở trên)
- Trạng thái 8 (Đã nyusha) và 11 (Đã thanh toán) là quan trọng
- `cvCode` tham chiếu đến `cv_storages.code` (không phải id)
- `collaboratorId` có thể null (nếu admin tự tạo đơn)

### Về Campaigns:
- Chiến dịch có soft delete (deleted_at)
- `status`: 0 = inactive, 1 = active, 2 = ended
- `maxCv`: Số lượng CV tối đa cho chiến dịch
- `percent`: Phần trăm hoa hồng cho chiến dịch
- Ngày kết thúc phải sau ngày bắt đầu

### Về Categories:
- Danh mục có soft delete (deleted_at)
- `slug` phải là duy nhất
- `categoryId` trong Post là string, không phải foreign key
- Không thể xóa danh mục nếu có bài viết
- `sortOrder` dùng để sắp xếp thứ tự hiển thị
- `showInDashboard`: true = hiển thị trên dashboard

### Về Posts:
- Bài viết có soft delete (deleted_at)
- `slug` phải là duy nhất
- `categoryId` là string (tham chiếu đến Category.id nhưng không phải foreign key)
- `authorId` tự động là admin đang đăng nhập khi tạo mới
- `publishedAt`: null = chưa xuất bản, có giá trị = đã xuất bản
- `viewCount` và `likeCount` tự động tăng khi có tương tác

---

## 📅 11. QUẢN LÝ LỊCH HẸN (CALENDARS)

### 1. Xem danh sách lịch hẹn
**GET** `/api/admin/calendars`

**Mô tả:** Lấy danh sách lịch hẹn với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tiêu đề hoặc mô tả
- `jobApplicationId` (number): Lọc theo đơn ứng tuyển
- `adminId` (number): Lọc theo admin
- `collaboratorId` (number): Lọc theo CTV
- `eventType` (number): Lọc theo loại sự kiện (1: Interview, 2: Nyusha, 3: Khác)
- `status` (number): Lọc theo trạng thái (0: Pending, 1: Confirmed, 2: Cancelled)
- `startFrom` (date): Lọc từ thời gian bắt đầu
- `startTo` (date): Lọc đến thời gian bắt đầu
- `endFrom` (date): Lọc từ thời gian kết thúc
- `endTo` (date): Lọc đến thời gian kết thúc
- `sortBy` (string, default: 'startAt'): Sắp xếp theo (id, title, startAt, endAt, status, eventType, createdAt, updatedAt)
- `sortOrder` (string, default: 'ASC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "calendars": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "adminId": 1,
        "collaboratorId": 1,
        "eventType": 1,
        "title": "Phỏng vấn ứng viên",
        "description": "Ghi chú...",
        "startAt": "2024-01-15T10:00:00.000Z",
        "endAt": "2024-01-15T11:00:00.000Z",
        "status": 1,
        "jobApplication": {
          "id": 1,
          "title": "Ứng tuyển...",
          "status": 4,
          "job": {
            "id": 1,
            "jobCode": "JOB001",
            "title": "Lập trình viên PHP"
          }
        },
        "admin": {
          "id": 1,
          "name": "Admin A",
          "email": "admin@example.com"
        },
        "collaborator": {
          "id": 1,
          "name": "CTV A",
          "email": "ctv@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
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

### 2. Xem chi tiết lịch hẹn
**GET** `/api/admin/calendars/:id`

**Mô tả:** Lấy thông tin chi tiết của một lịch hẹn.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "calendar": {
      "id": 1,
      "jobApplicationId": 1,
      "adminId": 1,
      "collaboratorId": 1,
      "eventType": 1,
      "title": "Phỏng vấn ứng viên",
      "description": "Ghi chú...",
      "startAt": "2024-01-15T10:00:00.000Z",
      "endAt": "2024-01-15T11:00:00.000Z",
      "status": 1,
      "jobApplication": {
        "id": 1,
        "job": {...},
        "collaborator": {...}
      },
      "admin": {...},
      "collaborator": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Tạo lịch hẹn mới
**POST** `/api/admin/calendars`

**Mô tả:** Tạo một lịch hẹn mới. AdminId tự động là admin đang đăng nhập.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobApplicationId": 1,
  "collaboratorId": 1,
  "eventType": 1,
  "title": "Phỏng vấn ứng viên",
  "description": "Ghi chú chi tiết...",
  "startAt": "2024-01-15T10:00:00.000Z",
  "endAt": "2024-01-15T11:00:00.000Z",
  "status": 0
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo lịch hẹn thành công",
  "data": {
    "calendar": {...}
  }
}
```

### 4. Cập nhật lịch hẹn
**PUT** `/api/admin/calendars/:id`

**Mô tả:** Cập nhật thông tin lịch hẹn.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Tất cả các trường đều optional)

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật lịch hẹn thành công",
  "data": {
    "calendar": {...}
  }
}
```

### 5. Cập nhật trạng thái lịch hẹn
**PATCH** `/api/admin/calendars/:id/status`

**Mô tả:** Cập nhật trạng thái lịch hẹn (0: Pending, 1: Confirmed, 2: Cancelled).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái lịch hẹn thành công",
  "data": {
    "calendar": {...}
  }
}
```

### 6. Xóa lịch hẹn
**DELETE** `/api/admin/calendars/:id`

**Mô tả:** Xóa mềm (soft delete) một lịch hẹn.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa lịch hẹn thành công"
}
```

---

## 💬 12. QUẢN LÝ TIN NHẮN (MESSAGES)

### 1. Xem danh sách tin nhắn
**GET** `/api/admin/messages`

**Mô tả:** Lấy danh sách tin nhắn với phân trang, tìm kiếm, lọc và sắp xếp.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1): Trang hiện tại
- `limit` (number, default: 10): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo nội dung
- `jobApplicationId` (number): Lọc theo đơn ứng tuyển
- `adminId` (number): Lọc theo admin
- `collaboratorId` (number): Lọc theo CTV
- `senderType` (number): Lọc theo loại người gửi (1: Admin, 2: Collaborator, 3: System)
- `isReadByAdmin` (boolean): Lọc theo trạng thái đọc của admin
- `isReadByCollaborator` (boolean): Lọc theo trạng thái đọc của CTV
- `sortBy` (string, default: 'id'): Sắp xếp theo (id, senderType, createdAt, updatedAt)
- `sortOrder` (string, default: 'DESC'): Thứ tự sắp xếp (ASC, DESC)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "adminId": 1,
        "collaboratorId": 1,
        "senderType": 1,
        "content": "Nội dung tin nhắn...",
        "isReadByAdmin": true,
        "isReadByCollaborator": false,
        "jobApplication": {
          "id": 1,
          "title": "Ứng tuyển...",
          "status": 4,
          "job": {
            "id": 1,
            "jobCode": "JOB001",
            "title": "Lập trình viên PHP"
          }
        },
        "admin": {
          "id": 1,
          "name": "Admin A",
          "email": "admin@example.com"
        },
        "collaborator": {
          "id": 1,
          "name": "CTV A",
          "email": "ctv@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

### 2. Xem tin nhắn theo đơn ứng tuyển
**GET** `/api/admin/messages/job-application/:jobApplicationId`

**Mô tả:** Lấy tất cả tin nhắn của một đơn ứng tuyển, thường dùng để hiển thị cuộc trò chuyện.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (number, default: 50): Số lượng tin nhắn tối đa

**Response 200:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "senderType": 1,
        "content": "Tin nhắn từ admin...",
        "isReadByAdmin": true,
        "isReadByCollaborator": false,
        "admin": {...},
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "senderType": 2,
        "content": "Tin nhắn từ CTV...",
        "isReadByAdmin": false,
        "isReadByCollaborator": true,
        "collaborator": {...},
        "createdAt": "2024-01-01T01:00:00.000Z"
      }
    ]
  }
}
```

### 3. Xem chi tiết tin nhắn
**GET** `/api/admin/messages/:id`

**Mô tả:** Lấy thông tin chi tiết của một tin nhắn.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": 1,
      "jobApplicationId": 1,
      "adminId": 1,
      "collaboratorId": 1,
      "senderType": 1,
      "content": "Nội dung tin nhắn...",
      "isReadByAdmin": true,
      "isReadByCollaborator": false,
      "jobApplication": {...},
      "admin": {...},
      "collaborator": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Gửi tin nhắn mới
**POST** `/api/admin/messages`

**Mô tả:** Gửi một tin nhắn mới. AdminId tự động là admin đang đăng nhập.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobApplicationId": 1,
  "collaboratorId": 1,
  "content": "Nội dung tin nhắn...",
  "senderType": 1
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Gửi tin nhắn thành công",
  "data": {
    "message": {...}
  }
}
```

### 5. Đánh dấu đã đọc (Admin)
**PATCH** `/api/admin/messages/:id/mark-read-admin`

**Mô tả:** Đánh dấu tin nhắn đã được admin đọc.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đánh dấu đã đọc thành công",
  "data": {
    "message": {...}
  }
}
```

### 6. Đánh dấu đã đọc (Collaborator)
**PATCH** `/api/admin/messages/:id/mark-read-collaborator`

**Mô tả:** Đánh dấu tin nhắn đã được CTV đọc.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đánh dấu đã đọc thành công",
  "data": {
    "message": {...}
  }
}
```

### 7. Đánh dấu tất cả đã đọc (Admin)
**PATCH** `/api/admin/messages/job-application/:jobApplicationId/mark-all-read-admin`

**Mô tả:** Đánh dấu tất cả tin nhắn của một đơn ứng tuyển đã được admin đọc.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đánh dấu tất cả tin nhắn đã đọc thành công"
}
```

### 8. Xóa tin nhắn
**DELETE** `/api/admin/messages/:id`

**Mô tả:** Xóa mềm (soft delete) một tin nhắn.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "message": "Xóa tin nhắn thành công"
}
```

---

## 📌 Ghi chú bổ sung về Calendars & Messages

### Về Calendars:
- Lịch hẹn có soft delete (deleted_at)
- `eventType`: 1 = Interview (Phỏng vấn), 2 = Nyusha (Nhập công ty), 3 = Khác
- `status`: 0 = Pending (Chờ xác nhận), 1 = Confirmed (Đã xác nhận), 2 = Cancelled (Đã hủy)
- `adminId` tự động là admin đang đăng nhập khi tạo mới
- `endAt` có thể null (nếu chỉ có thời gian bắt đầu)
- Thời gian kết thúc phải sau thời gian bắt đầu (nếu có)
- Mỗi lịch hẹn liên quan đến một đơn ứng tuyển (job_application_id)

### Về Messages:
- Tin nhắn có soft delete (deleted_at)
- `senderType`: 1 = Admin, 2 = Collaborator, 3 = System
- `isReadByAdmin` và `isReadByCollaborator` dùng để theo dõi trạng thái đọc
- Khi admin gửi tin nhắn (`senderType = 1`), `isReadByAdmin` tự động = true
- Khi CTV gửi tin nhắn (`senderType = 2`), `isReadByCollaborator` tự động = true
- `adminId` tự động là admin đang đăng nhập khi tạo mới
- Mỗi tin nhắn liên quan đến một đơn ứng tuyển (job_application_id)
- Có thể lấy tất cả tin nhắn của một đơn ứng tuyển để hiển thị cuộc trò chuyện

