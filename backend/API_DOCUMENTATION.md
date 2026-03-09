# API Documentation - Admin Authentication & Authorization

## Base URL
```
http://localhost:3000/api
```

## Authentication
Háº§u háº¿t cÃ¡c API yÃªu cáº§u authentication. Sá»­ dá»¥ng JWT token trong header:
```
Authorization: Bearer <token>
```

---

## ðŸ” Admin Authentication

### 1. Login
**POST** `/admin/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "role": 1,
      "isActive": true,
      "status": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get Current Profile
**GET** `/admin/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "role": 1,
      "group": {
        "id": 1,
        "name": "CA Huyá»n",
        "code": "CA Huyá»n"
      }
    }
  }
}
```

### 3. Logout
**POST** `/admin/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## ðŸ‘¥ Admin Management

### 1. Get List of Admins
**GET** `/admin/admins`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (1: Super Admin, 2: Admin Backoffice, 3: Admin CA Team)
- `status` (optional): Filter by status (0: inactive, 1: active)
- `groupId` (optional): Filter by group ID

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com",
        "role": 1,
        "isActive": true,
        "status": 1
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

### 2. Get Admin by ID
**GET** `/admin/admins/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "role": 1,
      "group": {
        "id": 1,
        "name": "CA Huyá»n"
      }
    }
  }
}
```

### 3. Create Admin
**POST** `/admin/admins`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin only

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "phone": "0901234567",
  "role": 2,
  "groupId": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "admin": {
      "id": 2,
      "name": "New Admin",
      "email": "newadmin@example.com",
      "role": 2
    }
  }
}
```

### 4. Update Admin
**PUT** `/admin/admins/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin, Admin Backoffice, or own profile

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "0901234568",
  "avatar": "path/to/avatar.jpg",
  "role": 2,
  "groupId": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "admin": {
      "id": 1,
      "name": "Updated Name",
      "email": "admin@example.com"
    }
  }
}
```

### 5. Delete Admin
**DELETE** `/admin/admins/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin only

**Note:** Cannot delete own account

**Response:**
```json
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

### 6. Reset Password
**POST** `/admin/admins/:id/reset-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 7. Toggle Admin Status
**PATCH** `/admin/admins/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin only

**Note:** Cannot deactivate own account

**Response:**
```json
{
  "success": true,
  "message": "Admin activated successfully",
  "data": {
    "admin": {
      "id": 1,
      "isActive": true,
      "status": 1
    }
  }
}
```

---

## ðŸ‘¥ Group Management

### 1. Get List of Groups
**GET** `/admin/groups`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or code
- `status` (optional): Filter by status (0: inactive, 1: active)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "CA Huyá»n",
        "code": "CA Huyá»n",
        "referralCode": "kLOLpn1y",
        "status": 1
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 2. Get Group by ID
**GET** `/admin/groups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": 1,
      "name": "CA Huyá»n",
      "code": "CA Huyá»n",
      "referralCode": "kLOLpn1y",
      "description": "NhÃ³m chá»‹ Huyá»n",
      "status": 1,
      "admins": [
        {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
      ]
    }
  }
}
```

### 3. Create Group
**POST** `/admin/groups`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "New Group",
  "code": "NEWGROUP",
  "referralCode": "REF123",
  "description": "Description of new group",
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "group": {
      "id": 2,
      "name": "New Group",
      "code": "NEWGROUP",
      "referralCode": "REF123"
    }
  }
}
```

### 4. Update Group
**PUT** `/admin/groups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group updated successfully",
  "data": {
    "group": {
      "id": 1,
      "name": "Updated Group Name"
    }
  }
}
```

### 5. Delete Group
**DELETE** `/admin/groups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Cannot delete group if it has assigned admins

**Response:**
```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

### 6. Toggle Group Status
**PATCH** `/admin/groups/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Group activated successfully",
  "data": {
    "group": {
      "id": 1,
      "status": 1
    }
  }
}
```

---

## ðŸ”‘ Roles

- **1**: Super Admin - Full access
- **2**: Admin Backoffice - Backoffice management
- **3**: Admin CA Team - CA Team management

---

## ðŸ“ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please provide a valid token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Admin not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Name, email, and password are required"
}
```

---

---

## ðŸ‘¥ Collaborator Management

### 1. Get List of Collaborators
**GET** `/admin/collaborators`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, email, code, or phone
- `status` (optional): Filter by status (0: inactive, 1: active)
- `rankLevelId` (optional): Filter by rank level ID
- `groupId` (optional): Filter by group ID
- `organizationType` (optional): Filter by organization type (individual/business)
- `sortBy` (optional): Sort field (created_at, updated_at, points, approved_at, name, email) (default: created_at)
- `sortOrder` (optional): Sort order (ASC/DESC) (default: DESC)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "id": 1,
        "name": "Tráº§n Quá»³nh Anh",
        "code": "CN202506112226452",
        "email": "q.anhchan132@gmail.com",
        "phone": "0906130296",
        "points": 0,
        "status": 1,
        "organizationType": "individual",
        "rankLevel": {
          "id": 6,
          "name": "Level 6"
        },
        "group": {
          "id": 1,
          "name": "CA Huyá»n"
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

### 2. Get Collaborator by ID
**GET** `/admin/collaborators/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Tráº§n Quá»³nh Anh",
      "code": "CN202506112226452",
      "email": "q.anhchan132@gmail.com",
      "phone": "0906130296",
      "country": "VN",
      "address": "18 YÃªn Ninh",
      "organizationType": "individual",
      "points": 0,
      "status": 1,
      "approvedAt": "2025-06-11T15:26:45.000Z",
      "rankLevel": {
        "id": 6,
        "name": "Level 6"
      },
      "group": {
        "id": 1,
        "name": "CA Huyá»n"
      }
    }
  }
}
```

### 3. Create Collaborator
**POST** `/admin/collaborators`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "New Collaborator",
  "email": "newcollaborator@example.com",
  "password": "password123",
  "phone": "0901234567",
  "country": "VN",
  "address": "Hanoi",
  "organizationType": "individual",
  "rankLevelId": 1,
  "groupId": 1,
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator created successfully",
  "data": {
    "collaborator": {
      "id": 101,
      "name": "New Collaborator",
      "code": "CN202501011234567",
      "email": "newcollaborator@example.com"
    }
  }
}
```

### 4. Update Collaborator
**PUT** `/admin/collaborators/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "0901234568",
  "address": "Updated Address",
  "rankLevelId": 2,
  "groupId": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator updated successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Updated Name"
    }
  }
}
```

### 5. Delete Collaborator
**DELETE** `/admin/collaborators/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Collaborator deleted successfully"
}
```

### 6. Approve Collaborator
**POST** `/admin/collaborators/:id/approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Collaborator approved successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "approvedAt": "2025-01-15T10:30:00.000Z",
      "status": 1
    }
  }
}
```

### 7. Reject Collaborator
**POST** `/admin/collaborators/:id/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "reason": "Invalid information provided"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Collaborator rejected successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "approvedAt": null,
      "status": 0
    }
  }
}
```

### 8. Toggle Collaborator Status
**PATCH** `/admin/collaborators/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Collaborator activated successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "status": 1
    }
  }
}
```

### 9. Reset Collaborator Password
**POST** `/admin/collaborators/:id/reset-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

---

## ðŸ“Š Point History Management

### 1. Get Point Histories
**GET** `/admin/point-histories`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `collaboratorId` (optional): Filter by collaborator ID
- `type` (optional): Filter by type of change
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "pointHistories": [
      {
        "id": 1,
        "collaboratorId": 1,
        "points": 100,
        "type": "manual_add",
        "description": "Added 100 points manually by admin",
        "collaborator": {
          "id": 1,
          "name": "Tráº§n Quá»³nh Anh",
          "code": "CN202506112226452"
        },
        "created_at": "2025-01-15T10:30:00.000Z"
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

### 2. Get Point Histories by Collaborator
**GET** `/admin/collaborators/:id/point-histories`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "pointHistories": [...],
    "pagination": {...}
  }
}
```

### 3. Add Points to Collaborator
**POST** `/admin/collaborators/:id/add-points`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "points": 100,
  "type": "manual_add",
  "description": "Reward for good performance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added 100 points successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Tráº§n Quá»³nh Anh",
      "points": 200,
      "oldPoints": 100
    },
    "pointHistory": {
      "id": 1,
      "points": 100,
      "type": "manual_add"
    }
  }
}
```

### 4. Subtract Points from Collaborator
**POST** `/admin/collaborators/:id/subtract-points`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "points": 50,
  "type": "manual_subtract",
  "description": "Deduction for error"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subtracted 50 points successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "name": "Tráº§n Quá»³nh Anh",
      "points": 150,
      "oldPoints": 200
    },
    "pointHistory": {
      "id": 2,
      "points": -50,
      "type": "manual_subtract"
    }
  }
}
```

### 5. Get Collaborator Ranking
**GET** `/admin/collaborators/ranking`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `rankLevelId` (optional): Filter by rank level ID

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "id": 1,
        "name": "Tráº§n Quá»³nh Anh",
        "code": "CN202506112226452",
        "points": 1000,
        "rank": 1,
        "rankLevel": {
          "id": 6,
          "name": "Level 6"
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

### 6. Get Top Collaborators
**GET** `/admin/collaborators/ranking/top`

**Query Parameters:**
- `limit` (optional): Number of top collaborators (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "collaborators": [
      {
        "id": 1,
        "name": "Tráº§n Quá»³nh Anh",
        "points": 1000,
        "rank": 1
      }
    ]
  }
}
```

### 7. Get Point Statistics by Rank Level
**GET** `/admin/point-histories/statistics/by-rank`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": [
      {
        "rankLevel": {
          "id": 1,
          "name": "Level 1",
          "pointsRequired": 10000
        },
        "total": 50,
        "totalPoints": 500000,
        "averagePoints": "10000.00",
        "maxPoints": 15000,
        "minPoints": 10000
      }
    ]
  }
}
```

---

## ðŸ† Rank Level Management

### 1. Get List of Rank Levels
**GET** `/admin/rank-levels`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name
- `isActive` (optional): Filter by active status (true/false)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "rankLevels": [
      {
        "id": 1,
        "name": "Level 1",
        "description": "Level 1",
        "pointsRequired": 10000,
        "percent": "25.00",
        "isActive": true
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

### 2. Get Rank Level by ID
**GET** `/admin/rank-levels/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "rankLevel": {
      "id": 1,
      "name": "Level 1",
      "description": "Level 1",
      "pointsRequired": 10000,
      "percent": "25.00",
      "isActive": true,
      "totalCollaborators": 50,
      "collaborators": [
        {
          "id": 1,
          "name": "Tráº§n Quá»³nh Anh",
          "points": 10000
        }
      ]
    }
  }
}
```

### 3. Create Rank Level
**POST** `/admin/rank-levels`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Level 7",
  "description": "New level for top performers",
  "pointsRequired": 50000,
  "percent": "30.00",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rank level created successfully",
  "data": {
    "rankLevel": {
      "id": 7,
      "name": "Level 7",
      "pointsRequired": 50000,
      "percent": "30.00"
    }
  }
}
```

### 4. Update Rank Level
**PUT** `/admin/rank-levels/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated Level 1",
  "description": "Updated description",
  "pointsRequired": 12000,
  "percent": "26.00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rank level updated successfully",
  "data": {
    "rankLevel": {
      "id": 1,
      "name": "Updated Level 1",
      "pointsRequired": 12000
    }
  }
}
```

### 5. Delete Rank Level
**DELETE** `/admin/rank-levels/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Cannot delete rank level if it has assigned collaborators

**Response:**
```json
{
  "success": true,
  "message": "Rank level deleted successfully"
}
```

### 6. Toggle Rank Level Status
**PATCH** `/admin/rank-levels/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Rank level activated successfully",
  "data": {
    "rankLevel": {
      "id": 1,
      "isActive": true
    }
  }
}
```

---

## ðŸ“Œ Notes

1. Táº¥t cáº£ cÃ¡c hÃ nh Ä‘á»™ng Ä‘á»u Ä‘Æ°á»£c ghi log vÃ o `action_logs`
2. Password Ä‘Æ°á»£c hash báº±ng bcrypt vá»›i salt rounds = 12
3. JWT token cÃ³ thá»i háº¡n máº·c Ä‘á»‹nh lÃ  7 ngÃ y (cÃ³ thá»ƒ cáº¥u hÃ¬nh trong `.env`)
4. Soft delete Ä‘Æ°á»£c sá»­ dá»¥ng cho táº¥t cáº£ cÃ¡c báº£ng
5. Pagination máº·c Ä‘á»‹nh: page=1, limit=10
6. Collaborator code Ä‘Æ°á»£c tá»± Ä‘á»™ng generate khi táº¡o má»›i
7. Khi approve collaborator, `approvedAt` sáº½ Ä‘Æ°á»£c set vÃ  status = 1
8. Khi reject collaborator, `approvedAt` sáº½ Ä‘Æ°á»£c set null vÃ  status = 0
9. Khi cá»™ng/trá»« Ä‘iá»ƒm, Ä‘iá»ƒm khÃ´ng thá»ƒ Ã¢m (tá»‘i thiá»ƒu = 0)
10. Báº£ng xáº¿p háº¡ng Ä‘Æ°á»£c sáº¯p xáº¿p theo Ä‘iá»ƒm tÃ­ch lÅ©y giáº£m dáº§n
11. KhÃ´ng thá»ƒ xÃ³a rank level náº¿u cÃ³ collaborator Ä‘ang sá»­ dá»¥ng

---

## ðŸ‘¥ Collaborator Group Management

### 1. Assign Collaborator to Group
**POST** `/admin/collaborators/:id/assign-group`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "groupId": 1
}
```

**Note:** Set `groupId` to `null` to unassign from group

**Response:**
```json
{
  "success": true,
  "message": "Collaborator assigned to group successfully",
  "data": {
    "collaborator": {
      "id": 1,
      "groupId": 1
    }
  }
}
```

### 2. Assign Multiple Collaborators to Group
**POST** `/admin/collaborators/assign-group-bulk`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "collaboratorIds": [1, 2, 3],
  "groupId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assigned 3 collaborator(s) to group successfully",
  "data": {
    "updatedCount": 3
  }
}
```

---

## ðŸ”” Collaborator Notification Management

### 1. Get List of Notifications
**GET** `/admin/collaborator-notifications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `collaboratorId` (optional): Filter by collaborator ID
- `jobId` (optional): Filter by job ID
- `isRead` (optional): Filter by read status (true/false)
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "collaboratorId": 1,
        "title": "Cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n á»©ng tuyá»ƒn",
        "content": "MÃ£ há»“ sÆ¡ CV-31-169-20250828193116 Ä‘Ã£ cÃ³ cáº­p nháº­t tráº¡ng thÃ¡i má»›i.",
        "jobId": null,
        "url": null,
        "isRead": false,
        "collaborator": {
          "id": 1,
          "name": "Tráº§n Quá»³nh Anh"
        },
        "job": null
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

### 2. Get Notification by ID
**GET** `/admin/collaborator-notifications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": 1,
      "title": "Cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n á»©ng tuyá»ƒn",
      "content": "...",
      "collaborator": {...},
      "job": {...}
    }
  }
}
```

### 3. Send Notification to Single Collaborator
**POST** `/admin/collaborator-notifications/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "collaboratorId": 1,
  "title": "ThÃ´ng bÃ¡o má»›i",
  "content": "Ná»™i dung thÃ´ng bÃ¡o",
  "jobId": 156,
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notification": {
      "id": 1,
      "title": "ThÃ´ng bÃ¡o má»›i",
      "content": "Ná»™i dung thÃ´ng bÃ¡o"
    }
  }
}
```

### 4. Send Notification to Multiple Collaborators
**POST** `/admin/collaborator-notifications/send-bulk`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "collaboratorIds": [1, 2, 3],
  "title": "ThÃ´ng bÃ¡o chung",
  "content": "Ná»™i dung thÃ´ng bÃ¡o cho nhiá»u CTV",
  "jobId": 156,
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to 3 collaborator(s) successfully",
  "data": {
    "notifications": [...],
    "count": 3
  }
}
```

### 5. Send Notification to Group
**POST** `/admin/collaborator-notifications/send-to-group`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "groupId": 1,
  "title": "ThÃ´ng bÃ¡o cho nhÃ³m",
  "content": "Ná»™i dung thÃ´ng bÃ¡o cho toÃ n bá»™ nhÃ³m",
  "jobId": 156,
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to 10 collaborator(s) in group successfully",
  "data": {
    "group": {
      "id": 1,
      "name": "CA Huyá»n"
    },
    "notifications": [...],
    "count": 10
    }
  }
}
```

### 6. Get Notification Read Status
**GET** `/admin/collaborator-notifications/:id/read-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": 1,
      "isRead": false,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "collaborator": {
        "id": 1,
        "name": "Tráº§n Quá»³nh Anh"
      }
    }
  }
}
```

### 7. Get Notification Statistics
**GET** `/admin/collaborator-notifications/statistics`

**Query Parameters:**
- `collaboratorId` (optional): Filter by collaborator ID
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 100,
      "read": 75,
      "unread": 25,
      "readRate": "75.00"
    }
  }
}
```

### 8. Delete Notification
**DELETE** `/admin/collaborator-notifications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### 9. Delete Multiple Notifications
**DELETE** `/admin/collaborator-notifications/bulk`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "notificationIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 3 notification(s) successfully",
  "data": {
    "deletedCount": 3
  }
}
```

---

## ðŸ“ Collaborator API Log Management

### 1. Get List of API Logs
**GET** `/admin/collaborator-api-logs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `collaboratorId` (optional): Filter by collaborator ID
- `endpoint` (optional): Filter by endpoint (partial match)
- `method` (optional): Filter by HTTP method (GET, POST, PUT, DELETE)
- `action` (optional): Filter by action (partial match)
- `statusCode` (optional): Filter by HTTP status code
- `ip` (optional): Filter by IP address (partial match)
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "apiLogs": [
      {
        "id": 1,
        "collaboratorId": 1,
        "endpoint": "/api/collaborator/jobs",
        "method": "GET",
        "action": "list_jobs",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "requestData": {},
        "responseData": {},
        "statusCode": 200,
        "responseTime": 150,
        "description": "List jobs",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "collaborator": {
          "id": 1,
          "name": "Tráº§n Quá»³nh Anh",
          "code": "CN202506112226452"
        }
      }
    ],
    "pagination": {
      "total": 1000,
      "page": 1,
      "limit": 10,
      "totalPages": 100
    }
  }
}
```

