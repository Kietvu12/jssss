# from typing import List, Optional, Annotated
# from pydantic import BaseModel, Field, BeforeValidator, field_validator

# def clean_text_logic(v):
#     """
#     Removes newlines and extra spaces.
#     Example: "2024/\n01" -> "2024/01"
#     """
#     if isinstance(v, str):
#         return v.replace('\n', ' ').replace('\r', '').strip()
#     return v

# CleanString = Annotated[str, BeforeValidator(clean_text_logic)]

# class DocumentMetadata(BaseModel):
#     creation_date: Optional[CleanString] = Field(None, description="Date of document creation (Ngày tạo tài liệu / 作成日). e.g., 2025年9月29日.")

# class EmergencyContact(BaseModel):
#     address: Optional[CleanString] = Field(None, description="Alternative contact address (Địa chỉ liên hệ khẩn cấp / 連絡先).")
#     phone: Optional[CleanString] = Field(None, description="Alternative phone number (Số điện thoại khẩn cấp).")

# class Contact(BaseModel):
#     address: Optional[CleanString] = Field(None, description="Current residential address (Địa chỉ hiện tại / 現住所).")
#     postal_code: Optional[CleanString] = Field(None, description="Postal code (Mã bưu điện / 〒).")
#     phone: Optional[CleanString] = Field(None, description="Phone number (Số điện thoại / 電話).")
#     email: Optional[CleanString] = Field(None, description="Email address (Địa chỉ Email).")
#     emergency_contact: Optional[EmergencyContact] = Field(None, description="Emergency contact info (Thông tin liên hệ khẩn cấp).")

# class PersonalInfo(BaseModel):
#     full_name_kanji: Optional[CleanString] = Field(None, description="Full Name in Native Language (Họ và tên gốc / 氏名). EXTRACT EXACTLY as seen in the image. DO NOT TRANSLATE. DO NOT TRANSLITERATE to Romaji/Kana. If text is '山田', output '山田'. If text is 'HO NGOC HOANG ANH', output 'HO NGOC HOANG ANH'.")
#     full_name_kana: Optional[CleanString] = Field(None, description="Name reading in Katakana/Hiragana (Phiên âm tên / ふりがな). Optional for non-Japanese.")
#     dob: Optional[CleanString] = Field(None, description="Date of Birth (Ngày sinh / 生年月日).")
#     age: Optional[CleanString] = Field(None, description="Age (Tuổi / 満歳). Numbers only.")
#     gender: Optional[CleanString] = Field(None, description="Gender (Giới tính / 性別). Detect circled text or checkmarks.")
#     contact: Optional[Contact] = Field(None, description="Contact information (Thông tin liên lạc).")

# class EducationItem(BaseModel):
#     year: Optional[CleanString] = Field(None, description="Year (Năm).")
#     month: Optional[CleanString] = Field(None, description="Month (Tháng).")
#     content: Optional[CleanString] = Field(None, description="School name, Major, Status. (Tên trường, Chuyên ngành, Trạng thái: Nhập học/Tốt nghiệp).")
    

# class EmploymentSummaryItem(BaseModel):
#     year: Optional[CleanString] = Field(None, description="Year (Năm).")
#     month: Optional[CleanString] = Field(None, description="Month (Tháng).")
#     content: Optional[CleanString] = Field(None, description="Brief summary: Company Name - Joined/Resigned (Tóm tắt: Tên công ty - Vào làm/Nghỉ việc).")

# class EmploymentDetailItem(BaseModel):
#     period: Optional[CleanString] = Field(None, description="Period (Giai đoạn làm việc). Format: YYYY/MM - YYYY/MM.")
#     company_name: Optional[CleanString] = Field(None, description="Company Name (Tên công ty). Keep Original.")
#     business_purpose: Optional[CleanString] = Field(None, description="Business Nature/Purpose (Lĩnh vực kinh doanh / 事業目的).")
#     scale_role: Optional[CleanString] = Field(None, description="Team Size / Role (Quy mô / Vai trò).")
#     description: Optional[CleanString] = Field(None, description="Job Description / Tasks (Mô tả công việc / 業務内容). Translate to Target Language.")
#     tools_tech: Optional[CleanString] = Field(None, description="Tools, Technologies, Environment (Công nghệ / Công cụ sử dụng).")

# class LicenseItem(BaseModel):
#     year: Optional[CleanString] = Field(None, description="Year (Năm).")
#     month: Optional[CleanString] = Field(None, description="Month (Tháng).")
#     name: Optional[CleanString] = Field(None, description="Name of License/Certificate (Tên chứng chỉ, bằng cấp / 免許・資格).")

# class SkillsAndCertifications(BaseModel):
#     licenses: List[LicenseItem] = Field(default_factory=list, description="List of licenses (Danh sách chứng chỉ).")
#     technical_skills: Optional[CleanString] = Field(None, description="Technical skills / Knowledge (Kỹ năng chuyên môn / 活かせる経験・知識・技術).")

