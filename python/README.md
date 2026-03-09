# Resume Parser AI System

Hệ thống trích xuất thông tin CV Nhật Bản sử dụng Llama 3.2 Vision thông qua Groq API.

## Tính năng

- 📄 Phân tích file PDF CV Nhật Bản
- 🤖 Sử dụng AI Llama 3.2 Vision để trích xuất thông tin
- 📊 Trả về dữ liệu có cấu trúc JSON
- 🚀 API RESTful với FastAPI
- 🔄 Hỗ trợ CORS

## Cài đặt

### Yêu cầu hệ thống
- Python >= 3.11
- uv (package manager)

### Cài đặt dependencies

```bash
# Cài đặt uv nếu chưa có
pip install uv

# Cài đặt dependencies
uv sync
```

### Cấu hình môi trường

Tạo file `.env` và thêm API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Sử dụng

### Khởi chạy server

```bash
# Sử dụng uv
uv run python main.py

# Hoặc trực tiếp
python main.py
```

Server sẽ chạy tại: http://localhost:8000

### API Documentation

Truy cập Swagger UI tại: http://localhost:8000/docs

### Endpoint chính

**POST** `/resume/parse`

Upload file PDF CV và nhận về dữ liệu JSON đã trích xuất.

**Request:**
- File: PDF CV Nhật Bản

**Response:**
```json
{
  "personal_info": {
    "full_name_kanji": "田中太郎",
    "full_name_kana": "タナカタロウ",
    "dob": "1990/01/01",
    "age": "34",
    "gender": "男"
  },
  "education_history": [...],
  "employment_history_details": [...],
  "skills_and_certifications": {...}
}
```

## Cấu trúc dự án

```
Job_Share_Web/
├── routers/
│   ├── __init__.py
│   └── resume.py          # API endpoints
├── main.py               # FastAPI app
├── schema.py             # Pydantic models
├── utils.py              # Helper functions
├── pyproject.toml        # Dependencies
└── README.md
```

## Dependencies chính

- **FastAPI**: Web framework
- **Instructor**: Structured outputs từ LLM
- **OpenAI**: Client cho Groq API
- **PDF2Image**: Convert PDF sang ảnh
- **PaddleOCR**: OCR engine
- **Pydantic**: Data validation

## Phát triển

### Chạy ở chế độ development

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Cấu trúc dữ liệu trích xuất

Hệ thống trích xuất các thông tin sau từ CV:

- **Thông tin cá nhân**: Tên, ngày sinh, tuổi, giới tính, liên lạc
- **Học vấn**: Lịch sử học tập
- **Kinh nghiệm làm việc**: Chi tiết và tóm tắt
- **Kỹ năng & Chứng chỉ**: Bằng cấp, kỹ năng kỹ thuật
- **Thông tin bổ sung**: Gia đình, visa, đi lại
- **Tự giới thiệu**: PR bản thân, động lực
- **Mong muốn**: Mức lương, vị trí, địa điểm làm việc

## License

MIT License