### 2. Get API Log by ID
**GET** `/admin/collaborator-api-logs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "apiLog": {
      "id": 1,
      "endpoint": "/api/collaborator/jobs",
      "method": "GET",
      "action": "list_jobs",
      "requestData": {...},
      "responseData": {...},
      "statusCode": 200,
      "responseTime": 150
    }
  }
}
```

### 3. Get API Logs by Collaborator
**GET** `/admin/collaborators/:id/api-logs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `endpoint` (optional): Filter by endpoint
- `method` (optional): Filter by HTTP method
- `action` (optional): Filter by action
- `statusCode` (optional): Filter by status code
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "apiLogs": [...],
    "pagination": {...}
  }
}
```

### 4. Get API Logs Statistics
**GET** `/admin/collaborator-api-logs/statistics`

**Query Parameters:**
- `collaboratorId` (optional): Filter by collaborator ID
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total": 1000,
      "byMethod": [
        {
          "method": "GET",
          "count": 600
        },
        {
          "method": "POST",
          "count": 300
        }
      ],
      "byStatusCode": [
        {
          "statusCode": 200,
          "count": 950
        },
        {
          "statusCode": 400,
          "count": 30
        }
      ],
      "byAction": [
        {
          "action": "list_jobs",
          "count": 200
        },
        {
          "action": "apply_job",
          "count": 150
        }
      ],
      "avgResponseTime": "125.50"
    }
  }
}
```

---

## ðŸ“„ CV Management

### 1. Get List of CVs
**GET** `/admin/cvs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `collaboratorId` (optional): Filter by collaborator ID
- `status` (optional): Filter by status
- `receiveDate` (optional): Filter by receive date (YYYY-MM-DD)
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `search` (optional): Search by name, email, or CV code

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "id": 1,
        "code": "CV-20250115-ABC123",
        "title": "CV Nguyá»…n VÄƒn A",
        "fullName": "Nguyá»…n VÄƒn A",
        "email": "nguyenvana@example.com",
        "phone": "0901234567",
        "address": "HÃ  Ná»™i",
        "receiveDate": "2025-01-15",
        "path": "/uploads/cvs/CV-20250115-ABC123.pdf",
        "collaborator": {
          "id": 1,
          "name": "Tráº§n Quá»³nh Anh",
          "code": "CN202506112226452"
        },
        "createdAt": "2025-01-15T10:30:00.000Z"
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

### 2. Get CV by ID
**GET** `/admin/cvs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-20250115-ABC123",
      "title": "CV Nguyá»…n VÄƒn A",
      "fullName": "Nguyá»…n VÄƒn A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "address": "HÃ  Ná»™i",
      "receiveDate": "2025-01-15",
      "path": "/uploads/cvs/CV-20250115-ABC123.pdf",
      "description": "MÃ´ táº£ CV",
      "currentLocation": 1,
      "gender": 1,
      "collaborator": {...}
    }
  }
}
```

### 3. Create New CV
**POST** `/admin/cvs`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (Form Data):**
- `collaboratorId` (required): Collaborator ID
- `fullName` (required): Full name
- `title` (optional): CV title
- `email` (optional): Email
- `phone` (optional): Phone number
- `address` (optional): Address
- `receiveDate` (optional): Receive date (YYYY-MM-DD)
- `description` (optional): Description
- `currentLocation` (optional): Current location (0: Nháº­t Báº£n, 1: Viá»‡t Nam, 2: KhÃ¡c)
- `gender` (optional): Gender (1: Nam, 2: Ná»¯, 3: KhÃ¡c)
- `file` (optional): CV file (PDF, DOC, DOCX, max 10MB)

**Response:**
```json
{
  "success": true,
  "message": "CV created successfully",
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-20250115-ABC123",
      "fullName": "Nguyá»…n VÄƒn A"
    }
  }
}
```

### 4. Update CV
**PUT** `/admin/cvs/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (Form Data):**
- `title` (optional): CV title
- `fullName` (optional): Full name
- `email` (optional): Email
- `phone` (optional): Phone number
- `address` (optional): Address
- `receiveDate` (optional): Receive date
- `description` (optional): Description
- `collaboratorId` (optional): Change collaborator
- `file` (optional): New CV file (will replace old file)

**Response:**
```json
{
  "success": true,
  "message": "CV updated successfully",
  "data": {
    "cv": {
      "id": 1,
      "code": "CV-20250115-ABC123"
    }
  }
}
```

### 5. Delete CV
**DELETE** `/admin/cvs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete - CV will be marked as deleted but not removed from database

**Response:**
```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

### 6. Get CV Update History
**GET** `/admin/cvs/:id/updates`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** This endpoint requires CVUpdate model implementation

**Response:**
```json
{
  "success": true,
  "data": {
    "cvId": 1,
    "updates": []
  }
}
```

---

## ðŸ“ CV File Storage Management

### 1. Get List of CV Storages
**GET** `/admin/cv-storages`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `groupId` (optional): Filter by group ID
- `adminId` (optional): Filter by admin ID
- `search` (optional): Search by name, email, or code
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "cvStorages": [
      {
        "id": 1,
        "code": "CV-STORAGE-20250115-ABC123",
        "title": "CV Nguyá»…n VÄƒn A",
        "fullName": "Nguyá»…n VÄƒn A",
        "email": "nguyenvana@example.com",
        "path": "/uploads/cv-storages/CV-STORAGE-20250115-ABC123.pdf",
        "receiveDate": "2025-01-15",
        "group": {
          "id": 1,
          "name": "CA Huyá»n"
        },
        "admin": {
          "id": 1,
          "name": "Admin User"
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

### 2. Get List of CTV CV Storages
**GET** `/admin/cv-storages/ctv`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `collaboratorId` (optional): Filter by collaborator ID
- `status` (optional): Filter by status
- `search` (optional): Search by name, email, or code

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "ctvCvStorages": [
      {
        "id": 1,
        "code": "CTV-CV-001",
        "name": "Nguyá»…n VÄƒn A",
        "email": "nguyenvana@example.com",
        "curriculumVitae": "/uploads/ctv-cvs/CV-001.pdf",
        "otherDocuments": "/uploads/ctv-cvs/DOC-001.pdf",
        "collaborator": {
          "id": 1,
          "name": "Tráº§n Quá»³nh Anh"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 3. Upload CV File
**POST** `/admin/cv-storages/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (Form Data):**
- `file` (required): CV file (PDF, DOC, DOCX, max 10MB)
- `code` (optional): CV code (auto-generated if not provided)
- `title` (optional): CV title
- `fullName` (optional): Full name
- `email` (optional): Email
- `phone` (optional): Phone number
- `receiveDate` (optional): Receive date (YYYY-MM-DD)
- `groupId` (optional): Group ID
- `description` (optional): Description
- `address` (optional): Address
- Other CV fields...

**Response:**
```json
{
  "success": true,
  "message": "CV file uploaded successfully",
  "data": {
    "cvStorage": {
      "id": 1,
      "code": "CV-STORAGE-20250115-ABC123",
      "path": "/uploads/cv-storages/CV-STORAGE-20250115-ABC123.pdf"
    }
  }
}
```

### 4. Download CV File
**GET** `/admin/cv-storages/:id/download`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:** File download

### 5. Download CTV CV File
**GET** `/admin/cv-storages/ctv/:id/download`

**Query Parameters:**
- `type` (optional): File type - `cv` (default) or `documents`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:** File download

### 6. Delete CV File
**DELETE** `/admin/cv-storages/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete - File and record will be marked as deleted

**Response:**
```json
{
  "success": true,
  "message": "CV file deleted successfully"
}
```

### 7. Delete CTV CV File
**DELETE** `/admin/cv-storages/ctv/:id`

**Query Parameters:**
- `type` (optional): File type to delete - `cv`, `documents`, or `all` (default: all)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "CTV CV storage deleted successfully"
}
```

---

## ðŸ’¼ Job Management

### 1. Get List of Jobs
**GET** `/admin/jobs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: Draft, 1: Published, 2: Closed, 3: Expired)
- `jobCategoryId` (optional): Filter by job category ID
- `companyId` (optional): Filter by company ID
- `isHot` (optional): Filter by hot status (true/false)
- `isPinned` (optional): Filter by pinned status (true/false)
- `search` (optional): Search by title or job code
- `sortBy` (optional): Sort field (created_at, views_count, title, applications) (default: created_at)
- `sortOrder` (optional): Sort order (ASC/DESC) (default: DESC)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 156,
        "jobCode": "JOB-20250115-ABC123",
        "title": "Ká»¹ sÆ° IT - Äa dáº¡ng vá»‹ trÃ­",
        "status": 1,
        "isHot": true,
        "isPinned": false,
        "viewsCount": 100,
        "deadline": "2025-12-31",
        "category": {
          "id": 1,
          "name": "IT"
        },
        "company": {
          "id": 1,
          "name": "Company Name"
        },
        "statistics": {
          "totalApplications": 50,
          "nyushaCount": 10,
          "paidCount": 5
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

### 2. Get Job by ID
**GET** `/admin/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": 156,
      "jobCode": "JOB-20250115-ABC123",
      "title": "Ká»¹ sÆ° IT",
      "description": "...",
      "requirements": "...",
      "workLocation": "Tokyo",
      "estimatedSalary": "400-600ä¸‡å††",
      "referralAmount": 50000,
      "jdFile": "/uploads/jobs/JOB-20250115-ABC123_JD.pdf",
      "jdFileJp": "/uploads/jobs/JOB-20250115-ABC123_JD_JP.pdf",
      "requiredCvForm": "/uploads/jobs/JOB-20250115-ABC123_CV_FORM.pdf",
      "category": {...},
      "company": {...},
      "jobSetting": {...},
      "jobSettingProfits": [...],
      "statistics": {
        "totalApplications": 50,
        "nyushaCount": 10,
        "paidCount": 5
      }
    }
  }
}
```

### 3. Create New Job
**POST** `/admin/jobs`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (Form Data):**
- `jobCategoryId` (required): Job category ID
- `title` (required): Job title
- `companyName` (required): Company name
- `companyId` (optional): Company ID (if company exists)
- `description` (optional): Job description
- `requirements` (optional): Requirements
- `instruction` (optional): Instructions
- `workLocation` (optional): Work location
- `estimatedSalary` (optional): Estimated salary
- `referralAmount` (optional): Referral amount
- `deadline` (optional): Deadline (YYYY-MM-DD)
- `status` (optional): Status (0: Draft, 1: Published) (default: 0)
- `isHot` (optional): Hot status (default: false)
- `isPinned` (optional): Pinned status (default: false)
- `jdFile` (optional): JD file (PDF, DOC, DOCX)
- `jdFileJp` (optional): JD file Japanese (PDF, DOC, DOCX)
- `cvForm` (optional): Required CV form (PDF, DOC, DOCX)
- `japaneseLevel` (optional): Japanese level (1-6)
- `experienceYears` (optional): Experience years (1-4)
- `specialization` (optional): Specialization (1-5)
- `qualification` (optional): Qualification (1-4)
- `japaneseLevelRequired` (optional): Japanese level required (true/false)
- `experienceYearsRequired` (optional): Experience years required (true/false)
- `specializationRequired` (optional): Specialization required (true/false)
- `qualificationRequired` (optional): Qualification required (true/false)
- `profits` (optional): JSON array of profit settings

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job": {
      "id": 156,
      "jobCode": "JOB-20250115-ABC123",
      "title": "Ká»¹ sÆ° IT"
    }
  }
}
```

### 4. Update Job
**PUT** `/admin/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (Form Data):**
- All fields from create job (all optional)
- `jdFile` (optional): New JD file (replaces old)
- `jdFileJp` (optional): New JD file Japanese (replaces old)
- `cvForm` (optional): New CV form (replaces old)

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "job": {...}
  }
}
```

### 5. Publish Job
**POST** `/admin/jobs/:id/publish`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Only draft jobs (status = 0) can be published

**Response:**
```json
{
  "success": true,
  "message": "Job published successfully",
  "data": {
    "job": {
      "id": 156,
      "status": 1
    }
  }
}
```

### 6. Close Job
**POST** `/admin/jobs/:id/close`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Job closed successfully",
  "data": {
    "job": {
      "id": 156,
      "status": 2
    }
  }
}
```

### 7. Extend Job Deadline
**POST** `/admin/jobs/:id/extend`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "deadline": "2025-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job deadline extended successfully",
  "data": {
    "job": {
      "id": 156,
      "deadline": "2025-12-31"
    }
  }
}
```

### 8. Toggle Hot Status
**PATCH** `/admin/jobs/:id/toggle-hot`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Job marked as hot successfully",
  "data": {
    "job": {
      "id": 156,
      "isHot": true
    }
  }
}
```

### 9. Toggle Pinned Status
**PATCH** `/admin/jobs/:id/toggle-pin`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Job pinned successfully",
  "data": {
    "job": {
      "id": 156,
      "isPinned": true
    }
  }
}
```

### 10. Delete Job
**DELETE** `/admin/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete - Job will be marked as deleted but not removed from database

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## ðŸ“‚ Job Category Management

### 1. Get List of Job Categories (Tree Structure)
**GET** `/admin/job-categories`

**Query Parameters:**
- `parentId` (optional): Filter by parent ID (null for root categories)
- `status` (optional): Filter by status (0: inactive, 1: active)
- `includeJobs` (optional): Include jobs count (true/false)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "IT",
        "slug": "it",
        "description": "IT jobs",
        "parentId": null,
        "order": 1,
        "status": 1,
        "parent": null,
        "children": [
          {
            "id": 2,
            "name": "Software Engineer",
            "slug": "software-engineer",
            "parentId": 1,
            "order": 1
          }
        ],
        "jobsCount": 50
      }
    ]
  }
}
```

### 2. Get Job Category by ID
**GET** `/admin/job-categories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "IT",
      "slug": "it",
      "parent": {...},
      "children": [...],
      "jobsCount": 50
    }
  }
}
```

### 3. Create New Job Category
**POST** `/admin/job-categories`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "IT",
  "slug": "it",
  "description": "IT jobs",
  "parentId": null,
  "order": 1,
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job category created successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "IT",
      "slug": "it"
    }
  }
}
```

### 4. Update Job Category
**PUT** `/admin/job-categories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated IT",
  "slug": "updated-it",
  "description": "Updated description",
  "parentId": null,
  "order": 2,
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job category updated successfully",
  "data": {
    "category": {...}
  }
}
```

### 5. Delete Job Category
**DELETE** `/admin/job-categories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Cannot delete if category has children or jobs

**Response:**
```json
{
  "success": true,
  "message": "Job category deleted successfully"
}
```

### 6. Sort Job Categories
**POST** `/admin/job-categories/sort`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "categories": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job categories sorted successfully"
}
```

---

## âš™ï¸ Job Setting Management

### 1. Get Job Setting
**GET** `/admin/jobs/:jobId/settings`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobSetting": {
      "id": 1,
      "jobId": 156,
      "japaneseLevel": 2,
      "experienceYears": 3,
      "specialization": 1,
      "qualification": null,
      "japaneseLevelRequired": true,
      "experienceYearsRequired": true,
      "specializationRequired": false,
      "qualificationRequired": false,
      "status": 1,
      "job": {
        "id": 156,
        "jobCode": "JOB-20250115-ABC123",
        "title": "Ká»¹ sÆ° IT"
      }
    }
  }
}
```

### 2. Configure Job Setting
**PUT** `/admin/jobs/:jobId/settings`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "japaneseLevel": 2,
  "experienceYears": 3,
  "specialization": 1,
  "qualification": null,
  "japaneseLevelRequired": true,
  "experienceYearsRequired": true,
  "specializationRequired": false,
  "qualificationRequired": false,
  "status": 1
}
```

**Note:**
- `japaneseLevel`: 1.N1, 2.N2, 3.N3, 4.N4, 5.N5, 6.ãªãã¦ã‚‚ã„ã„
- `experienceYears`: 1.1å¹´, 2.2å¹´, 3.3å¹´ä»¥ä¸Š, 4.æœªçµŒé¨“
- `specialization`: 1.æ©Ÿæ¢°è¨­è¨ˆ, 2.é›»æ°—é›»å­, 3.IT, 4.å»ºç¯‰ãƒ»å»ºè¨­, 5.æ–‡ç³»
- `qualification`: 1.Báº±ng lÃ¡i xe, 2.Ká»¹ sÆ° kiáº¿n trÃºc cáº¥p 1, 3.Ká»¹ sÆ° kiáº¿n trÃºc cáº¥p 2, 4.chá»©ng chá»‰ IT

**Response:**
```json
{
  "success": true,
  "message": "Job setting configured successfully",
  "data": {
    "jobSetting": {
      "id": 1,
      "jobId": 156,
      "japaneseLevel": 2,
      "japaneseLevelRequired": true
    }
  }
}
```

---

## ðŸ’° Job Setting Profit Management

### 1. Get Job Setting Profits by Job ID
**GET** `/admin/jobs/:jobId/profits`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "profits": [
      {
        "id": 1,
        "jobId": 156,
        "type": 1,
        "settingType": 1,
        "settings": {
          "N1": 100000,
          "N2": 80000,
          "N3": 60000
        },
        "note": "PhÃ­ cá»‘ Ä‘á»‹nh theo JLPT level",
        "job": {
          "id": 156,
          "jobCode": "JOB-20250115-ABC123",
          "title": "Ká»¹ sÆ° IT"
        }
      }
    ],
    "job": {
      "id": 156,
      "jobCode": "JOB-20250115-ABC123",
      "title": "Ká»¹ sÆ° IT"
    }
  }
}
```

### 2. Get Job Setting Profit by ID
**GET** `/admin/job-setting-profits/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "profit": {
      "id": 1,
      "jobId": 156,
      "type": 1,
      "settingType": 1,
      "settings": {...},
      "note": "..."
    }
  }
}
```