# class Commute(BaseModel):
#     nearest_station: Optional[CleanString] = Field(None, description="Nearest Station (Ga gần nhất / 最寄り駅).")
#     line_name: Optional[CleanString] = Field(None, description="Train Line Name (Tên tuyến tàu / 線).")

# class Family(BaseModel):
#     dependents_count: Optional[CleanString] = Field(None, description="Number of dependents (Số người phụ thuộc / 扶養家族数).")
#     spouse: Optional[CleanString] = Field(None, description="Spouse status (Vợ/Chồng: Có/Không / 配偶者).")
#     spouse_obligation: Optional[CleanString] = Field(None, description="Obligation to support spouse (Nghĩa vụ nuôi dưỡng vợ/chồng / 配偶者の扶養義務).")

# class Visa(BaseModel):
#     status: Optional[CleanString] = Field(None, description="Visa/Residence Status (Tư cách lưu trú / 在留資格).")
#     expiration_date: Optional[CleanString] = Field(None, description="Visa Expiration Date (Ngày hết hạn Visa / 在留期限).")

# class AdditionalInfo(BaseModel):
#     commute: Optional[Commute] = None
#     family: Optional[Family] = None
#     visa: Optional[Visa] = None

# class SelfPromotion(BaseModel):
#     job_summary: Optional[CleanString] = Field(None, description="Professional Summary (Tóm tắt kinh nghiệm / 職務要約). Often at the beginning.")
#     self_pr: Optional[CleanString] = Field(None, description="Self-PR / Strengths (Tự giới thiệu, Điểm mạnh / 自己PR). Translate to Target Language.")
#     motivation: Optional[CleanString] = Field(None, description="Motivation for applying (Động lực ứng tuyển / 志望動機). Translate to Target Language.")
#     hobbies: Optional[CleanString] = Field(None, description="Hobbies / Special Skills (Sở thích, Đặc kỹ / 趣味･特技).")

# class Preferences(BaseModel):
#     current_salary: Optional[CleanString] = Field(None, description="Current Salary (Mức lương hiện tại / 現在年収). Handle currency units carefully.")
    
#     # Quan trọng: Đã tách Industry ra khỏi Salary để tránh lỗi
#     desired_salary: Optional[CleanString] = Field(None, description="Desired Salary (Mức lương mong muốn / 希望年収). Extract ONLY numeric values or currency (e.g., '300万円', '1000$'). DO NOT include industry names here.")
#     desired_industry: Optional[CleanString] = Field(None, description="Desired Industry (Ngành nghề mong muốn). Example: 'IT', 'Manufacturing'. Extract text like 'IT Industry' here.")
    
#     desired_job: Optional[CleanString] = Field(None, description="Desired Job/Position (Vị trí mong muốn / 希望職種).")
#     desired_location: Optional[CleanString] = Field(None, description="Desired Location (Nơi làm việc mong muốn / 希望勤務地).")
#     start_date: Optional[CleanString] = Field(None, description="Available Start Date (Ngày có thể bắt đầu làm / 希望入社日).")

# class ResumeData(BaseModel):
#     document_metadata: Optional[DocumentMetadata] = None
#     personal_info: Optional[PersonalInfo] = None
#     education_history: List[EducationItem] = Field(default_factory=list, description="Education History (Quá trình học tập).")
#     employment_history_summary: List[EmploymentSummaryItem] = Field(default_factory=list, description="Summary table for Rirekisho (Tóm tắt quá trình làm việc).")
#     employment_history_details: List[EmploymentDetailItem] = Field(default_factory=list, description="Detailed work history (Chi tiết kinh nghiệm làm việc).")
#     skills_and_certifications: Optional[SkillsAndCertifications] = None
#     additional_info: Optional[AdditionalInfo] = None
#     self_promotion: Optional[SelfPromotion] = None
#     preferences: Optional[Preferences] = None


from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator

def clean_text_logic(v):
    """
    Removes newlines and extra spaces.
    Example: "2024/\n01" -> "2024/01"
    """
    if isinstance(v, str):
        return v.replace('\n', ' ').replace('\r', '').strip()
    return v

CleanString = Annotated[str, BeforeValidator(clean_text_logic)]

class DocumentMetadata(BaseModel):
    creation_date: Optional[CleanString] = Field(None, description="Date of document creation (e.g., 2025年9月29日).")

class EmergencyContact(BaseModel):
    address: Optional[CleanString] = Field(None, description="Alternative contact address (連絡先).")
    phone: Optional[CleanString] = Field(None, description="Alternative phone number.")

class Contact(BaseModel):
    address: Optional[CleanString] = Field(None, description="Current residential address (現住所).")
    postal_code: Optional[CleanString] = Field(None, description="Postal code (〒).")
    phone: Optional[CleanString] = Field(None, description="Phone number (電話).")
    email: Optional[CleanString] = Field(None, description="Email address.")
    emergency_contact: Optional[EmergencyContact] = Field(None, description="Emergency contact info (if different from current address).")

