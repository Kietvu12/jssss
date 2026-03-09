from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

class EducationEntry(BaseModel):
    year: int = Field(..., description="Năm / Year / 年")
    month: int = Field(..., description="Tháng / Month / 月")
    description: str = Field(..., description="Thông tin trường học (tên trường, chuyên ngành, tốt nghiệp/nhập học) / School information (school name, major, graduation/admission) / 学歴（学校名・学部・学科、卒業・入学）")

class WorkHistoryEntry(BaseModel):
    year: int = Field(..., description="Năm / Year / 年")
    month: int = Field(..., description="Tháng / Month / 月")
    description: str = Field(..., description="Thông tin công việc (tên công ty, bộ phận, vào làm/nghỉ việc) / Work history (company name, department, joining/leaving) / 職歴（社名、部署名、入社・退社）")

class LicenseQualification(BaseModel):
    year: int = Field(..., description="Năm / Year / 年")
    month: int = Field(..., description="Tháng / Month / 月")
    name: str = Field(..., description="Tên bằng cấp, chứng chỉ / License or qualification name / 免許・資格の名称")

class RirekishoSchema(BaseModel):
    creation_date: Optional[str] = Field(None, description="Ngày tạo tài liệu (Ví dụ: 2025年09月29日) / Date of document creation / 20xx年xx月xx日現在")
    name_furigana: Optional[str] = Field(None, description="Cách đọc tên (Furigana) / Name furigana / 氏名ふりがな")
    full_name: str = Field(..., description="Họ và tên / Full name / 氏名")
    birth_date: date = Field(..., description="Ngày tháng năm sinh / Date of birth / 生年月日")
    age: int = Field(..., description="Tuổi hiện tại / Age / 満年齢")
    gender: str = Field(..., description="Giới tính (Nam/Nữ) / Gender (Male/Female) / 性別（男・女）")
    
    # Thông tin liên lạc
    postal_code: Optional[str] = Field(None, description="Mã bưu điện / Postal code / 郵便番号")
    address: str = Field(..., description="Địa chỉ hiện tại / Current address / 現住所")
    address_furigana: Optional[str] = Field(None, description="Cách đọc địa chỉ / Address furigana / 現住所ふりがな")
    phone: str = Field(..., description="Số điện thoại / Phone number / 電話番号")
    email: EmailStr = Field(..., description="Địa chỉ email / Email address / メールアドレス")
    emergency_contact_address: Optional[str] = Field(None, description="Địa chỉ liên lạc khẩn cấp (nếu khác hiện tại) / Emergency contact address (if different) / 連絡先住所（現住所以外）")
    
    # Quá trình học tập và làm việc
    education_history: List[EducationEntry] = Field(..., description="Danh sách quá trình học tập / Education history list / 学歴一覧")
    work_history: List[WorkHistoryEntry] = Field(..., description="Danh sách quá trình làm việc / Work history list / 職歴一覧")
    licenses_qualifications: List[LicenseQualification] = Field(..., description="Bằng cấp và chứng chỉ / Licenses and qualifications / 免許・資格")
    
    # Thông tin cá nhân và gia đình
    nearest_station: str = Field(..., description="Ga gần nhất / Nearest station / 最寄り駅")
    dependents_count: int = Field(0, description="Số người phụ thuộc (trừ vợ/chồng) / Number of dependents (excluding spouse) / 扶養家族数（配偶者を除く）")
    has_spouse: bool = Field(..., description="Tình trạng hôn nhân (Có/Không) / Marital status (Yes/No) / 配偶者の有無（有・無）")
    spouse_support_obligation: bool = Field(..., description="Nghĩa vụ hỗ trợ vợ/chồng / Spouse support obligation / 配偶者の扶養義務（有・無）")
    
    # Thông tin dành cho người nước ngoài
    residence_status: Optional[str] = Field(None, description="Tư cách lưu trú / Status of residence / 在留資格")
    residence_expiry: Optional[date] = Field(None, description="Thời hạn lưu trú / Residence expiry date / 在留期限")
    
    # Phần tự thuật
    self_pr: str = Field(..., description="Tự giới thiệu bản thân / Self-promotion / 自己PR")
    hobbies_skills: str = Field(..., description="Sở thích và kỹ năng đặc biệt / Hobbies and special skills / 趣味・特技")
    motivation: str = Field(..., description="Lý do ứng tuyển / Motivation for application / 志望動機")
    
    # Nguyện vọng của bản thân
    current_salary: Optional[int] = Field(None, description="Mức lương hiện tại / Current annual salary / 現在年収")
    expected_salary: Optional[int] = Field(None, description="Mức lương mong muốn / Expected annual salary / 希望年収")
    desired_role: Optional[str] = Field(None, description="Vị trí công việc mong muốn / Desired job role / 希望職種")
    desired_location: Optional[str] = Field(None, description="Địa điểm làm việc mong muốn / Desired work location / 希望勤務地")
    available_start_date: Optional[str] = Field(None, description="Ngày có thể bắt đầu đi làm / Available start date / 希望入社日")