### 3. Configure Job Setting Profits
**POST** `/admin/jobs/:jobId/profits`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "profits": [
    {
      "type": 1,
      "settingType": 1,
      "settings": {
        "N1": 100000,
        "N2": 80000,
        "N3": 60000
      },
      "note": "PhÃ­ cá»‘ Ä‘á»‹nh theo JLPT level"
    },
    {
      "type": 2,
      "settingType": 2,
      "settings": {
        "1å¹´": "5%",
        "2å¹´": "7%",
        "3å¹´ä»¥ä¸Š": "10%"
      },
      "note": "PhÃ­ % theo kinh nghiá»‡m"
    }
  ]
}
```

**Note:**
- `type`: 1 = PhÃ­ cá»‘ Ä‘á»‹nh, 2 = PhÃ­ %
- `settingType`: 1 = JLPT, 2 = Experience
- `settings`: JSON object vá»›i cÃ¡c giÃ¡ trá»‹ cÃ i Ä‘áº·t

**Response:**
```json
{
  "success": true,
  "message": "Configured 2 profit setting(s) successfully",
  "data": {
    "profits": [...]
  }
}
```

### 4. Create Job Setting Profit
**POST** `/admin/job-setting-profits`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "jobId": 156,
  "type": 1,
  "settingType": 1,
  "settings": {
    "N1": 100000,
    "N2": 80000
  },
  "note": "PhÃ­ cá»‘ Ä‘á»‹nh"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job setting profit created successfully",
  "data": {
    "profit": {
      "id": 1,
      "jobId": 156,
      "type": 1
    }
  }
}
```

### 5. Update Job Setting Profit
**PUT** `/admin/job-setting-profits/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "type": 2,
  "settings": {
    "1å¹´": "5%",
    "2å¹´": "7%"
  },
  "note": "Updated note"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job setting profit updated successfully",
  "data": {
    "profit": {...}
  }
}
```

### 6. Delete Job Setting Profit
**DELETE** `/admin/job-setting-profits/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Job setting profit deleted successfully"
}
```

---

## ðŸ“‹ Job Pickup Management

### 1. Get List of Job Pickups
**GET** `/admin/job-pickups`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: inactive, 1: active)
- `search` (optional): Search by name

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "pickups": [
      {
        "id": 1,
        "name": "Viá»‡c lÃ m hot thÃ¡ng 1",
        "jobIds": [156, 157, 158],
        "description": "Danh sÃ¡ch viá»‡c lÃ m hot",
        "status": 1,
        "jobs": [
          {
            "id": 156,
            "jobCode": "JOB-20250115-ABC123",
            "title": "Ká»¹ sÆ° IT",
            "status": 1,
            "isHot": true
          }
        ],
        "jobsCount": 3
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

### 2. Get Job Pickup by ID
**GET** `/admin/job-pickups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "pickup": {
      "id": 1,
      "name": "Viá»‡c lÃ m hot thÃ¡ng 1",
      "jobIds": [156, 157, 158],
      "jobs": [
        {
          "id": 156,
          "jobCode": "JOB-20250115-ABC123",
          "title": "Ká»¹ sÆ° IT",
          "category": {...},
          "company": {...}
        }
      ],
      "jobsCount": 3
    }
  }
}
```

### 3. Create New Job Pickup
**POST** `/admin/job-pickups`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Viá»‡c lÃ m hot thÃ¡ng 1",
  "jobIds": [156, 157, 158],
  "description": "Danh sÃ¡ch viá»‡c lÃ m hot",
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job pickup created successfully",
  "data": {
    "pickup": {
      "id": 1,
      "name": "Viá»‡c lÃ m hot thÃ¡ng 1",
      "jobIds": [156, 157, 158]
    }
  }
}
```

### 4. Update Job Pickup
**PUT** `/admin/job-pickups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated name",
  "jobIds": [156, 157, 158, 159],
  "description": "Updated description",
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job pickup updated successfully",
  "data": {
    "pickup": {...}
  }
}
```

### 5. Delete Job Pickup
**DELETE** `/admin/job-pickups/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete

**Response:**
```json
{
  "success": true,
  "message": "Job pickup deleted successfully"
}
```

---

## ðŸ  Home Setting Job Management

### 1. Get List of Home Setting Jobs
**GET** `/admin/home-setting-jobs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: inactive, 1: active)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "postId": 156,
        "title": "Ká»¹ sÆ° IT",
        "color": "#FF5733",
        "order": 1,
        "thumbnail": "/uploads/thumbnails/job-156.jpg",
        "description": "MÃ´ táº£ viá»‡c lÃ m",
        "requirement": "YÃªu cáº§u",
        "salary": 20000000,
        "salaryUnit": "VND",
        "status": 1,
        "popup": "Ná»™i dung popup",
        "job": {
          "id": 156,
          "jobCode": "JOB-20250115-ABC123",
          "title": "Ká»¹ sÆ° IT",
          "status": 1,
          "isHot": true
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

### 2. Get Home Setting Job by ID
**GET** `/admin/home-setting-jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "homeJob": {
      "id": 1,
      "postId": 156,
      "title": "Ká»¹ sÆ° IT",
      "order": 1,
      "job": {...}
    }
  }
}
```

### 3. Configure Home Setting Jobs (Bulk)
**POST** `/admin/home-setting-jobs/configure`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "jobs": [
    {
      "postId": 156,
      "title": "Ká»¹ sÆ° IT",
      "color": "#FF5733",
      "order": 1,
      "thumbnail": "/uploads/thumbnails/job-156.jpg",
      "description": "MÃ´ táº£ viá»‡c lÃ m",
      "requirement": "YÃªu cáº§u",
      "salary": 20000000,
      "salaryUnit": "VND",
      "status": 1,
      "popup": "Ná»™i dung popup"
    },
    {
      "postId": 157,
      "title": "Ká»¹ sÆ° CÆ¡ khÃ­",
      "order": 2,
      "status": 1
    }
  ]
}
```

**Note:**
- Náº¿u khÃ´ng cÃ³ `postId`, cÃ³ thá»ƒ táº¡o viá»‡c lÃ m tÃ¹y chá»‰nh khÃ´ng liÃªn káº¿t vá»›i job thá»±c táº¿
- `order` sáº½ Ä‘Æ°á»£c tá»± Ä‘á»™ng gÃ¡n theo index náº¿u khÃ´ng Ä‘Æ°á»£c cung cáº¥p
- Táº¥t cáº£ home setting jobs cÅ© sáº½ bá»‹ xÃ³a vÃ  thay tháº¿ báº±ng danh sÃ¡ch má»›i

**Response:**
```json
{
  "success": true,
  "message": "Configured 2 home setting job(s) successfully",
  "data": {
    "jobs": [...]
  }
}
```

### 4. Create Home Setting Job
**POST** `/admin/home-setting-jobs`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "postId": 156,
  "title": "Ká»¹ sÆ° IT",
  "color": "#FF5733",
  "order": 1,
  "thumbnail": "/uploads/thumbnails/job-156.jpg",
  "description": "MÃ´ táº£ viá»‡c lÃ m",
  "requirement": "YÃªu cáº§u",
  "salary": 20000000,
  "salaryUnit": "VND",
  "status": 1,
  "popup": "Ná»™i dung popup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home setting job created successfully",
  "data": {
    "homeJob": {
      "id": 1,
      "postId": 156,
      "title": "Ká»¹ sÆ° IT",
      "order": 1
    }
  }
}
```

### 5. Update Home Setting Job
**PUT** `/admin/home-setting-jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "title": "Updated title",
  "color": "#33FF57",
  "order": 2,
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home setting job updated successfully",
  "data": {
    "homeJob": {...}
  }
}
```

### 6. Sort Home Setting Jobs
**PUT** `/admin/home-setting-jobs/sort`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "jobIds": [3, 1, 2, 5, 4]
}
```

**Note:**
- Thá»© tá»± trong máº£ng `jobIds` sáº½ quyáº¿t Ä‘á»‹nh thá»© tá»± hiá»ƒn thá»‹
- Job Ä‘áº§u tiÃªn trong máº£ng sáº½ cÃ³ `order = 1`, tiáº¿p theo lÃ  `order = 2`, ...

**Response:**
```json
{
  "success": true,
  "message": "Home setting jobs sorted successfully"
}
```

### 7. Delete Home Setting Job
**DELETE** `/admin/home-setting-jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Home setting job deleted successfully"
}
```

---

## ðŸ“ Job Application Management

### 1. Get List of Job Applications
**GET** `/admin/job-applications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `jobId` (optional): Filter by job ID
- `collaboratorId` (optional): Filter by collaborator ID
- `status` (optional): Filter by status (1-17)
- `appliedAt` (optional): Filter by applied date (YYYY-MM-DD)
- `interviewDate` (optional): Filter by interview date (YYYY-MM-DD)
- `nyushaDate` (optional): Filter by nyusha date (YYYY-MM-DD)
- `search` (optional): Search by name, email, or phone
- `sortBy` (optional): Sort field (applied_at, status) (default: applied_at)
- `sortOrder` (optional): Sort order (ASC, DESC) (default: DESC)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": 1,
        "jobId": 156,
        "collaboratorId": 10,
        "name": "Nguyá»…n VÄƒn A",
        "email": "nguyenvana@example.com",
        "phone": "0901234567",
        "status": 1,
        "appliedAt": "2025-01-15T10:00:00.000Z",
        "job": {
          "id": 156,
          "jobCode": "JOB-20250115-ABC123",
          "title": "Ká»¹ sÆ° IT"
        },
        "collaborator": {
          "id": 10,
          "code": "CTV001",
          "name": "Cá»™ng tÃ¡c viÃªn 1"
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

### 2. Get Job Application by ID
**GET** `/admin/job-applications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "jobId": 156,
      "collaboratorId": 10,
      "cvId": 5,
      "name": "Nguyá»…n VÄƒn A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "birthDate": "1990-01-01",
      "ages": "34",
      "gender": 1,
      "status": 1,
      "appliedAt": "2025-01-15T10:00:00.000Z",
      "interviewDate": null,
      "nyushaDate": null,
      "job": {
        "id": 156,
        "jobCode": "JOB-20250115-ABC123",
        "title": "Ká»¹ sÆ° IT",
        "company": {...},
        "category": {...}
      },
      "collaborator": {...},
      "cv": {...}
    },
    "statusHistory": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "statusBefore": null,
        "statusAfter": "1",
        "createdDate": "2025-01-15",
        "creator": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
      }
    ]
  }
}
```

### 3. Create New Job Application
**POST** `/admin/job-applications`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `jobId` (required): Job ID
- `collaboratorId` (optional): Collaborator ID
- `cvId` (optional): CV ID
- `name` (required): Applicant name
- `birthDate` (required): Birth date (YYYY-MM-DD)
- `gender` (required): 1 = Male, 2 = Female
- `email`, `phone`, `furigana`, `addressCurrent`, `addressOrigin`, etc.
- `curriculumVitae` (file): CV file
- `otherDocuments` (file): Other documents
- `avatar` (file): Avatar image
- `learnedTools` (JSON string): Tools learned
- `educationDetails` (JSON string): Education details
- `workHistoryDetails` (JSON string): Work history details
- ... (all other fields from schema)

**Response:**
```json
{
  "success": true,
  "message": "Job application created successfully",
  "data": {
    "application": {
      "id": 1,
      "jobId": 156,
      "name": "Nguyá»…n VÄƒn A",
      "status": 1
    }
  }
}
```

### 4. Update Job Application
**PUT** `/admin/job-applications/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- All fields can be updated
- Files: `curriculumVitae`, `otherDocuments`, `avatar`

**Response:**
```json
{
  "success": true,
  "message": "Job application updated successfully",
  "data": {
    "application": {...}
  }
}
```

### 5. Change Job Application Status
**PUT** `/admin/job-applications/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "status": 8,
  "rejectNote": "LÃ½ do tá»« chá»‘i (náº¿u cÃ³)"
}
```

**Status Values:**
1. Admin Ä‘ang xá»­ lÃ½ há»“ sÆ¡
2. Äang tiáº¿n cá»­
3. Äang xáº¿p lá»‹ch phá»ng váº¥n
4. Äang phá»ng váº¥n
5. Äang Ä‘á»£i naitei
6. Äang thÆ°Æ¡ng lÆ°á»£ng naitei
7. Äang Ä‘á»£i nyusha
8. **ÄÃ£ nyusha** (quan trá»ng - báº¯t Ä‘áº§u tÃ­nh phÃ­)
9. Äang chá» thanh toÃ¡n vá»›i cÃ´ng ty
10. Gá»­i yÃªu cáº§u thanh toÃ¡n
11. **ÄÃ£ thanh toÃ¡n** (hoÃ n thÃ nh)
12. Há»“ sÆ¡ khÃ´ng há»£p lá»‡
13. Há»“ sÆ¡ bá»‹ trÃ¹ng
14. Há»“ sÆ¡ khÃ´ng Ä‘áº¡t
15. Káº¿t quáº£ trÆ°á»£t
16. Há»§y giá»¯a chá»«ng
17. KhÃ´ng shodaku

**Note:**
- Khi chuyá»ƒn sang tráº¡ng thÃ¡i 3 hoáº·c 4, `interviewDate` sáº½ Ä‘Æ°á»£c tá»± Ä‘á»™ng cáº­p nháº­t náº¿u chÆ°a cÃ³
- Khi chuyá»ƒn sang tráº¡ng thÃ¡i 8 (ÄÃ£ nyusha), `nyushaDate` sáº½ Ä‘Æ°á»£c tá»± Ä‘á»™ng cáº­p nháº­t náº¿u chÆ°a cÃ³
- Khi chuyá»ƒn sang tráº¡ng thÃ¡i 10, `paymentRequestDate` sáº½ Ä‘Æ°á»£c tá»± Ä‘á»™ng cáº­p nháº­t
- Má»—i láº§n thay Ä‘á»•i tráº¡ng thÃ¡i sáº½ Ä‘Æ°á»£c ghi vÃ o `job_application_logs`

**Response:**
```json
{
  "success": true,
  "message": "Job application status updated successfully",
  "data": {
    "application": {
      "id": 1,
      "status": 8,
      "nyushaDate": "2025-02-01"
    }
  }
}
```

### 6. Delete Job Application
**DELETE** `/admin/job-applications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete

**Response:**
```json
{
  "success": true,
  "message": "Job application deleted successfully"
}
```

---

## ðŸ“‹ Job Application Log Management

### 1. Get List of Job Application Logs
**GET** `/admin/job-application-logs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `jobApplicationId` (optional): Filter by job application ID
- `createdBy` (optional): Filter by admin ID who created the log
- `createdDate` (optional): Filter by created date (YYYY-MM-DD)
- `statusBefore` (optional): Filter by status before
- `statusAfter` (optional): Filter by status after

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "createdDate": "2025-01-15",
        "statusBefore": "1",
        "statusAfter": "8",
        "createdBy": 1,
        "jobApplication": {
          "id": 1,
          "name": "Nguyá»…n VÄƒn A",
          "email": "nguyenvana@example.com",
          "status": 8
        },
        "creator": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
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

### 2. Get Job Application Logs by Application ID
**GET** `/admin/job-applications/:jobApplicationId/logs`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobApplication": {
      "id": 1,
      "name": "Nguyá»…n VÄƒn A",
      "email": "nguyenvana@example.com",
      "currentStatus": 8
    },
    "logs": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "createdDate": "2025-01-15",
        "statusBefore": null,
        "statusAfter": "1",
        "creator": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
      }
    ]
  }
}
```

### 3. Get Job Application Log by ID
**GET** `/admin/job-application-logs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "log": {
      "id": 1,
      "jobApplicationId": 1,
      "createdDate": "2025-01-15",
      "statusBefore": "1",
      "statusAfter": "8",
      "jobApplication": {...},
      "creator": {...}
    }
  }
}
```

---

## ðŸ“„ CV Update Management

### 1. Get List of CV Updates
**GET** `/admin/cv-updates`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `jobApplicationId` (optional): Filter by job application ID
- `cvId` (optional): Filter by CV ID
- `createdBy` (optional): Filter by admin ID who created the update

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "updates": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "path": "/uploads/cv-updates/CV_UPDATE_1_1234567890.pdf",
        "cvId": 5,
        "createdBy": 1,
        "updatedBy": 1,
        "jobApplication": {
          "id": 1,
          "name": "Nguyá»…n VÄƒn A",
          "email": "nguyenvana@example.com"
        },
        "cv": {
          "id": 5,
          "code": "CV-001",
          "fullName": "Nguyá»…n VÄƒn A"
        },
        "creator": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
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

### 2. Get CV Updates by Job Application ID
**GET** `/admin/job-applications/:jobApplicationId/cv-updates`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobApplication": {
      "id": 1,
      "name": "Nguyá»…n VÄƒn A",
      "email": "nguyenvana@example.com",
      "currentCV": "/uploads/job-applications/CV_1234567890.pdf"
    },
    "updates": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "path": "/uploads/cv-updates/CV_UPDATE_1_1234567890.pdf",
        "cvId": 5,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "cv": {...},
        "creator": {...}
      }
    ]
  }
}
```

### 3. Get CV Update by ID
**GET** `/admin/cv-updates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "update": {
      "id": 1,
      "jobApplicationId": 1,
      "path": "/uploads/cv-updates/CV_UPDATE_1_1234567890.pdf",
      "cvId": 5,
      "jobApplication": {...},
      "cv": {...},
      "creator": {...}
    }
  }
}
```

### 4. Create CV Update for Job Application
**POST** `/admin/job-applications/:jobApplicationId/cv-updates`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `cvFile` (file, required): CV file to upload
- `cvId` (optional): CV ID if linking to existing CV

**Response:**
```json
{
  "success": true,
  "message": "CV update created successfully",
  "data": {
    "cvUpdate": {
      "id": 1,
      "jobApplicationId": 1,
      "path": "/uploads/cv-updates/CV_UPDATE_1_1234567890.pdf",
      "cvId": 5
    }
  }
}
```