class PersonalInfo(BaseModel):
    full_name_kanji: Optional[CleanString] = Field(None, description="Full Name in Kanji/Native (氏名).")
    full_name_kana: Optional[CleanString] = Field(None, description="Name reading in Katakana/Hiragana (ふりがな).")
    dob: Optional[CleanString] = Field(None, description="Date of Birth (生年月日).")
    age: Optional[CleanString] = Field(None, description="Age (満歳).")
    gender: Optional[CleanString] = Field(None, description="Gender (男/女). Detect circled text or checkmarks.")
    contact: Optional[Contact] = Field(None, description="Contact information.")

class EducationItem(BaseModel):
    year: Optional[CleanString] = Field(None, description="Year.")
    month: Optional[CleanString] = Field(None, description="Month.")
    content: Optional[CleanString] = Field(None, description="School name, Major, Status (Entrance/Graduation).")

class EmploymentSummaryItem(BaseModel):
    year: Optional[CleanString] = Field(None, description="Year.")
    month: Optional[CleanString] = Field(None, description="Month.")
    content: Optional[CleanString] = Field(None, description="Brief summary (Company Name - Joined/Resigned). Used for 'Rirekisho'.")

class EmploymentDetailItem(BaseModel):
    period: Optional[CleanString] = Field(None, description="Period (YYYY/MM - YYYY/MM).")
    company_name: Optional[CleanString] = Field(None, description="Company Name.")
    business_purpose: Optional[CleanString] = Field(None, description="Business Nature/Purpose (事業目的).")
    scale_role: Optional[CleanString] = Field(None, description="Team Size / Role (規模／役割).")
    description: Optional[CleanString] = Field(None, description="Job Description / Tasks (業務内容).")
    tools_tech: Optional[CleanString] = Field(None, description="Tools, Technologies, Environment (ツール).")

class LicenseItem(BaseModel):
    year: Optional[CleanString] = Field(None, description="Year.")
    month: Optional[CleanString] = Field(None, description="Month.")
    name: Optional[CleanString] = Field(None, description="Name of License/Certificate (免許・資格).")

class SkillsAndCertifications(BaseModel):
    licenses: List[LicenseItem] = Field(default_factory=list, description="List of licenses and certifications.")
    technical_skills: Optional[CleanString] = Field(None, description="Technical skills / Knowledge (活かせる経験・知識・技術).")

class Commute(BaseModel):
    nearest_station: Optional[CleanString] = Field(None, description="Nearest Station (最寄り駅).")
    line_name: Optional[CleanString] = Field(None, description="Train Line Name (線).")

class Family(BaseModel):
    dependents_count: Optional[CleanString] = Field(None, description="Number of dependents (excluding spouse).")
    spouse: Optional[CleanString] = Field(None, description="Spouse (有/無 - Yes/No).")
    spouse_obligation: Optional[CleanString] = Field(None, description="Obligation to support spouse (有/無 - Yes/No).")

class Visa(BaseModel):
    status: Optional[CleanString] = Field(None, description="Visa/Residence Status (在留資格).")
    expiration_date: Optional[CleanString] = Field(None, description="Visa Expiration Date (在留期限).")

class AdditionalInfo(BaseModel):
    commute: Optional[Commute] = None
    family: Optional[Family] = None
    visa: Optional[Visa] = None

class SelfPromotion(BaseModel):
    job_summary: Optional[CleanString] = Field(None, description="Professional Summary (職務要約). Often at the beginning of Work History.")
    self_pr: Optional[CleanString] = Field(None, description="Self-PR / Strengths (自己PR).")
    motivation: Optional[CleanString] = Field(None, description="Motivation for applying (志望動機).")
    hobbies: Optional[CleanString] = Field(None, description="Hobbies / Special Skills (趣味･特技).")

class Preferences(BaseModel):
    current_salary: Optional[CleanString] = Field(None, description="Current Salary (現在年収).")
    desired_salary: Optional[CleanString] = Field(None, description="Desired Salary (希望年収). Look inside '本人希望記入欄' (Personal Requests) box.")
    desired_job: Optional[CleanString] = Field(None, description="Desired Job/Position (希望職種).")
    desired_location: Optional[CleanString] = Field(None, description="Desired Location (希望勤務地).")
    start_date: Optional[CleanString] = Field(None, description="Available Start Date (希望入社日).")

class ResumeData(BaseModel):
    document_metadata: Optional[DocumentMetadata] = None
    personal_info: Optional[PersonalInfo] = None
    education_history: List[EducationItem] = Field(default_factory=list)
    employment_history_summary: List[EmploymentSummaryItem] = Field(default_factory=list, description="Summary table for Rirekisho.")
    employment_history_details: List[EmploymentDetailItem] = Field(default_factory=list, description="Detailed table for Shokumu Keirekisho.")
    skills_and_certifications: Optional[SkillsAndCertifications] = None
    additional_info: Optional[AdditionalInfo] = None
    self_promotion: Optional[SelfPromotion] = None
    preferences: Optional[Preferences] = None