# JobShare 2.0 Backend

Backend API cho hệ thống JobShare 2.0 - Quản lý tuyển dụng việc làm tại Nhật Bản.

## Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM cho MySQL/MariaDB
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Cài đặt

### Yêu cầu
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL/MariaDB

### Các bước cài đặt

1. Cài đặt dependencies:
```bash
pnpm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình database trong file `.env`

4. Chạy migration (nếu có):
```bash
# TODO: Thêm migration scripts
```

5. Chạy server:
```bash
# Development
pnpm dev

# Production
pnpm start
```

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Cấu hình (database, app)
│   ├── models/          # Sequelize models
│   ├── controllers/     # Controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/          # Utilities
│   └── index.js        # Entry point
├── schema/             # Database schema
├── uploads/            # Uploaded files
├── .env.example        # Environment variables example
├── package.json
└── README.md
```

## API Documentation

(TODO: Thêm API documentation)

## License

ISC