### 5. Delete CV Update
**DELETE** `/admin/cv-updates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete, file will also be deleted from server

**Response:**
```json
{
  "success": true,
  "message": "CV update deleted successfully"
}
```

---

## ðŸ¢ Company Management

### 1. Get List of Companies
**GET** `/admin/companies`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by company type
- `status` (optional): Filter by status (0: inactive, 1: active)
- `search` (optional): Search by name or company code

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": 1,
        "name": "VIETSCOUT",
        "companyCode": "VC",
        "type": "1",
        "logo": "/uploads/companies/LOGO_1234567890.png",
        "address": "123 Main Street",
        "phone": "0901234567",
        "email": "contact@vietscout.com",
        "website": "https://vietscout.com",
        "description": "Company description",
        "emailCc": ["cc1@example.com", "cc2@example.com"],
        "emailBcc": ["bcc1@example.com"],
        "status": 1
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

### 2. Get Company by ID
**GET** `/admin/companies/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": 1,
      "name": "VIETSCOUT",
      "companyCode": "VC",
      "type": "1",
      "logo": "/uploads/companies/LOGO_1234567890.png",
      "address": "123 Main Street",
      "phone": "0901234567",
      "email": "contact@vietscout.com",
      "website": "https://vietscout.com",
      "description": "Company description",
      "emailCc": ["cc1@example.com", "cc2@example.com"],
      "emailBcc": ["bcc1@example.com"],
      "status": 1,
      "jobs": [
        {
          "id": 156,
          "jobCode": "JOB-20250115-ABC123",
          "title": "Ká»¹ sÆ° IT",
          "status": 1,
          "isHot": true,
          "isPinned": false
        }
      ]
    }
  }
}
```

### 3. Create New Company
**POST** `/admin/companies`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `name` (required): Company name
- `companyCode` (optional): Company code (must be unique)
- `type` (optional): Company type
- `logo` (file, optional): Company logo (image file, max 5MB)
- `address` (optional): Company address
- `phone` (optional): Phone number
- `email` (optional): Email address
- `website` (optional): Website URL
- `description` (optional): Company description
- `emailCc` (optional): JSON string or array of CC emails
- `emailBcc` (optional): JSON string or array of BCC emails
- `status` (optional): Status (0: inactive, 1: active, default: 1)

**Example:**
```
name: VIETSCOUT
companyCode: VC
type: 1
logo: [file]
emailCc: ["cc1@example.com", "cc2@example.com"]
emailBcc: ["bcc1@example.com"]
```

**Response:**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "company": {
      "id": 1,
      "name": "VIETSCOUT",
      "companyCode": "VC",
      "logo": "/uploads/companies/LOGO_1234567890.png"
    }
  }
}
```

### 4. Update Company
**PUT** `/admin/companies/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- All fields can be updated
- `logo` (file, optional): New logo file (will replace old logo)

**Response:**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "company": {
      "id": 1,
      "name": "Updated Company Name",
      "logo": "/uploads/companies/LOGO_NEW_1234567890.png"
    }
  }
}
```

### 5. Delete Company
**DELETE** `/admin/companies/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** 
- Soft delete
- Cannot delete if company has active jobs

**Response:**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Error Response (if company has active jobs):**
```json
{
  "success": false,
  "message": "Cannot delete company. There are 5 active job(s) associated with this company."
}
```

---

## ðŸ’° Payment Request Management

### 1. Get List of Payment Requests
**GET** `/admin/payment-requests`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `collaboratorId` (optional): Filter by collaborator ID
- `status` (optional): Filter by status (0: Chá» duyá»‡t, 1: ÄÃ£ duyá»‡t, 2: Tá»« chá»‘i, 3: ÄÃ£ thanh toÃ¡n)
- `jobApplicationId` (optional): Filter by job application ID
- `startDate` (optional): Start date for date range filter (YYYY-MM-DD)
- `endDate` (optional): End date for date range filter (YYYY-MM-DD)
- `search` (optional): Search by request ID
- `sortBy` (optional): Sort field (created_at, amount) (default: created_at)
- `sortOrder` (optional): Sort order (ASC, DESC) (default: DESC)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentRequests": [
      {
        "id": 1,
        "collaboratorId": 10,
        "jobApplicationId": 5,
        "amount": "1000000.00",
        "status": 0,
        "approvedAt": null,
        "rejectedAt": null,
        "rejectedReason": null,
        "paidAt": null,
        "filePath": "/uploads/payment-requests/file_123.pdf",
        "note": "Ghi chÃº",
        "collaborator": {
          "id": 10,
          "code": "CTV001",
          "name": "Cá»™ng tÃ¡c viÃªn 1",
          "email": "ctv1@example.com"
        },
        "jobApplication": {
          "id": 5,
          "name": "Nguyá»…n VÄƒn A",
          "email": "nguyenvana@example.com",
          "job": {
            "id": 156,
            "jobCode": "JOB-20250115-ABC123",
            "title": "Ká»¹ sÆ° IT"
          }
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

### 2. Get Payment Request by ID
**GET** `/admin/payment-requests/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentRequest": {
      "id": 1,
      "collaboratorId": 10,
      "jobApplicationId": 5,
      "amount": "1000000.00",
      "status": 0,
      "approvedAt": null,
      "rejectedAt": null,
      "rejectedReason": null,
      "paidAt": null,
      "filePath": "/uploads/payment-requests/file_123.pdf",
      "note": "Ghi chÃº",
      "collaborator": {...},
      "jobApplication": {
        "job": {
          "company": {...}
        }
      }
    }
  }
}
```

### 3. Approve Payment Request
**PUT** `/admin/payment-requests/:id/approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "note": "Ghi chÃº khi duyá»‡t (optional)"
}
```

**Note:**
- Chá»‰ cÃ³ thá»ƒ duyá»‡t yÃªu cáº§u á»Ÿ tráº¡ng thÃ¡i "Chá» duyá»‡t" (status = 0)
- Tá»± Ä‘á»™ng cáº­p nháº­t `approvedAt` khi duyá»‡t

**Response:**
```json
{
  "success": true,
  "message": "Payment request approved successfully",
  "data": {
    "paymentRequest": {
      "id": 1,
      "status": 1,
      "approvedAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### 4. Reject Payment Request
**PUT** `/admin/payment-requests/:id/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "rejectedReason": "LÃ½ do tá»« chá»‘i (required)",
  "note": "Ghi chÃº (optional)"
}
```

**Note:**
- Chá»‰ cÃ³ thá»ƒ tá»« chá»‘i yÃªu cáº§u á»Ÿ tráº¡ng thÃ¡i "Chá» duyá»‡t" (status = 0)
- `rejectedReason` lÃ  báº¯t buá»™c
- Tá»± Ä‘á»™ng cáº­p nháº­t `rejectedAt` khi tá»« chá»‘i

**Response:**
```json
{
  "success": true,
  "message": "Payment request rejected successfully",
  "data": {
    "paymentRequest": {
      "id": 1,
      "status": 2,
      "rejectedAt": "2025-01-15T10:00:00.000Z",
      "rejectedReason": "LÃ½ do tá»« chá»‘i"
    }
  }
}
```

### 5. Confirm Payment
**PUT** `/admin/payment-requests/:id/confirm-payment`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "note": "Ghi chÃº khi thanh toÃ¡n (optional)"
}
```

**Note:**
- Chá»‰ cÃ³ thá»ƒ xÃ¡c nháº­n thanh toÃ¡n cho yÃªu cáº§u á»Ÿ tráº¡ng thÃ¡i "ÄÃ£ duyá»‡t" (status = 1)
- Tá»± Ä‘á»™ng cáº­p nháº­t `paidAt` khi xÃ¡c nháº­n thanh toÃ¡n

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "paymentRequest": {
      "id": 1,
      "status": 3,
      "paidAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### 6. Export Payment Report
**GET** `/admin/payment-requests/export`

**Query Parameters:**
- `collaboratorId` (optional): Filter by collaborator ID
- `status` (optional): Filter by status
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `format` (optional): Export format (json, csv) (default: json)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentRequests": [...],
    "statistics": {
      "total": 100,
      "totalAmount": 50000000.00,
      "byStatus": {
        "pending": 20,
        "approved": 30,
        "rejected": 10,
        "paid": 40
      },
      "byStatusAmount": {
        "pending": 10000000.00,
        "approved": 15000000.00,
        "rejected": 5000000.00,
        "paid": 20000000.00
      }
    }
  }
}
```

**Status Values:**
- `0`: Chá» duyá»‡t
- `1`: ÄÃ£ duyá»‡t
- `2`: Tá»« chá»‘i
- `3`: ÄÃ£ thanh toÃ¡n

---

## ðŸ“Š CTV Dashboard

### 1. Get Dashboard Overview
**GET** `/ctv/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCVs": 10,
      "totalApplications": 25,
      "nyushaCount": 5,
      "paidCount": 3,
      "totalPaidAmount": "15000000.00",
      "currentPoints": 500,
      "currentRank": {
        "id": 2,
        "name": "Silver",
        "description": "Silver level collaborator",
        "pointsRequired": 300,
        "percent": "5.00"
      },
      "nextRank": {
        "id": 3,
        "name": "Gold",
        "pointsRequired": 1000,
        "pointsNeeded": 500
      }
    },
    "applicationsByStatus": {
      "1": 5,
      "2": 3,
      "8": 5,
      "11": 3
    }
  }
}
```

**Overview Fields:**
- `totalCVs`: Tá»•ng sá»‘ CV cá»§a CTV
- `totalApplications`: Tá»•ng sá»‘ Ä‘Æ¡n á»©ng tuyá»ƒn
- `nyushaCount`: Sá»‘ Ä‘Æ¡n Ä‘Ã£ nyusha (status = 8)
- `paidCount`: Sá»‘ Ä‘Æ¡n Ä‘Ã£ thanh toÃ¡n (status = 11)
- `totalPaidAmount`: Tá»•ng sá»‘ tiá»n Ä‘Ã£ nháº­n (tá»« payment requests Ä‘Ã£ thanh toÃ¡n)
- `currentPoints`: Äiá»ƒm tÃ­ch lÅ©y hiá»‡n táº¡i
- `currentRank`: Cáº¥p báº­c hiá»‡n táº¡i (náº¿u cÃ³)
- `nextRank`: Cáº¥p báº­c tiáº¿p theo (náº¿u cÃ³) vá»›i sá»‘ Ä‘iá»ƒm cáº§n thiáº¿t

### 2. Get Chart Data (Time Series)
**GET** `/ctv/dashboard/chart`

**Query Parameters:**
- `type` (optional): Chart type - `day`, `week`, `month`, `year` (default: `month`)
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** If no date range is provided, defaults to last 12 months

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "month",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2025-01-01T00:00:00.000Z",
    "applications": [
      {
        "period": "2024-01",
        "count": 5
      },
      {
        "period": "2024-02",
        "count": 3
      }
    ],
    "payments": [
      {
        "period": "2024-01",
        "count": 2,
        "totalAmount": "10000000.00"
      },
      {
        "period": "2024-02",
        "count": 1,
        "totalAmount": "5000000.00"
      }
    ],
    "points": [
      {
        "period": "2024-01",
        "totalPoints": 100
      },
      {
        "period": "2024-02",
        "totalPoints": 50
      }
    ]
  }
}
```

**Chart Data:**
- `applications`: Sá»‘ lÆ°á»£ng Ä‘Æ¡n á»©ng tuyá»ƒn theo thá»i gian
- `payments`: Sá»‘ lÆ°á»£ng vÃ  tá»•ng sá»‘ tiá»n thanh toÃ¡n theo thá»i gian
- `points`: Tá»•ng Ä‘iá»ƒm tÃ­ch lÅ©y theo thá»i gian

### 3. Get Detailed Statistics
**GET** `/ctv/dashboard/statistics`

**Query Parameters:**
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2025-01-01"
    },
    "applications": {
      "byStatus": {
        "1": 5,
        "2": 3,
        "8": 5,
        "11": 3
      },
      "total": 16
    },
    "payments": {
      "byStatus": {
        "0": {
          "count": 2,
          "totalAmount": "2000000.00",
          "label": "Chá» duyá»‡t"
        },
        "1": {
          "count": 1,
          "totalAmount": "1000000.00",
          "label": "ÄÃ£ duyá»‡t"
        },
        "2": {
          "count": 0,
          "totalAmount": "0.00",
          "label": "Tá»« chá»‘i"
        },
        "3": {
          "count": 3,
          "totalAmount": "15000000.00",
          "label": "ÄÃ£ thanh toÃ¡n"
        }
      },
      "total": 6
    },
    "points": {
      "totalEarned": 500
    }
  }
}
```

**Statistics Include:**
- `applications`: Thá»‘ng kÃª Ä‘Æ¡n á»©ng tuyá»ƒn theo tráº¡ng thÃ¡i
- `payments`: Thá»‘ng kÃª yÃªu cáº§u thanh toÃ¡n theo tráº¡ng thÃ¡i (sá»‘ lÆ°á»£ng vÃ  tá»•ng sá»‘ tiá»n)
- `points`: Tá»•ng Ä‘iá»ƒm tÃ­ch lÅ©y trong khoáº£ng thá»i gian

---

## ðŸŽ¯ Campaign Management

### 1. Get List of Campaigns
**GET** `/admin/campaigns`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: inactive, 1: active, 2: ended)
- `startDate` (optional): Start date for date range filter (YYYY-MM-DD)
- `endDate` (optional): End date for date range filter (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "name": "Chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng Ä‘áº·c biá»‡t",
        "description": "MÃ´ táº£ chiáº¿n dá»‹ch",
        "startDate": "2025-01-01T00:00:00.000Z",
        "endDate": "2025-01-31T23:59:59.000Z",
        "maxCv": 100,
        "percent": 30,
        "status": 1,
        "jobIds": [156, 157, 158],
        "jobs": [
          {
            "id": 156,
            "jobCode": "JOB-20250115-ABC123",
            "title": "Ká»¹ sÆ° IT"
          }
        ],
        "jobsCount": 3,
        "applicationsCount": 10
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

### 2. Get Campaign by ID
**GET** `/admin/campaigns/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "name": "Chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng Ä‘áº·c biá»‡t",
      "description": "MÃ´ táº£ chiáº¿n dá»‹ch",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.000Z",
      "maxCv": 100,
      "percent": 30,
      "status": 1,
      "jobIds": [156, 157, 158],
      "jobs": [...],
      "jobsCount": 3,
      "applications": [...],
      "applicationsCount": 10
    }
  }
}
```

### 3. Create New Campaign
**POST** `/admin/campaigns`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng Ä‘áº·c biá»‡t",
  "description": "MÃ´ táº£ chiáº¿n dá»‹ch",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-31T23:59:59.000Z",
  "maxCv": 100,
  "percent": 30,
  "jobIds": [156, 157, 158],
  "status": 0
}
```

**Note:**
- `name`, `description`, `startDate`, `endDate` are required
- `endDate` must be after `startDate`
- `jobIds` can be JSON string or array
- `status`: 0 = inactive, 1 = active, 2 = ended

**Response:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "campaign": {
      "id": 1,
      "name": "Chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng Ä‘áº·c biá»‡t"
    }
  }
}
```

### 4. Update Campaign
**PUT** `/admin/campaigns/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated campaign name",
  "description": "Updated description",
  "percent": 35,
  "jobIds": [156, 157, 158, 159]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": {
    "campaign": {...}
  }
}
```

### 5. Toggle Campaign Status (Activate/Deactivate)
**PUT** `/admin/campaigns/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "status": 1
}
```

**Note:**
- `status`: 0 = inactive, 1 = active
- Cannot change status of ended campaign (status = 2)

**Response:**
```json
{
  "success": true,
  "message": "Campaign activated successfully",
  "data": {
    "campaign": {
      "id": 1,
      "status": 1
    }
  }
}
```

### 6. End Campaign
**PUT** `/admin/campaigns/:id/end`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Changes status to 2 (ended)

**Response:**
```json
{
  "success": true,
  "message": "Campaign ended successfully",
  "data": {
    "campaign": {
      "id": 1,
      "status": 2
    }
  }
}
```

### 7. Delete Campaign
**DELETE** `/admin/campaigns/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

### 8. Get Applications in Campaign
**GET** `/admin/campaigns/:id/applications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "name": "Chiáº¿n dá»‹ch tuyá»ƒn dá»¥ng Ä‘áº·c biá»‡t"
    },
    "applications": [
      {
        "id": 5,
        "name": "Nguyá»…n VÄƒn A",
        "collaborator": {...},
        "job": {...}
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

### 9. Assign Application to Campaign
**POST** `/admin/campaigns/:id/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "jobApplicationId": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application assigned to campaign successfully",
  "data": {
    "campaignApplication": {
      "id": 1,
      "campaignId": 1,
      "jobApplicationId": 5
    }
  }
}
```

### 10. Remove Application from Campaign
**DELETE** `/admin/campaigns/:id/applications/:jobApplicationId`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Application removed from campaign successfully"
}
```

**Status Values:**
- `0`: Inactive
- `1`: Active
- `2`: Ended

---

## ðŸ“§ Email Template Management

### 1. Get List of Email Templates
**GET** `/admin/email-templates`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by template type
- `isActive` (optional): Filter by status (true/false, 1/0)
- `search` (optional): Search by name or subject

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": 1,
        "name": "Template chÃ o má»«ng",
        "subject": "ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i JobShare",
        "content": "Xin chÃ o {{name}}, chÃ o má»«ng báº¡n Ä‘áº¿n vá»›i JobShare!",
        "type": 1,
        "isActive": true,
        "description": "Template email chÃ o má»«ng ngÆ°á»i dÃ¹ng má»›i",
        "createdBy": 1,
        "creator": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
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

### 2. Get Email Template by ID
**GET** `/admin/email-templates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": 1,
      "name": "Template chÃ o má»«ng",
      "subject": "ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i JobShare",
      "content": "Xin chÃ o {{name}}, chÃ o má»«ng báº¡n Ä‘áº¿n vá»›i JobShare!",
      "type": 1,
      "isActive": true,
      "description": "Template email chÃ o má»«ng ngÆ°á»i dÃ¹ng má»›i",
      "creator": {...}
    }
  }
}
```

### 3. Create New Email Template
**POST** `/admin/email-templates`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Template chÃ o má»«ng",
  "subject": "ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i JobShare",
  "content": "Xin chÃ o {{name}}, chÃ o má»«ng báº¡n Ä‘áº¿n vá»›i JobShare!\n\nBáº¡n cÃ³ thá»ƒ sá»­ dá»¥ng cÃ¡c biáº¿n Ä‘á»™ng nhÆ°:\n- {{name}}: TÃªn ngÆ°á»i dÃ¹ng\n- {{email}}: Email\n- {{jobCode}}: MÃ£ viá»‡c lÃ m",
  "type": 1,
  "isActive": true,
  "description": "Template email chÃ o má»«ng ngÆ°á»i dÃ¹ng má»›i"
}
```

**Note:**
- `name`, `subject`, `content` are required
- `type`: Loáº¡i template (sá»‘ nguyÃªn)
- `isActive`: true/false hoáº·c 1/0
- `content` cÃ³ thá»ƒ chá»©a biáº¿n Ä‘á»™ng dáº¡ng `{{variableName}}`

**Response:**
```json
{
  "success": true,
  "message": "Email template created successfully",
  "data": {
    "template": {
      "id": 1,
      "name": "Template chÃ o má»«ng"
    }
  }
}
```

### 4. Update Email Template
**PUT** `/admin/email-templates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Updated template name",
  "subject": "Updated subject",
  "content": "Updated content with {{variables}}",
  "type": 2,
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email template updated successfully",
  "data": {
    "template": {...}
  }
}
```

### 5. Toggle Email Template Status
**PUT** `/admin/email-templates/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Toggles between active and inactive

**Response:**
```json
{
  "success": true,
  "message": "Email template activated successfully",
  "data": {
    "template": {
      "id": 1,
      "isActive": true
    }
  }
}
```

### 6. Delete Email Template
**DELETE** `/admin/email-templates/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete

**Response:**
```json
{
  "success": true,
  "message": "Email template deleted successfully"
}
```

---

## ðŸ“¨ Email Company Management

### 1. Get List of Emails Sent to Companies
**GET** `/admin/email-companies`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `companyId` (optional): Filter by company ID
- `status` (optional): Filter by status (draft, sent)
- `startDate` (optional): Start date for date range filter (YYYY-MM-DD)
- `endDate` (optional): End date for date range filter (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": 1,
        "title": "ThÃ´ng bÃ¡o viá»‡c lÃ m má»›i",
        "subject": "CÃ³ viá»‡c lÃ m má»›i phÃ¹ há»£p vá»›i cÃ´ng ty báº¡n",
        "content": "Ná»™i dung email...",
        "recipients": [1, 2, 3],
        "recipientsDetail": {
          "companies": [
            {
              "companyId": 1,
              "name": "VIETSCOUT",
              "email": "contact@vietscout.com"
            }
          ],
          "cc": ["cc1@example.com"],
          "bcc": ["bcc1@example.com"]
        },
        "recipientType": "specific",
        "attachments": [
          {
            "path": "/uploads/email-attachments/file.pdf",
            "originalName": "document.pdf"
          }
        ],
        "status": "sent",
        "sentAt": "2025-01-15T10:00:00.000Z",
        "recipientsCount": 3,
        "fileAttachmentPath": "/uploads/email-attachments/file.pdf",
        "companies": [
          {
            "id": 1,
            "name": "VIETSCOUT",
            "email": "contact@vietscout.com"
          }
        ]
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

### 2. Get Email Company by ID
**GET** `/admin/email-companies/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "email": {
      "id": 1,
      "title": "ThÃ´ng bÃ¡o viá»‡c lÃ m má»›i",
      "subject": "CÃ³ viá»‡c lÃ m má»›i phÃ¹ há»£p vá»›i cÃ´ng ty báº¡n",
      "content": "Ná»™i dung email...",
      "recipients": [1, 2, 3],
      "recipientsDetail": {...},
      "status": "sent",
      "sentAt": "2025-01-15T10:00:00.000Z",
      "companies": [...]
    }
  }
}
```

### 3. Create New Email
**POST** `/admin/email-companies`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `title` (required): Email title
- `subject` (required): Email subject
- `content` (required): Email content
- `companyIds` (required): Array of company IDs or JSON string
- `emailTemplateId` (optional): Email template ID to use
- `recipientType` (optional): Recipient type (default: 'specific')
- `cc` (optional): CC emails (JSON array or string)
- `bcc` (optional): BCC emails (JSON array or string)
- `attachment` (file, optional): Attachment file

**Example:**
```
title: ThÃ´ng bÃ¡o viá»‡c lÃ m má»›i
subject: CÃ³ viá»‡c lÃ m má»›i phÃ¹ há»£p
content: Ná»™i dung email...
companyIds: [1, 2, 3]
emailTemplateId: 5
cc: ["cc1@example.com", "cc2@example.com"]
attachment: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Email created successfully",
  "data": {
    "email": {
      "id": 1,
      "title": "ThÃ´ng bÃ¡o viá»‡c lÃ m má»›i",
      "status": "draft"
    }
  }
}
```

### 4. Update Email (Only if Draft)
**PUT** `/admin/email-companies/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- All fields can be updated
- `attachment` (file, optional): New attachment file (will replace old one)

**Note:** Only draft emails can be updated

**Response:**
```json
{
  "success": true,
  "message": "Email updated successfully",
  "data": {
    "email": {...}
  }
}
```

### 5. Send Email
**POST** `/admin/email-companies/:id/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (optional):**
```json
{
  "companyIds": [1, 2, 3]
}
```

**Note:**
- If `companyIds` is provided, it will override existing recipients
- Email status will be changed to 'sent'
- `sentAt` will be automatically set

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully to 3 company(ies)",
  "data": {
    "email": {
      "id": 1,
      "status": "sent",
      "sentAt": "2025-01-15T10:00:00.000Z"
    },
    "companies": [
      {
        "id": 1,
        "name": "VIETSCOUT",
        "email": "contact@vietscout.com"
      }
    ]
  }
}
```

### 6. Send Email to Multiple Companies (Create and Send)
**POST** `/admin/email-companies/send-bulk`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `title` (required): Email title
- `subject` (required): Email subject
- `content` (required): Email content
- `companyIds` (required): Array of company IDs or JSON string
- `emailTemplateId` (optional): Email template ID
- `cc` (optional): CC emails
- `bcc` (optional): BCC emails
- `attachment` (file, optional): Attachment file

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully to 3 company(ies)",
  "data": {
    "email": {
      "id": 1,
      "status": "sent",
      "sentAt": "2025-01-15T10:00:00.000Z"
    },
    "companies": [...]
  }
}
```

### 7. Delete Email
**DELETE** `/admin/email-companies/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Hard delete (attachment file will also be deleted)

**Response:**
```json
{
  "success": true,
  "message": "Email deleted successfully"
}
```

**Status Values:**
- `draft`: Email chÆ°a gá»­i
- `sent`: Email Ä‘Ã£ gá»­i

---

## ðŸ“¬ Email Newsletter Management

### 1. Get List of Email Newsletters
**GET** `/admin/email-newsletters`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `groupId` (optional): Filter by group ID
- `status` (optional): Filter by status (1: draft, 2: scheduled, 3: sent)
- `type` (optional): Filter by type

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "newsletters": [
      {
        "id": 1,
        "subject": "ThÃ´ng bÃ¡o má»›i cho CTV",
        "content": "Ná»™i dung newsletter...",
        "status": 1,
        "sentAt": null,
        "scheduledAt": null,
        "recipients": [10, 11, 12],
        "recipientsCount": 3,
        "type": 1,
        "groupId": null,
        "fileAttachment": "/uploads/newsletter-attachments/file.pdf",
        "group": null,
        "creator": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        },
        "recipientsDetail": [
          {
            "id": 10,
            "code": "CTV001",
            "name": "Cá»™ng tÃ¡c viÃªn 1",
            "email": "ctv1@example.com"
          }
        ]
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

### 2. Get Email Newsletter by ID
**GET** `/admin/email-newsletters/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "newsletter": {
      "id": 1,
      "subject": "ThÃ´ng bÃ¡o má»›i cho CTV",
      "content": "Ná»™i dung newsletter...",
      "status": 1,
      "sentAt": null,
      "scheduledAt": null,
      "recipients": [10, 11, 12],
      "recipientsCount": 3,
      "recipientsDetail": [...],
      "group": {...},
      "creator": {...}
    }
  }
}
```

### 3. Create New Email Newsletter
**POST** `/admin/email-newsletters`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `subject` (required): Email subject
- `content` (required): Email content
- `collaboratorIds` (optional): Array of collaborator IDs or JSON string (required if groupId not provided)
- `groupId` (optional): Group ID (required if collaboratorIds not provided)
- `type` (optional): Newsletter type (default: 1)
- `scheduledAt` (optional): Scheduled send time (ISO datetime string)
- `notes` (optional): Notes
- `attachment` (file, optional): Attachment file

**Note:**
- Either `collaboratorIds` or `groupId` must be provided
- If `groupId` is provided, all collaborators in that group will be recipients
- If `scheduledAt` is provided and in the future, status will be set to 'scheduled' (2)
- Otherwise, status will be 'draft' (1)

**Response:**
```json
{
  "success": true,
  "message": "Email newsletter created successfully",
  "data": {
    "newsletter": {
      "id": 1,
      "subject": "ThÃ´ng bÃ¡o má»›i cho CTV",
      "status": 1
    }
  }
}
```

### 4. Update Email Newsletter
**PUT** `/admin/email-newsletters/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- All fields can be updated
- `attachment` (file, optional): New attachment file (will replace old one)

**Note:** Cannot update sent newsletter (status = 3)

**Response:**
```json
{
  "success": true,
  "message": "Email newsletter updated successfully",
  "data": {
    "newsletter": {...}
  }
}
```

### 5. Send Email Newsletter (Send Now)
**POST** `/admin/email-newsletters/:id/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:**
- Sends email immediately
- Status will be changed to 'sent' (3)
- `sentAt` will be automatically set
- `scheduledAt` will be cleared

**Response:**
```json
{
  "success": true,
  "message": "Email newsletter sent successfully to 3 collaborator(s)",
  "data": {
    "newsletter": {
      "id": 1,
      "status": 3,
      "sentAt": "2025-01-15T10:00:00.000Z"
    },
    "recipients": [
      {
        "id": 10,
        "code": "CTV001",
        "name": "Cá»™ng tÃ¡c viÃªn 1",
        "email": "ctv1@example.com"
      }
    ]
  }
}
```

### 6. Schedule Email Newsletter
**POST** `/admin/email-newsletters/:id/schedule`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "scheduledAt": "2025-01-20T10:00:00.000Z"
}
```

**Note:**
- `scheduledAt` must be in the future
- Status will be changed to 'scheduled' (2)
- Cannot schedule sent newsletter

**Response:**
```json
{
  "success": true,
  "message": "Email newsletter scheduled successfully",
  "data": {
    "newsletter": {
      "id": 1,
      "status": 2,
      "scheduledAt": "2025-01-20T10:00:00.000Z"
    }
  }
}
```

### 7. Delete Email Newsletter
**DELETE** `/admin/email-newsletters/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete (attachment file will also be deleted)

**Response:**
```json
{
  "success": true,
  "message": "Email newsletter deleted successfully"
}
```

**Status Values:**
- `1`: Draft
- `2`: Scheduled
- `3`: Sent

---

## âš™ï¸ Email Configuration Management

### 1. Admin Email Config Management

#### 1.1. Get List of Admin Email Configs
**GET** `/admin/admin-email-configs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `adminId` (optional): Filter by admin ID
- `status` (optional): Filter by status (0: inactive, 1: active)
- `isDefault` (optional): Filter by default config (true/false)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "configs": [
      {
        "id": 1,
        "adminId": 1,
        "name": "Email chÃ­nh",
        "email": "admin@example.com",
        "appPassword": "***",
        "isDefault": true,
        "status": 1,
        "description": "Email cáº¥u hÃ¬nh máº·c Ä‘á»‹nh",
        "admin": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### 1.2. Get Admin Email Config by ID
**GET** `/admin/admin-email-configs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "config": {
      "id": 1,
      "adminId": 1,
      "name": "Email chÃ­nh",
      "email": "admin@example.com",
      "appPassword": "actual_password_here",
      "isDefault": true,
      "status": 1
    }
  }
}
```

#### 1.3. Create Admin Email Config
**POST** `/admin/admin-email-configs`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Email chÃ­nh",
  "email": "admin@example.com",
  "appPassword": "your_app_password",
  "isDefault": true,
  "status": 1,
  "description": "Email cáº¥u hÃ¬nh máº·c Ä‘á»‹nh"
}
```

**Note:**
- `name`, `email`, `appPassword` are required
- If `isDefault` is true, other configs for this admin will be unset as default
- `adminId` is automatically set to current admin

**Response:**
```json
{
  "success": true,
  "message": "Admin email config created successfully",
  "data": {
    "config": {
      "id": 1,
      "name": "Email chÃ­nh",
      "appPassword": "***"
    }
  }
}
```

#### 1.4. Update Admin Email Config
**PUT** `/admin/admin-email-configs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Only owner or Super Admin can update

**Request Body:**
```json
{
  "name": "Updated name",
  "email": "updated@example.com",
  "appPassword": "new_password",
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin email config updated successfully",
  "data": {
    "config": {...}
  }
}
```

#### 1.5. Set Default Admin Email Config
**PUT** `/admin/admin-email-configs/:id/set-default`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Only owner or Super Admin can set default

**Response:**
```json
{
  "success": true,
  "message": "Admin email config set as default successfully",
  "data": {
    "config": {
      "id": 1,
      "isDefault": true
    }
  }
}
```

#### 1.6. Toggle Admin Email Config Status
**PUT** `/admin/admin-email-configs/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Only owner or Super Admin can toggle

**Response:**
```json
{
  "success": true,
  "message": "Admin email config activated successfully",
  "data": {
    "config": {
      "id": 1,
      "status": 1
    }
  }
}
```

#### 1.7. Delete Admin Email Config
**DELETE** `/admin/admin-email-configs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Only owner or Super Admin can delete

**Response:**
```json
{
  "success": true,
  "message": "Admin email config deleted successfully"
}
```

### 2. Mail Setting Management

#### 2.1. Get List of Mail Settings
**GET** `/admin/mail-settings`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Filter by type (1: CC, 2: BCC)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": [
      {
        "id": 1,
        "email": "cc@example.com",
        "type": 1,
        "note": "CC máº·c Ä‘á»‹nh"
      },
      {
        "id": 2,
        "email": "bcc@example.com",
        "type": 2,
        "note": "BCC máº·c Ä‘á»‹nh"
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

#### 2.2. Get Mail Setting by ID
**GET** `/admin/mail-settings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "setting": {
      "id": 1,
      "email": "cc@example.com",
      "type": 1,
      "note": "CC máº·c Ä‘á»‹nh"
    }
  }
}
```

#### 2.3. Configure Mail Settings (Bulk)
**PUT** `/admin/mail-settings/configure`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "settings": [
    {
      "email": "cc1@example.com",
      "type": 1,
      "note": "CC máº·c Ä‘á»‹nh 1"
    },
    {
      "email": "cc2@example.com",
      "type": 1,
      "note": "CC máº·c Ä‘á»‹nh 2"
    },
    {
      "email": "bcc@example.com",
      "type": 2,
      "note": "BCC máº·c Ä‘á»‹nh"
    }
  ]
}
```

**Note:**
- This will delete all existing settings and create new ones
- `type`: 1 = CC, 2 = BCC

**Response:**
```json
{
  "success": true,
  "message": "Configured 3 mail setting(s) successfully",
  "data": {
    "settings": [...]
  }
}
```

#### 2.4. Create Mail Setting
**POST** `/admin/mail-settings`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "email": "cc@example.com",
  "type": 1,
  "note": "CC máº·c Ä‘á»‹nh"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mail setting created successfully",
  "data": {
    "setting": {
      "id": 1,
      "email": "cc@example.com",
      "type": 1
    }
  }
}
```

#### 2.5. Update Mail Setting
**PUT** `/admin/mail-settings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "email": "updated@example.com",
  "type": 2,
  "note": "Updated note"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mail setting updated successfully",
  "data": {
    "setting": {...}
  }
}
```

#### 2.6. Delete Mail Setting
**DELETE** `/admin/mail-settings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Mail setting deleted successfully"
}
```

**Type Values:**
- `1`: CC
- `2`: BCC

---

## ðŸ“° Post Management

### 1. Get List of Posts
**GET** `/admin/posts`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (1: draft, 2: published, 3: unpublished)
- `authorId` (optional): Filter by author ID
- `categoryId` (optional): Filter by category ID
- `search` (optional): Search by title

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "TiÃªu Ä‘á» bÃ i viáº¿t",
        "content": "Ná»™i dung bÃ i viáº¿t...",
        "slug": "tieu-de-bai-viet",
        "image": "/uploads/posts/POST_1234567890.jpg",
        "status": 2,
        "type": 1,
        "categoryId": "1",
        "authorId": 1,
        "viewCount": 100,
        "likeCount": 10,
        "tag": "news",
        "metaTitle": "Meta title",
        "metaDescription": "Meta description",
        "publishedAt": "2025-01-15T10:00:00.000Z",
        "author": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
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

### 2. Get Post by ID
**GET** `/admin/posts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": 1,
      "title": "TiÃªu Ä‘á» bÃ i viáº¿t",
      "content": "Ná»™i dung bÃ i viáº¿t...",
      "slug": "tieu-de-bai-viet",
      "image": "/uploads/posts/POST_1234567890.jpg",
      "status": 2,
      "author": {...}
    }
  }
}
```

### 3. Create New Post
**POST** `/admin/posts`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `title` (required): Post title
- `content` (required): Post content
- `slug` (optional): URL slug (auto-generated from title if not provided)
- `categoryId` (optional): Category ID
- `type` (optional): Post type (default: 1)
- `status` (optional): Status (1: draft, 2: published, 3: unpublished, default: 1)
- `tag` (optional): Tag
- `metaTitle` (optional): Meta title (SEO)
- `metaDescription` (optional): Meta description (SEO)
- `metaKeywords` (optional): Meta keywords (SEO)
- `metaImage` (optional): Meta image URL (SEO)
- `metaUrl` (optional): Meta URL (SEO)
- `publishedAt` (optional): Published date (ISO datetime string)
- `image` (file, optional): Thumbnail image

**Note:**
- Slug will be auto-generated from title if not provided
- If status is 'published' (2) and publishedAt is not provided, it will be set to current time
- `authorId` is automatically set to current admin

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": 1,
      "title": "TiÃªu Ä‘á» bÃ i viáº¿t",
      "slug": "tieu-de-bai-viet"
    }
  }
}
```

### 4. Update Post
**PUT** `/admin/posts/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- All fields can be updated
- `image` (file, optional): New thumbnail image (will replace old one)

**Response:**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "post": {...}
  }
}
```

### 5. Publish/Unpublish Post
**PUT** `/admin/posts/:id/publish`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "publish": true
}
```

**Note:**
- `publish`: true = publish (status â†’ 2), false = unpublish (status â†’ 3)
- If publishing for the first time, `publishedAt` will be set to current time
- `publishedAt` is kept when unpublishing (for history)

**Response:**
```json
{
  "success": true,
  "message": "Post published successfully",
  "data": {
    "post": {
      "id": 1,
      "status": 2,
      "publishedAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### 6. Delete Post
**DELETE** `/admin/posts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Soft delete (thumbnail image will also be deleted)

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Status Values:**
- `1`: Draft
- `2`: Published
- `3`: Unpublished

---

## â“ FAQ Management

### 1. Get List of FAQs
**GET** `/admin/faqs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: inactive, 1: active)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": 1,
        "question": "LÃ m tháº¿ nÃ o Ä‘á»ƒ trá»Ÿ thÃ nh cá»™ng tÃ¡c viÃªn?",
        "answer": "Äá»ƒ trá»Ÿ thÃ nh cá»™ng tÃ¡c viÃªn, báº¡n cáº§n Ä‘Äƒng kÃ½ tÃ i khoáº£n...",
        "order": 1,
        "status": 1
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

**Note:** FAQs are sorted by `order` ASC, then by `created_at` ASC.

### 2. Get FAQ by ID
**GET** `/admin/faqs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "faq": {
      "id": 1,
      "question": "LÃ m tháº¿ nÃ o Ä‘á»ƒ trá»Ÿ thÃ nh cá»™ng tÃ¡c viÃªn?",
      "answer": "Äá»ƒ trá»Ÿ thÃ nh cá»™ng tÃ¡c viÃªn...",
      "order": 1,
      "status": 1
    }
  }
}
```

### 3. Create New FAQ
**POST** `/admin/faqs`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "question": "CÃ¢u há»i má»›i?",
  "answer": "CÃ¢u tráº£ lá»i chi tiáº¿t...",
  "order": 1,
  "status": 1
}
```

**Note:**
- `question` and `answer` are required
- If `order` is not provided or is 0, it will be set to max order + 1
- `status` defaults to 1 (active)

**Response:**
```json
{
  "success": true,
  "message": "FAQ created successfully",
  "data": {
    "faq": {
      "id": 1,
      "question": "CÃ¢u há»i má»›i?",
      "order": 1
    }
  }
}
```

### 4. Update FAQ
**PUT** `/admin/faqs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "question": "CÃ¢u há»i Ä‘Ã£ cáº­p nháº­t?",
  "answer": "CÃ¢u tráº£ lá»i Ä‘Ã£ cáº­p nháº­t...",
  "order": 2,
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "FAQ updated successfully",
  "data": {
    "faq": {...}
  }
}
```

### 5. Delete FAQ
**DELETE** `/admin/faqs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

### 6. Sort FAQs
**PUT** `/admin/faqs/sort`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "faqs": [
    {
      "id": 1,
      "order": 1
    },
    {
      "id": 2,
      "order": 2
    },
    {
      "id": 3,
      "order": 3
    }
  ]
}
```

**Note:**
- This endpoint allows bulk updating the order of multiple FAQs
- All FAQs must exist in the database
- Uses transaction to ensure all updates succeed or fail together

**Response:**
```json
{
  "success": true,
  "message": "Sorted 3 FAQ(s) successfully",
  "data": {
    "faqs": [
      {
        "id": 1,
        "question": "...",
        "order": 1
      },
      {
        "id": 2,
        "question": "...",
        "order": 2
      },
      {
        "id": 3,
        "question": "...",
        "order": 3
      }
    ]
  }
}
```

**Status Values:**
- `0`: Inactive
- `1`: Active

---

## ðŸ“ Category Management

### 1. Get List of Categories (Tree Structure)
**GET** `/admin/categories`

**Query Parameters:**
- `parentId` (optional): Filter by parent ID (null for root categories)
- `isActive` (optional): Filter by active status (true/false)
- `tree` (optional): Return tree structure (true/false, default: true)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response (Tree Structure):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "ThÃ´ng bÃ¡o",
        "slug": "noti",
        "description": null,
        "color": "#007bff",
        "parentId": null,
        "isActive": true,
        "sortOrder": 0,
        "showInDashboard": true,
        "parent": null,
        "children": [
          {
            "id": 2,
            "name": "Tin má»›i",
            "slug": "tin-mi",
            "parentId": 1,
            "sortOrder": 1
          }
        ]
      }
    ],
    "total": 3
  }
}
```

**Response (Flat List):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "ThÃ´ng bÃ¡o",
        "parentId": null,
        "parent": null,
        "children": [...]
      }
    ],
    "total": 3
  }
}
```

### 2. Get Category by ID
**GET** `/admin/categories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "ThÃ´ng bÃ¡o",
      "slug": "noti",
      "description": null,
      "color": "#007bff",
      "parentId": null,
      "isActive": true,
      "sortOrder": 0,
      "showInDashboard": true,
      "parent": null,
      "children": [...]
    }
  }
}
```

### 3. Create New Category
**POST** `/admin/categories`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Danh má»¥c má»›i",
  "slug": "danh-muc-moi",
  "description": "MÃ´ táº£ danh má»¥c",
  "color": "#007bff",
  "parentId": null,
  "isActive": true,
  "sortOrder": 1,
  "showInDashboard": false
}
```

**Note:**
- `name` is required
- `slug` will be auto-generated from name if not provided
- If `parentId` is provided, parent must exist
- If `sortOrder` is not provided or 0, it will be set to max order + 1 for siblings
- Prevents circular references

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Danh má»¥c má»›i",
      "slug": "danh-muc-moi"
    }
  }
}
```

### 4. Update Category
**PUT** `/admin/categories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "name": "Danh má»¥c Ä‘Ã£ cáº­p nháº­t",
  "slug": "danh-muc-da-cap-nhat",
  "description": "MÃ´ táº£ má»›i",
  "color": "#28a745",
  "parentId": 1,
  "isActive": true,
  "sortOrder": 2,
  "showInDashboard": true
}
```

**Note:**
- Prevents setting itself as parent
- Prevents circular references (cannot set a descendant as parent)
- Slug will be auto-regenerated if name changes and slug is not provided

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {...}
  }
}
```

### 5. Delete Category
**DELETE** `/admin/categories/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** 
- Soft delete
- Cannot delete category with children - must delete or move children first

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Response (if has children):**
```json
{
  "success": false,
  "message": "Cannot delete category with 2 child category(ies). Please delete or move children first."
}
```

---

## ðŸ“§ Contact Management

### 1. Get List of Contacts
**GET** `/admin/contacts`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: pending, 1: processed, 2: rejected)
- `search` (optional): Search by email or phone

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": 1,
        "email": "user@example.com",
        "phone": "(+84) 976 988 522",
        "content": "TÃ´i muá»‘n há»§y tÃ i khoáº£n Ä‘Äƒng kÃ½...",
        "status": 0,
        "createdAt": "2025-08-28T13:59:51.000Z",
        "updatedAt": "2025-08-28T13:59:51.000Z"
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

**Note:** Contacts are sorted by `status` ASC (pending first), then by `created_at` DESC (newest first).

### 2. Get Contact by ID
**GET** `/admin/contacts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": 1,
      "email": "user@example.com",
      "phone": "(+84) 976 988 522",
      "content": "TÃ´i muá»‘n há»§y tÃ i khoáº£n Ä‘Äƒng kÃ½...",
      "status": 0,
      "createdAt": "2025-08-28T13:59:51.000Z",
      "updatedAt": "2025-08-28T13:59:51.000Z"
    }
  }
}
```

### 3. Mark Contact as Processed
**PUT** `/admin/contacts/:id/mark-processed`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body:**
```json
{
  "status": 1
}
```

**Note:**
- `status`: 1 = processed, 2 = rejected
- Default is 1 (processed) if not provided

**Response:**
```json
{
  "success": true,
  "message": "Contact marked as processed successfully",
  "data": {
    "contact": {
      "id": 1,
      "email": "user@example.com",
      "status": 1
    }
  }
}
```

### 4. Delete Contact
**DELETE** `/admin/contacts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Hard delete (not soft delete)

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

**Status Values:**
- `0`: Pending
- `1`: Processed
- `2`: Rejected

---

## ðŸ  Home Setting Management

### 1. Home Setting Partner Management

#### 1.1. Get List of Home Setting Partners
**GET** `/admin/home-setting-partners`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: inactive, 1: active)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "partners": [
      {
        "id": 1,
        "name": "Äá»‘i tÃ¡c 1",
        "logo": "/uploads/partners/PARTNER_1234567890.png",
        "link": "https://partner.com",
        "sortOrder": 1,
        "status": 1
      }
    ],
    "pagination": {...}
  }
}
```

#### 1.2. Get Home Setting Partner by ID
**GET** `/admin/home-setting-partners/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "partner": {...}
  }
}
```

#### 1.3. Create New Home Setting Partner
**POST** `/admin/home-setting-partners`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- `name` (required): Partner name
- `logo` (file, optional): Partner logo image
- `link` (optional): Partner website link
- `sortOrder` (optional): Display order
- `status` (optional): Status (default: 1)

**Response:**
```json
{
  "success": true,
  "message": "Home setting partner created successfully",
  "data": {
    "partner": {...}
  }
}
```

#### 1.4. Update Home Setting Partner
**PUT** `/admin/home-setting-partners/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required Role:** Super Admin or Admin Backoffice

**Request Body (multipart/form-data):**
- All fields can be updated
- `logo` (file, optional): New logo (will replace old one)

**Response:**
```json
{
  "success": true,
  "message": "Home setting partner updated successfully",
  "data": {
    "partner": {...}
  }
}
```

#### 1.5. Delete Home Setting Partner
**DELETE** `/admin/home-setting-partners/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Logo file will also be deleted

**Response:**
```json
{
  "success": true,
  "message": "Home setting partner deleted successfully"
}
```

---

## ðŸ’¾ Cache Management

### 1. Get Cache Entries
**GET** `/admin/cache`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search by key

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "cache": [
      {
        "key": "cache_key",
        "value": "cached_value",
        "expiration": 1234567890
      }
    ],
    "pagination": {...}
  }
}
```

### 2. Clear All Cache
**DELETE** `/admin/cache`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

### 3. Clear Cache Locks
**DELETE** `/admin/cache/locks`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Clears all cache entries with keys starting with 'lock:'

**Response:**
```json
{
  "success": true,
  "message": "Cache locks cleared successfully"
}
```

---

## ðŸ”„ Queue Job Management

### 1. Get List of Queue Jobs
**GET** `/admin/queue-jobs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `queue` (optional): Filter by queue name
- `status` (optional): Filter by status (available/reserved)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "queue": "default",
        "payload": {...},
        "attempts": 0,
        "reserved_at": null,
        "available_at": 1234567890,
        "created_at": 1234567890
      }
    ],
    "pagination": {...}
  }
}
```

### 2. Get Failed Jobs
**GET** `/admin/queue-jobs/failed`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "queue": "default",
        "payload": {...},
        "exception": "Error message...",
        "failed_at": "2025-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

### 3. Retry Failed Job
**POST** `/admin/queue-jobs/failed/:id/retry`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Re-inserts the failed job into the queue and removes it from failed_jobs

**Response:**
```json
{
  "success": true,
  "message": "Failed job retried successfully"
}
```

### 4. Delete Queue Job
**DELETE** `/admin/queue-jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Queue job deleted successfully"
}
```

### 5. Delete Failed Job
**DELETE** `/admin/queue-jobs/failed/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "message": "Failed job deleted successfully"
}
```

---

## ðŸ“Š Dashboard & Statistics

### 1. Dashboard Overview
**GET** `/admin/dashboard`

**Query Parameters:**
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "collaborators": {
      "total": 100,
      "active": 80,
      "inactive": 20
    },
    "jobs": {
      "total": 500,
      "published": 400,
      "draft": 50,
      "closed": 50
    },
    "applications": {
      "total": 1000,
      "pending": 200,
      "approved": 500,
      "rejected": 200,
      "nyusha": 100
    },
    "paymentRequests": {
      "total": 300,
      "pending": 50,
      "approved": 100,
      "paid": 120,
      "rejected": 30
    },
    "cvs": {
      "total": 2000
    },
    "charts": {
      "applicationsByDate": [
        {
          "date": "2025-01-15",
          "count": "10"
        }
      ],
      "paymentsByDate": [
        {
          "date": "2025-01-15",
          "count": "5",
          "totalAmount": "5000000"
        }
      ]
    }
  }
}
```

---

## ðŸ“ˆ Statistics

### 1. Collaborator Statistics
**GET** `/admin/statistics/collaborators`

**Query Parameters:**
- `limit` (optional): Number of top results (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "topByPoints": [
      {
        "id": 1,
        "name": "CTV A",
        "email": "ctv@example.com",
        "totalPoints": 1000,
        "applicationsCount": 50
      }
    ],
    "topByApplications": [...],
    "topByPayments": [...],
    "byRankLevel": [
      {
        "id": 1,
        "name": "Bronze",
        "count": 20
      }
    ],
    "byGroup": [
      {
        "id": 1,
        "name": "Group A",
        "count": 15
      }
    ]
  }
}
```

### 2. Job Statistics
**GET** `/admin/statistics/jobs`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "byCategory": [
      {
        "id": 1,
        "name": "IT",
        "count": 100
      }
    ],
    "byCompany": [
      {
        "id": 1,
        "name": "Company A",
        "count": 50
      }
    ],
    "hotJobs": [
      {
        "id": 1,
        "title": "Job Title",
        "companyName": "Company A",
        "applicationsCount": 20
      }
    ],
    "jobsWithMostApplications": [...]
  }
}
```

### 3. Application Statistics
**GET** `/admin/statistics/applications`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      {
        "status": 0,
        "count": "200"
      }
    ],
    "byJob": [
      {
        "id": 1,
        "title": "Job Title",
        "count": "50"
      }
    ],
    "byCollaborator": [
      {
        "id": 1,
        "name": "CTV A",
        "count": "30"
      }
    ],
    "successRate": 10.5,
    "paymentRate": 40.0
  }
}
```

### 4. Payment Statistics
**GET** `/admin/statistics/payments`

**Query Parameters:**
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "totalByTime": [
      {
        "date": "2025-01-15",
        "totalAmount": "5000000",
        "count": "10"
      }
    ],
    "byCollaborator": [
      {
        "id": 1,
        "name": "CTV A",
        "totalAmount": "10000000",
        "count": "20"
      }
    ],
    "byJob": [
      {
        "id": 1,
        "title": "Job Title",
        "totalAmount": "5000000",
        "count": "10"
      }
    ],
    "byStatus": [
      {
        "status": 2,
        "count": "120",
        "totalAmount": "60000000"
      }
    ]
  }
}
```

---

## ðŸ“„ Reports Export

### 1. Export Collaborator Report
**GET** `/admin/reports/collaborators`

**Query Parameters:**
- `format` (optional): Export format - `json`, `excel`, `pdf` (default: `json`)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Excel/PDF export requires additional packages (exceljs, pdfkit, etc.) - currently returns JSON format

**Response (JSON):**
```json
{
  "success": true,
  "data": {
    "collaborators": [...],
    "total": 100
  }
}
```

### 2. Export Application Report
**GET** `/admin/reports/applications`

**Query Parameters:**
- `format` (optional): Export format - `json`, `excel`, `pdf` (default: `json`)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by status
- `jobId` (optional): Filter by job ID
- `collaboratorId` (optional): Filter by collaborator ID

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [...],
    "total": 1000
  }
}
```

### 3. Export Payment Report
**GET** `/admin/reports/payments`

**Query Parameters:**
- `format` (optional): Export format - `json`, `excel`, `pdf` (default: `json`)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by status
- `collaboratorId` (optional): Filter by collaborator ID

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "total": 300,
    "totalAmount": 150000000
  }
}
```

### 4. Export Job Report
**GET** `/admin/reports/jobs`

**Query Parameters:**
- `format` (optional): Export format - `json`, `excel`, `pdf` (default: `json`)
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `status` (optional): Filter by status
- `companyId` (optional): Filter by company ID
- `categoryId` (optional): Filter by category ID

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "total": 500
  }
}
```

---

## ðŸ“ Action Log Management

### 1. Get List of Action Logs
**GET** `/admin/action-logs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `adminId` (optional): Filter by admin ID
- `object` (optional): Filter by object type (Job, JobApplication, Collaborator, etc.)
- `action` (optional): Filter by action (login, logout, create, edit, delete, import)
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)
- `ip` (optional): Filter by IP address (partial match)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "adminId": 1,
        "object": "Collaborator",
        "action": "edit",
        "ip": "123.25.21.16",
        "before": {
          "id": 76,
          "name": "Old Name",
          "status": 1
        },
        "after": {
          "id": 76,
          "name": "New Name",
          "status": 1
        },
        "description": "Updated collaborator: New Name",
        "createdAt": "2025-10-02T03:49:06.000Z",
        "admin": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "total": 1000,
      "page": 1,
      "limit": 50,
      "totalPages": 20
    }
  }
}
```

### 2. Get Action Log by ID
**GET** `/admin/action-logs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Response:**
```json
{
  "success": true,
  "data": {
    "log": {
      "id": 1,
      "adminId": 1,
      "object": "Collaborator",
      "action": "edit",
      "ip": "123.25.21.16",
      "before": {
        "id": 76,
        "name": "Old Name"
      },
      "after": {
        "id": 76,
        "name": "New Name"
      },
      "description": "Updated collaborator: New Name",
      "createdAt": "2025-10-02T03:49:06.000Z",
      "admin": {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com"
      }
    }
  }
}
```

### 3. Export Action Logs Report
**GET** `/admin/action-logs/export`

**Query Parameters:**
- `format` (optional): Export format - `json`, `excel`, `pdf` (default: `json`)
- `adminId` (optional): Filter by admin ID
- `object` (optional): Filter by object type
- `action` (optional): Filter by action
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `ip` (optional): Filter by IP address

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** Super Admin or Admin Backoffice

**Note:** Excel/PDF export requires additional packages (exceljs, pdfkit, etc.) - currently returns JSON format

**Response (JSON):**
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "total": 1000
  }
}
```

**Action Types:**
- `login`: Admin login
- `logout`: Admin logout
- `create`: Create new record
- `edit`: Update record
- `delete`: Delete record
- `import`: Import data
- `activate`: Activate record
- `deactivate`: Deactivate record
- `approve`: Approve record
- `reject`: Reject record
- `publish`: Publish record
- `unpublish`: Unpublish record
- `set_default`: Set as default
- `mark_processed`: Mark as processed
- `sort`: Sort records
- `configure`: Configure settings

**Common Object Types:**
- `Admin`
- `Collaborator`
- `Job`
- `JobApplication`
- `PaymentRequest`
- `CV`
- `Company`
- `Campaign`
- `EmailTemplate`
- `EmailCompany`
- `EmailNewsletter`
- `Post`
- `FAQ`
- `Category`
- `Contact`
- `HomeSettingPartner`
- `HomeSettingJob`
- `JobCategory`
- `RankLevel`
- `Group`
- `JobSetting`
- `JobSettingProfit`
- `JobPickup`
- `CVStorage`
- `CTVCVStorage`
- `AdminEmailConfig`
- `MailSetting`

---

# ðŸ‘¤ CTV (Cá»˜NG TÃC VIÃŠN) API DOCUMENTATION

## ðŸ” CTV Authentication

### 1. Register CTV Account
**POST** `/ctv/auth/register`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `name` (required): Full name
- `email` (required): Email address
- `phone` (required): Phone number
- `password` (required): Password
- `address` (optional): Address
- `country` (optional): Country code (default: 'VN')
- `birthday` (optional): Birthday (ISO date string)
- `gender` (optional): Gender (0: female, 1: male)
- `organizationType` (optional): Organization type
- `companyName` (optional): Company name
- `taxCode` (optional): Tax code
- `businessLicense` (optional): Business license
- `bankName` (optional): Bank name
- `bankAccount` (optional): Bank account number
- `bankAccountName` (optional): Bank account name
- `bankBranch` (optional): Bank branch
- `postCode` (optional): Postal code
- `website` (optional): Website URL
- `facebook` (optional): Facebook link
- `zalo` (optional): Zalo link
- `avatar` (file, optional): Avatar image

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please wait for admin approval.",
  "data": {
    "collaborator": {
      "id": 1,
      "code": "CTV1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "status": 0
    }
  }
}
```

### 2. Login CTV
**POST** `/ctv/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "collaborator": {
      "id": 1,
      "code": "CTV1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0123456789",
      "avatar": "/uploads/avatars/ctv/CTV_1234567890.jpg",
      "totalPoints": 1000,
      "status": 1,
      "approvedAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401`: Invalid email or password
- `403`: Account pending approval or inactive

### 3. Logout CTV
**POST** `/ctv/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Forgot Password
**POST** `/ctv/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```

### 5. Reset Password
**POST** `/ctv/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_here",
  "email": "john@example.com",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## ðŸ‘¤ CTV Profile Management

### 1. Get CTV Profile
**GET** `/ctv/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "code": "CTV1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "0123456789",
      "address": "123 Main St",
      "country": "VN",
      "birthday": "1990-01-01T00:00:00.000Z",
      "gender": 1,
      "avatar": "/uploads/avatars/ctv/CTV_1234567890.jpg",
      "organizationType": "company",
      "companyName": "ABC Company",
      "taxCode": "123456789",
      "businessLicense": "BL123456",
      "bankName": "Vietcombank",
      "bankAccount": "1234567890",
      "bankAccountName": "John Doe",
      "bankBranch": "Ho Chi Minh",
      "postCode": "70000",
      "website": "https://example.com",
      "facebook": "https://facebook.com/johndoe",
      "zalo": "0123456789",
      "totalPoints": 1000,
      "status": 1,
      "approvedAt": "2025-01-15T10:00:00.000Z",
      "rankLevel": {
        "id": 1,
        "name": "Bronze",
        "percent": "25.00",
        "pointsRequired": 1000
      },
      "group": {
        "id": 1,
        "name": "Group A"
      }
    }
  }
}
```

### 2. Update CTV Profile
**PUT** `/ctv/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Request Body (multipart/form-data):**
- All profile fields can be updated
- `avatar` (file, optional): New avatar (will replace old one)

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {...}
  }
}
```

### 3. Change Password
**PUT** `/ctv/profile/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

### 4. Get Account Status
**GET** `/ctv/profile/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "status": {
      "code": "CTV1234567890",
      "status": 1,
      "approvedAt": "2025-01-15T10:00:00.000Z",
      "totalPoints": 1000,
      "rankLevel": {
        "id": 1,
        "name": "Bronze",
        "percent": "25.00"
      },
      "group": {
        "id": 1,
        "name": "Group A"
      },
      "isApproved": true,
      "isActive": true
    }
  }
}
```

**Status Values:**
- `0`: Pending approval
- `1`: Active
- `2`: Inactive

---

## ðŸ“„ CTV CV Management

### 1. Get List of CVs
**GET** `/ctv/cvs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (0: pending, 1: active, 2: inactive)
- `startDate` (optional): Start date for filtering received date (ISO date string)
- `endDate` (optional): End date for filtering received date (ISO date string)
- `search` (optional): Search by name, email, or CV code

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** CTV can only view their own CVs

**Response:**
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "id": 1,
        "code": "CV1234567890",
        "title": "Software Engineer",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "address": "123 Main St",
        "filePath": "/uploads/cvs/ctv/CV_1234567890.pdf",
        "receivedAt": "2025-01-15T10:00:00.000Z",
        "status": 1
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

### 2. Get CV by ID
**GET** `/ctv/cvs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** CTV can only view their own CVs

**Response:**
```json
{
  "success": true,
  "data": {
    "cv": {
      "id": 1,
      "code": "CV1234567890",
      "title": "Software Engineer",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "0123456789",
      "address": "123 Main St",
      "filePath": "/uploads/cvs/ctv/CV_1234567890.pdf",
      "receivedAt": "2025-01-15T10:00:00.000Z",
      "status": 1
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "CV not found or you do not have permission to view it"
}
```

### 3. Create New CV
**POST** `/ctv/cvs`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Request Body (multipart/form-data):**
- `title` (required): CV title
- `fullName` (required): Full name of candidate
- `email` (required): Email of candidate
- `phone` (optional): Phone number
- `address` (optional): Address
- `receivedAt` (optional): Date received (ISO date string, default: now)
- `file` (file, required): CV file (PDF, DOC, DOCX, max 10MB)

**Response:**
```json
{
  "success": true,
  "message": "CV created successfully",
  "data": {
    "cv": {
      "id": 1,
      "code": "CV1234567890",
      "title": "Software Engineer",
      "fullName": "John Doe"
    }
  }
}
```

### 4. Update CV
**PUT** `/ctv/cvs/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Note:** 
- CTV can only update their own CVs
- Cannot update CV that is already used in job applications

**Request Body (multipart/form-data):**
- All fields can be updated
- `file` (file, optional): New CV file (will replace old one)

**Response:**
```json
{
  "success": true,
  "message": "CV updated successfully",
  "data": {
    "cv": {...}
  }
}
```

**Error Response (if CV is used in applications):**
```json
{
  "success": false,
  "message": "Cannot update CV that is already used in job applications"
}
```

### 5. Delete CV
**DELETE** `/ctv/cvs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:**
- CTV can only delete their own CVs
- Cannot delete CV that is already used in job applications
- CV file will also be deleted

**Response:**
```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

**Error Response (if CV is used in applications):**
```json
{
  "success": false,
  "message": "Cannot delete CV that is already used in job applications"
}
```

**Status Values:**
- `0`: Pending
- `1`: Active
- `2`: Inactive

### 6. Upload CV File (Standalone)
**POST** `/ctv/cvs/:id/upload-file`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Request Body (multipart/form-data):**
- `file` (file, required): CV file (PDF, DOC, DOCX, max 10MB)

**Note:**
- CTV can only upload file for their own CVs
- Old file will be automatically deleted

**Response:**
```json
{
  "success": true,
  "message": "CV file uploaded successfully",
  "data": {
    "cv": {
      "id": 1,
      "filePath": "/uploads/cvs/ctv/CV_1234567890.pdf"
    }
  }
}
```

### 7. Download CV File
**GET** `/ctv/cvs/:id/download`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:**
- CTV can only download file from their own CVs
- Returns file as download attachment

**Response:**
- File download (binary)
- Headers:
  - `Content-Type: application/octet-stream`
  - `Content-Disposition: attachment; filename="CV_1234567890.pdf"`

**Error Response:**
```json
{
  "success": false,
  "message": "CV file not found"
}
```

### 8. Delete CV File
**DELETE** `/ctv/cvs/:id/file`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:**
- CTV can only delete file from their own CVs
- CV record will be kept, only file is deleted
- File path in database will be set to null

**Response:**
```json
{
  "success": true,
  "message": "CV file deleted successfully"
}
```

---

## ðŸ’¼ CTV Job Management

### 1. Get List of Public Jobs
**GET** `/ctv/jobs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `categoryId` (optional): Filter by job category ID
- `companyId` (optional): Filter by company ID
- `isHot` (optional): Filter by hot jobs (true/false)
- `search` (optional): Search by keyword (title or description)
- `location` (optional): Filter by work location
- `minSalary` (optional): Filter by minimum salary (text pattern search)
- `maxSalary` (optional): Filter by maximum salary (text pattern search)
- `sortBy` (optional): Sort by field - `created_at` or `view_count` (default: `created_at`)
- `sortOrder` (optional): Sort order - `ASC` or `DESC` (default: `DESC`)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication (recommended)

**Note:** Only published jobs (status = 1) are returned

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Software Engineer",
        "description": "Job description...",
        "requirements": "Job requirements...",
        "instructions": "Application instructions...",
        "workLocation": "Ho Chi Minh City",
        "interviewLocation": "Ho Chi Minh City",
        "estimatedSalary": "20000000",
        "allowance": "5000000",
        "bonus": "10000000",
        "workHours": "9:00 - 18:00",
        "restTime": "12:00 - 13:00",
        "jdFileVi": "/uploads/jobs/jd_vi.pdf",
        "jdFileJa": "/uploads/jobs/jd_ja.pdf",
        "cvFormFile": "/uploads/jobs/cv_form.pdf",
        "isHot": 1,
        "isPinned": 0,
        "viewCount": 100,
        "status": 1,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "jobCategory": {
          "id": 1,
          "name": "IT",
          "slug": "it"
        },
        "company": {
          "id": 1,
          "name": "ABC Company",
          "logo": "/uploads/companies/logo.png",
          "email": "contact@abc.com"
        },
        "jobSetting": {
          "id": 1,
          "japaneseLevel": "N2",
          "experience": "2 years",
          "specialization": "Software Development",
          "qualification": "Bachelor's degree"
        },
        "profits": [
          {
            "id": 1,
            "type": "nyusha",
            "amount": "5000000",
            "description": "Commission for successful placement"
          }
        ],
        "isFavorite": false
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

**Note:** 
- `isFavorite` field indicates if the job is in CTV's favorites (only shown when authenticated)
- Salary filtering uses text pattern matching since `estimatedSalary` is stored as TEXT

### 2. Get Job by ID
**GET** `/ctv/jobs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication (recommended)

**Note:**
- Only published jobs (status = 1) are accessible
- View count is automatically incremented when viewing

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": 1,
      "title": "Software Engineer",
      "description": "Job description...",
      "requirements": "Job requirements...",
      "instructions": "Application instructions...",
      "workLocation": "Ho Chi Minh City",
      "interviewLocation": "Ho Chi Minh City",
      "estimatedSalary": "20000000",
      "allowance": "5000000",
      "bonus": "10000000",
      "workHours": "9:00 - 18:00",
      "restTime": "12:00 - 13:00",
      "jdFileVi": "/uploads/jobs/jd_vi.pdf",
      "jdFileJa": "/uploads/jobs/jd_ja.pdf",
      "cvFormFile": "/uploads/jobs/cv_form.pdf",
      "isHot": 1,
      "isPinned": 0,
      "viewCount": 101,
      "status": 1,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "jobCategory": {
        "id": 1,
        "name": "IT",
        "slug": "it",
        "description": "IT jobs"
      },
      "company": {
        "id": 1,
        "name": "ABC Company",
        "logo": "/uploads/companies/logo.png",
        "email": "contact@abc.com",
        "address": "123 Main St",
        "phone": "0123456789"
      },
      "jobSetting": {
        "id": 1,
        "japaneseLevel": "N2",
        "experience": "2 years",
        "specialization": "Software Development",
        "qualification": "Bachelor's degree"
      },
      "profits": [
        {
          "id": 1,
          "type": "nyusha",
          "amount": "5000000",
          "description": "Commission for successful placement"
        },
        {
          "id": 2,
          "type": "interview",
          "amount": "1000000",
          "description": "Commission for interview"
        }
      ]
    }
  }
}
```

**Job Information Includes:**
- **Basic Info**: Title, description, requirements, instructions
- **Location**: Work location, interview location
- **Salary & Benefits**: Estimated salary, allowance, bonus
- **Time**: Work hours, rest time
- **Company Info**: Company name, logo, email, address, phone
- **Job Category**: Category name, slug, description
- **Job Requirements**: Japanese level, experience, specialization, qualification
- **Commission**: Profit amounts for different stages (nyusha, interview, etc.)
- **Files**: JD files (Vietnamese, Japanese), CV form file

### 3. Search Jobs (Advanced Search)
**GET** `/ctv/jobs/search`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by keyword (title or description)
- `categoryId` (optional): Filter by job category ID
- `location` (optional): Filter by work location
- `minSalary` (optional): Minimum salary
- `maxSalary` (optional): Maximum salary
- `companyId` (optional): Filter by company ID
- `isHot` (optional): Filter by hot jobs (true/false)
- `sortBy` (optional): Sort by field - `created_at` or `view_count` (default: `created_at`)
- `sortOrder` (optional): Sort order - `ASC` or `DESC` (default: `DESC`)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** This endpoint is essentially the same as GET `/ctv/jobs` but with more explicit search parameters

**Response:** Same as GET `/ctv/jobs`

### 4. Get Favorite Jobs
**GET** `/ctv/jobs/favorites`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": 1,
        "title": "Software Engineer",
        "isFavorite": true,
        "favoritedAt": "2025-01-15T10:00:00.000Z",
        "jobCategory": {...},
        "company": {...},
        "profits": [...]
      }
    ],
    "pagination": {...}
  }
}
```

### 5. Add Job to Favorites
**POST** `/ctv/jobs/:id/favorite`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "message": "Job added to favorites successfully",
  "data": {
    "favorite": {
      "id": 1,
      "collaboratorId": 1,
      "jobId": 1
    }
  }
}
```

**Error Response (if already favorited):**
```json
{
  "success": false,
  "message": "Job is already in favorites"
}
```

### 6. Remove Job from Favorites
**DELETE** `/ctv/jobs/:id/favorite`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "message": "Job removed from favorites successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Job is not in favorites"
}
```

---

## ðŸ“ CTV Job Application Management

### 1. Get List of Job Applications
**GET** `/ctv/job-applications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `jobId` (optional): Filter by job ID
- `status` (optional): Filter by status (1-17)
- `startDate` (optional): Start date for filtering applied date (ISO date string)
- `endDate` (optional): End date for filtering applied date (ISO date string)
- `search` (optional): Search by candidate name
- `sortBy` (optional): Sort by field - `applied_at` or `status` (default: `applied_at`)
- `sortOrder` (optional): Sort order - `ASC` or `DESC` (default: `DESC`)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** CTV can only view their own job applications

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": 1,
        "jobId": 1,
        "cvId": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "0123456789",
        "status": 1,
        "appliedAt": "2025-01-15T10:00:00.000Z",
        "job": {
          "id": 1,
          "title": "Software Engineer",
          "companyName": "ABC Company"
        },
        "cv": {
          "id": 1,
          "code": "CV1234567890",
          "fullName": "John Doe"
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 2. Get Job Application by ID
**GET** `/ctv/job-applications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** Includes full application details and logs

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "jobId": 1,
      "cvId": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "status": 1,
      "appliedAt": "2025-01-15T10:00:00.000Z",
      "interviewDate": "2025-01-20T10:00:00.000Z",
      "nyushaDate": "2025-02-01",
      "currentIncome": 20000000,
      "desiredIncome": 25000000,
      "referralFee": 5000000,
      "job": {
        "id": 1,
        "title": "Software Engineer",
        "jobSettingProfits": [...]
      },
      "cv": {...},
      "logs": [
        {
          "id": 1,
          "statusBefore": "1",
          "statusAfter": "2",
          "createdAt": "2025-01-16T10:00:00.000Z",
          "admin": {
            "id": 1,
            "name": "Admin"
          }
        }
      ]
    }
  }
}
```

### 3. Create New Job Application
**POST** `/ctv/job-applications`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Request Body (multipart/form-data):**
- `jobId` (required): Job ID
- `cvId` (optional): CV ID (if using existing CV)
- **Basic Info**: `name`, `email`, `phone`, `birthDate`, `ages`, `gender`, `addressCurrent`, `addressOrigin`, `furigana`, `passport`, `spouse`
- **Visa Info**: `currentResidence`, `jpResidenceStatus`, `otherCountry`, `visaExpirationDate`
- **Language & Certificates**: `jlptLevel`, `jlptLevels`, `certificateYear`, `toeicScore`, `toeicYear`, `ieltsScore`, `ieltsYear`, `hasDrivingLicense`, `drivingLicenseDate`, `otherCertificates`, `otherCertificateDates`, `japaneseLevels`, `englishLevels`, `otherLevels`, `languageDescription`, `foreignNotes`
- **Experience**: `experienceYears`, `specialization`, `qualification`, `learnedTools` (JSON), `otherLearnedTools` (JSON), `experienceTools` (JSON), `otherExperienceTools` (JSON), `workHistory`, `workHistoryDetails` (JSON)
- **Education**: `educationDetails` (JSON)
- **Salary**: `currentIncome`, `desiredIncome`, `desiredWorkLocation`
- **Application**: `selfPromotion`, `reasonApply`
- **Schedule**: `nyushaTime`, `interviewTime`
- **Files**: `cv` (file), `otherDocuments` (file), `avatar` (file)

**Response:**
```json
{
  "success": true,
  "message": "Job application created successfully",
  "data": {
    "application": {
      "id": 1,
      "jobId": 1,
      "status": 1
    }
  }
}
```

### 4. Update Job Application
**PUT** `/ctv/job-applications/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Note:**
- CTV can only update their own applications
- Can only update if status is 1 (Admin Ä‘ang xá»­ lÃ½ há»“ sÆ¡) or 2 (Äang tiáº¿n cá»­)
- All fields can be updated (same as create)
- Files will replace old ones if uploaded

**Response:**
```json
{
  "success": true,
  "message": "Job application updated successfully",
  "data": {
    "application": {...}
  }
}
```

**Error Response (if status doesn't allow editing):**
```json
{
  "success": false,
  "message": "Cannot update job application. Current status does not allow editing."
}
```

### 5. Get Application Logs (Status Change History)
**GET** `/ctv/job-applications/:id/logs`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "jobApplicationId": 1,
        "statusBefore": "1",
        "statusAfter": "2",
        "createdDate": "2025-01-16",
        "createdAt": "2025-01-16T10:00:00.000Z",
        "admin": {
          "id": 1,
          "name": "Admin",
          "email": "admin@example.com"
        }
      }
    ],
    "total": 5
  }
}
```

**Status Values (1-17):**
- `1`: Admin Ä‘ang xá»­ lÃ½ há»“ sÆ¡
- `2`: Äang tiáº¿n cá»­
- `3`: Äang xáº¿p lá»‹ch phá»ng váº¥n
- `4`: Äang phá»ng váº¥n
- `5`: Äang Ä‘á»£i naitei
- `6`: Äang thÆ°Æ¡ng lÆ°á»£ng naitei
- `7`: Äang Ä‘á»£i nyusha
- `8`: ÄÃ£ nyusha
- `9`: Äang chá» thanh toÃ¡n vá»›i cÃ´ng ty
- `10`: Gá»­i yÃªu cáº§u thanh toÃ¡n
- `11`: ÄÃ£ thanh toÃ¡n
- `12`: Há»“ sÆ¡ khÃ´ng há»£p lá»‡
- `13`: Há»“ sÆ¡ bá»‹ trÃ¹ng
- `14`: Há»“ sÆ¡ khÃ´ng Ä‘áº¡t
- `15`: Káº¿t quáº£ trÆ°á»£t
- `16`: Há»§y giá»¯a chá»«ng
- `17`: KhÃ´ng shodaku

---

## ðŸ’° CTV Payment Request Management

### 1. Get List of Payment Requests
**GET** `/ctv/payment-requests`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status - `0` (Chá» duyá»‡t), `1` (ÄÃ£ duyá»‡t), `2` (Tá»« chá»‘i), `3` (ÄÃ£ thanh toÃ¡n)
- `jobApplicationId` (optional): Filter by job application ID
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)
- `sortBy` (optional): Sort by field - `created_at` or `amount` (default: `created_at`)
- `sortOrder` (optional): Sort order - `ASC` or `DESC` (default: `DESC`)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** CTV can only view their own payment requests

**Response:**
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
        "note": "Payment for successful placement",
        "filePath": "/uploads/payment-requests/ctv/PAYMENT_1234567890.pdf",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "approvedAt": null,
        "rejectedAt": null,
        "paidAt": null,
        "jobApplication": {
          "id": 1,
          "name": "John Doe",
          "job": {
            "id": 1,
            "title": "Software Engineer",
            "companyName": "ABC Company"
          },
          "cv": {
            "id": 1,
            "code": "CV1234567890",
            "fullName": "John Doe"
          }
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 2. Get Payment Request by ID
**GET** `/ctv/payment-requests/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
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
      "note": "Payment for successful placement",
      "filePath": "/uploads/payment-requests/ctv/PAYMENT_1234567890.pdf",
      "approvedAt": "2025-01-16T10:00:00.000Z",
      "rejectedAt": null,
      "rejectedReason": null,
      "paidAt": null,
      "jobApplication": {
        "id": 1,
        "name": "John Doe",
        "job": {
          "id": 1,
          "title": "Software Engineer",
          "company": {
            "id": 1,
            "name": "ABC Company",
            "logo": "/uploads/companies/logo.png",
            "email": "contact@abc.com"
          }
        },
        "cv": {...}
      }
    }
  }
}
```

### 3. Create New Payment Request
**POST** `/ctv/payment-requests`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Required:** CTV Authentication

**Request Body (multipart/form-data):**
- `jobApplicationId` (required): Job application ID
- `amount` (required): Amount to request (must be > 0)
- `note` (optional): Note/comment
- `file` (optional): Attachment file (PDF, DOC, DOCX, or image)

**Validation:**
- Job application must belong to the CTV
- Job application status must be `8` (ÄÃ£ nyusha)
- Cannot create if there's already a pending or approved request for the same job application

**Response:**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "data": {
    "paymentRequest": {
      "id": 1,
      "collaboratorId": 1,
      "jobApplicationId": 1,
      "amount": "5000000.00",
      "status": 0,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

**Error Response (if job application status is not 8):**
```json
{
  "success": false,
  "message": "Payment request can only be created for job applications with status \"ÄÃ£ nyusha\" (status = 8)"
}
```

**Error Response (if duplicate request exists):**
```json
{
  "success": false,
  "message": "There is already a pending or approved payment request for this job application"
}
```

### 4. Get Payment History (Completed Payments)
**GET** `/ctv/payment-requests/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `startDate` (optional): Start date for filtering paid date (ISO date string)
- `endDate` (optional): End date for filtering paid date (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentRequests": [
      {
        "id": 1,
        "amount": "5000000.00",
        "status": 3,
        "paidAt": "2025-01-20T10:00:00.000Z",
        "jobApplication": {
          "id": 1,
          "job": {
            "id": 1,
            "title": "Software Engineer",
            "companyName": "ABC Company"
          },
          "cv": {
            "id": 1,
            "code": "CV1234567890",
            "fullName": "John Doe"
          }
        }
      }
    ],
    "totalAmount": "5000000.00",
    "pagination": {...}
  }
}
```

### 5. Get Payment Statistics
**GET** `/ctv/payment-requests/statistics`

**Query Parameters:**
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPaid": "5000000.00",
    "totalPending": "3000000.00",
    "byStatus": {
      "0": {
        "count": 2,
        "totalAmount": "2000000.00",
        "label": "Chá» duyá»‡t"
      },
      "1": {
        "count": 1,
        "totalAmount": "1000000.00",
        "label": "ÄÃ£ duyá»‡t"
      },
      "2": {
        "count": 0,
        "totalAmount": "0.00",
        "label": "Tá»« chá»‘i"
      },
      "3": {
        "count": 1,
        "totalAmount": "5000000.00",
        "label": "ÄÃ£ thanh toÃ¡n"
      }
    }
  }
}
```

**Status Values:**
- `0`: Chá» duyá»‡t
- `1`: ÄÃ£ duyá»‡t
- `2`: Tá»« chá»‘i
- `3`: ÄÃ£ thanh toÃ¡n

---

## ðŸ“Š CTV Dashboard

### 1. Get Dashboard Overview
**GET** `/ctv/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalCVs": 10,
      "totalApplications": 25,
      "nyushaCount": 5,
      "paidCount": 3,
      "totalPaidAmount": "15000000.00",
      "currentPoints": 500,
      "currentRank": {
        "id": 2,
        "name": "Silver",
        "description": "Silver level collaborator",
        "pointsRequired": 300,
        "percent": "5.00"
      },
      "nextRank": {
        "id": 3,
        "name": "Gold",
        "pointsRequired": 1000,
        "pointsNeeded": 500
      }
    },
    "applicationsByStatus": {
      "1": 5,
      "2": 3,
      "8": 5,
      "11": 3
    }
  }
}
```

**Overview Fields:**
- `totalCVs`: Tá»•ng sá»‘ CV cá»§a CTV
- `totalApplications`: Tá»•ng sá»‘ Ä‘Æ¡n á»©ng tuyá»ƒn
- `nyushaCount`: Sá»‘ Ä‘Æ¡n Ä‘Ã£ nyusha (status = 8)
- `paidCount`: Sá»‘ Ä‘Æ¡n Ä‘Ã£ thanh toÃ¡n (status = 11)
- `totalPaidAmount`: Tá»•ng sá»‘ tiá»n Ä‘Ã£ nháº­n (tá»« payment requests Ä‘Ã£ thanh toÃ¡n)
- `currentPoints`: Äiá»ƒm tÃ­ch lÅ©y hiá»‡n táº¡i
- `currentRank`: Cáº¥p báº­c hiá»‡n táº¡i (náº¿u cÃ³)
- `nextRank`: Cáº¥p báº­c tiáº¿p theo (náº¿u cÃ³) vá»›i sá»‘ Ä‘iá»ƒm cáº§n thiáº¿t

### 2. Get Chart Data (Time Series)
**GET** `/ctv/dashboard/chart`

**Query Parameters:**
- `type` (optional): Chart type - `day`, `week`, `month`, `year` (default: `month`)
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Note:** If no date range is provided, defaults to last 12 months

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "month",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2025-01-01T00:00:00.000Z",
    "applications": [
      {
        "period": "2024-01",
        "count": 5
      },
      {
        "period": "2024-02",
        "count": 3
      }
    ],
    "payments": [
      {
        "period": "2024-01",
        "count": 2,
        "totalAmount": "10000000.00"
      },
      {
        "period": "2024-02",
        "count": 1,
        "totalAmount": "5000000.00"
      }
    ],
    "points": [
      {
        "period": "2024-01",
        "totalPoints": 100
      },
      {
        "period": "2024-02",
        "totalPoints": 50
      }
    ]
  }
}
```

**Chart Data:**
- `applications`: Sá»‘ lÆ°á»£ng Ä‘Æ¡n á»©ng tuyá»ƒn theo thá»i gian
- `payments`: Sá»‘ lÆ°á»£ng vÃ  tá»•ng sá»‘ tiá»n thanh toÃ¡n theo thá»i gian
- `points`: Tá»•ng Ä‘iá»ƒm tÃ­ch lÅ©y theo thá»i gian

### 3. Get Detailed Statistics
**GET** `/ctv/dashboard/statistics`

**Query Parameters:**
- `startDate` (optional): Start date for filtering (ISO date string)
- `endDate` (optional): End date for filtering (ISO date string)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2025-01-01"
    },
    "applications": {
      "byStatus": {
        "1": 5,
        "2": 3,
        "8": 5,
        "11": 3
      },
      "total": 16
    },
    "payments": {
      "byStatus": {
        "0": {
          "count": 2,
          "totalAmount": "2000000.00",
          "label": "Chá» duyá»‡t"
        },
        "1": {
          "count": 1,
          "totalAmount": "1000000.00",
          "label": "ÄÃ£ duyá»‡t"
        },
        "2": {
          "count": 0,
          "totalAmount": "0.00",
          "label": "Tá»« chá»‘i"
        },
        "3": {
          "count": 3,
          "totalAmount": "15000000.00",
          "label": "ÄÃ£ thanh toÃ¡n"
        }
      },
      "total": 6
    },
    "points": {
      "totalEarned": 500
    }
  }
}
```

**Statistics Include:**
- `applications`: Thá»‘ng kÃª Ä‘Æ¡n á»©ng tuyá»ƒn theo tráº¡ng thÃ¡i
- `payments`: Thá»‘ng kÃª yÃªu cáº§u thanh toÃ¡n theo tráº¡ng thÃ¡i (sá»‘ lÆ°á»£ng vÃ  tá»•ng sá»‘ tiá»n)
- `points`: Tá»•ng Ä‘iá»ƒm tÃ­ch lÅ©y trong khoáº£ng thá»i gian

---

## ðŸ”” CTV Notifications

### 1. Get List of Notifications
**GET** `/ctv/notifications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isRead` (optional): Filter by read status - `true` or `false`
- `hasJob` (optional): Filter by whether notification has related job - `true` or `false`
- `sortBy` (optional): Sort field - `createdAt`, `updatedAt`, `isRead` (default: `createdAt`)
- `sortOrder` (optional): Sort order - `ASC` or `DESC` (default: `DESC`)

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "ÄÆ¡n á»©ng tuyá»ƒn Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t",
        "content": "ÄÆ¡n á»©ng tuyá»ƒn cá»§a báº¡n cho vá»‹ trÃ­ Software Engineer Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t vÃ  Ä‘ang trong quÃ¡ trÃ¬nh tiáº¿n cá»­.",
        "jobId": 1,
        "job": {
          "id": 1,
          "title": "Software Engineer",
          "jobCode": "JOB-001",
          "companyName": "ABC Company",
          "slug": "software-engineer"
        },
        "url": "/ctv/job-applications/1",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "title": "ThÃ´ng bÃ¡o há»‡ thá»‘ng",
        "content": "Há»‡ thá»‘ng sáº½ báº£o trÃ¬ vÃ o ngÃ y mai tá»« 2:00 AM Ä‘áº¿n 4:00 AM.",
        "jobId": null,
        "job": null,
        "url": null,
        "isRead": true,
        "createdAt": "2024-01-14T08:00:00.000Z",
        "updatedAt": "2024-01-14T08:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

### 2. Get Notification Details
**GET** `/ctv/notifications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "ÄÆ¡n á»©ng tuyá»ƒn Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t",
    "content": "ÄÆ¡n á»©ng tuyá»ƒn cá»§a báº¡n cho vá»‹ trÃ­ Software Engineer Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t vÃ  Ä‘ang trong quÃ¡ trÃ¬nh tiáº¿n cá»­.",
    "jobId": 1,
    "job": {
      "id": 1,
      "title": "Software Engineer",
      "jobCode": "JOB-001",
      "companyName": "ABC Company",
      "slug": "software-engineer",
      "description": "We are looking for a skilled software engineer...",
      "workLocation": "Tokyo, Japan"
    },
    "url": "/ctv/job-applications/1",
    "isRead": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Note:** Khi xem chi tiáº¿t thÃ´ng bÃ¡o, há»‡ thá»‘ng sáº½ tá»± Ä‘á»™ng Ä‘Ã¡nh dáº¥u lÃ  Ä‘Ã£ Ä‘á»c náº¿u chÆ°a Ä‘á»c.

### 3. Mark Notification as Read
**PATCH** `/ctv/notifications/:id/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "message": "ÄÃ£ Ä‘Ã¡nh dáº¥u thÃ´ng bÃ¡o lÃ  Ä‘Ã£ Ä‘á»c",
  "data": {
    "id": 1,
    "isRead": true
  }
}
```

### 4. Mark All Notifications as Read
**PATCH** `/ctv/notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "message": "ÄÃ£ Ä‘Ã¡nh dáº¥u 5 thÃ´ng bÃ¡o lÃ  Ä‘Ã£ Ä‘á»c",
  "data": {
    "updatedCount": 5
  }
}
```

### 5. Delete Notification
**DELETE** `/ctv/notifications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Required:** CTV Authentication

**Response:**
```json
{
  "success": true,
  "message": "ÄÃ£ xÃ³a thÃ´ng bÃ¡o thÃ nh cÃ´ng"
}
```

**Note:** CTV chá»‰ cÃ³ thá»ƒ xÃ³a thÃ´ng bÃ¡o cá»§a chÃ­nh mÃ¬nh.


---

## ðŸŽ¯ CTV Points & Rank

### 1. Get Current Points
**GET** /ctv/points/current

**Headers:**
\\\
Authorization: Bearer <token>
\\\

**Required:** CTV Authentication

**Response:**
\\\json
{
  "success": true,
  "data": {
    "currentPoints": 1500,
    "currentRank": {
      "id": 2,
      "name": "Silver",
      "pointsRequired": 1000,
      "profitPercentage": "15.00"
    },
    "nextRank": {
      "id": 3,
      "name": "Gold",
      "pointsRequired": 3000,
      "profitPercentage": "20.00"
    },
    "pointsNeededForNextRank": 1500
  }
}
\\\

### 2. Get Point History
**GET** /ctv/points/history

**Query Parameters:**
- \page\ (optional): Page number (default: 1)
- \limit\ (optional): Items per page (default: 20)
- \	ype\ (optional): Filter by point change type
- \startDate\ (optional): Start date for filtering (ISO date string)
- \endDate\ (optional): End date for filtering (ISO date string)

**Headers:**
\\\
Authorization: Bearer <token>
\\\

**Required:** CTV Authentication

**Response:**
\\\json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "points": 100,
        "type": "job_application",
        "description": "Äiá»ƒm thÆ°á»Ÿng tá»« Ä‘Æ¡n á»©ng tuyá»ƒn #123",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "points": 50,
        "type": "bonus",
        "description": "Äiá»ƒm thÆ°á»Ÿng Ä‘áº·c biá»‡t",
        "createdAt": "2024-01-14T08:00:00.000Z"
      },
      {
        "id": 3,
        "points": -20,
        "type": "penalty",
        "description": "Trá»« Ä‘iá»ƒm do vi pháº¡m quy Ä‘á»‹nh",
        "createdAt": "2024-01-13T15:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
\\\

### 3. Get Current Rank Level
**GET** /ctv/points/rank

**Headers:**
\\\
Authorization: Bearer <token>
\\\

**Required:** CTV Authentication

**Response:**
\\\json
{
  "success": true,
  "data": {
    "currentPoints": 1500,
    "currentRank": {
      "id": 2,
      "name": "Silver",
      "pointsRequired": 1000,
      "profitPercentage": "15.00"
    },
    "nextRank": {
      "id": 3,
      "name": "Gold",
      "pointsRequired": 3000,
      "profitPercentage": "20.00"
    },
    "pointsNeededForNextRank": 1500,
    "allRanks": [
      {
        "id": 1,
        "name": "Bronze",
        "pointsRequired": 0,
        "profitPercentage": "10.00"
      },
      {
        "id": 2,
        "name": "Silver",
        "pointsRequired": 1000,
        "profitPercentage": "15.00"
      },
      {
        "id": 3,
        "name": "Gold",
        "pointsRequired": 3000,
        "profitPercentage": "20.00"
      },
      {
        "id": 4,
        "name": "Platinum",
        "pointsRequired": 5000,
        "profitPercentage": "25.00"
      }
    ]
  }
}
\\\

**Response Includes:**
- \currentPoints\: Äiá»ƒm tÃ­ch lÅ©y hiá»‡n táº¡i
- \currentRank\: Cáº¥p báº­c hiá»‡n táº¡i (tÃªn, Ä‘iá»ƒm yÃªu cáº§u, pháº§n trÄƒm lá»£i nhuáº­n)
- \
extRank\: Cáº¥p báº­c tiáº¿p theo (náº¿u cÃ³)
- \pointsNeededForNextRank\: Sá»‘ Ä‘iá»ƒm cáº§n Ä‘á»ƒ lÃªn cáº¥p tiáº¿p theo
- \llRanks\: Danh sÃ¡ch táº¥t cáº£ cÃ¡c cáº¥p báº­c trong há»‡ thá»‘ng

