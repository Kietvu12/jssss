from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class IndustryType(str, Enum):
    """
    Danh mục ngành nghề (Mapping từ file Lĩnh vực.csv).
    Hỗ trợ map từ tiếng Việt, Anh, Nhật về mã chuẩn.
    """
    TELECOM_INTERNET = "Viễn thông – Internet / Telecommunications – Internet / 通信・インターネット"
    IT_SOFTWARE = "Công nghệ thông tin (IT) / Information Technology (IT) / 情報技術（IT）"
    HR_RECRUITMENT = "Nhân sự – Dịch vụ giới thiệu nhân sự / Human Resources / 人材サービス・人材紹介"
    ADVERTISING_MEDIA = "Quảng cáo – Truyền thông / Advertising – Media / 広告・メディア・放送"
    RETAIL_WHOLESALE = "Bán lẻ – Bán buôn / Retail – Wholesale / 小売・卸売"
    REAL_ESTATE = "Bất động sản / Real Estate / 不動産"
    FINANCE_BANKING = "Tài chính – Ngân hàng / Finance – Banking / 金融・銀行"
    INSURANCE = "Bảo hiểm / Insurance / 保険"
    FOOD_BEVERAGE = "Nhà hàng – Ăn uống / Food & Beverage / 飲食"
    LIFESTYLE_SERVICES = "Dịch vụ đời sống / Lifestyle Services / 生活関連サービス"
    EDUCATION_TRAINING = "Giáo dục – Đào tạo / Education – Training / 教育・研修"
    MANUFACTURING = "Sản xuất – Chế tạo / Manufacturing / 製造・ものづくり"
    CONSULTING = "Quản lý – Tư vấn / Management – Consulting / 経営・コンサルティング"
    HEALTHCARE = "Y tế – Chăm sóc sức khỏe / Healthcare / 医療・ヘルスケア"
    PHARMA_BIO = "Dược phẩm – Công nghệ sinh học / Pharmaceuticals – Biotechnology / 医薬品・バイオテクノロジー"
    LOGISTICS_TRANSPORT = "Vận tải – Giao thông – Logistics / Transportation – Logistics / 運輸・交通・物流"
    HOTEL_HOSPITALITY = "Khách sạn – Lưu trú / Hotel – Accommodation / ホテル・宿泊"
    LEGAL = "Pháp luật – Pháp lý / Legal / 法律・法務"
    ENERGY_MINING = "Khai khoáng – Năng lượng / Mining – Energy / 鉱業・電力・ガス・水道・エネルギー"
    NON_PROFIT = "Tổ chức công ích – Phi lợi nhuận / Non-profit / 公益法人・非営利団体"
    GOVERNMENT = "Cơ quan nhà nước – Hành chính / Government / 官公庁・行政"
    CONSTRUCTION = "Xây dựng – Sửa chữa / Construction / 建設・修理・メンテナンス"
    ARTS_ENTERTAINMENT = "Nghệ thuật – Giải trí / Arts – Entertainment / 芸術・娯楽・レジャー"
    AGRICULTURE = "Nông nghiệp – Lâm nghiệp – Thủy sản / Agriculture / 農業・林業・水産業"
    AEROSPACE_DEFENSE = "Hàng không vũ trụ – Quốc phòng / Aerospace – Defense / 航空宇宙・防衛"
    OTHER = "Khác / Other / その他"

class JobCategory(str, Enum):
    """
    Phân loại vị trí công việc (Mapping từ file Map.csv).
    """
    SALES = "Kinh doanh - Sales / Sales / 営業"
    PLANNING_MANAGEMENT = "Kế hoạch - Quản lý / Planning - Management / 企画・管理"
    IT_ENGINEER = "IT (SE, kỹ sư hạ tầng, kỹ sư web) / IT Engineer / ITエンジニア"
    EMBEDDED_ENGINEER = "Kỹ thuật (Lập trình nhúng) / Embedded Engineer / 組込・制御系エンジニア"
    MECH_ELEC_ENGINEER = "Kỹ thuật (cơ khí, điện – điện tử) / Mechanical - Electrical Engineer / 機電エンジニア"
    CHEMICAL_MATERIAL = "Kỹ thuật (hóa học, vật liệu) / Chemical - Material / 化学・素材"
    FOOD_TECH = "Kỹ thuật (thực phẩm, hương liệu) / Food Tech / 食品・香料"
    CONSTRUCTION_ARCH = "Kỹ thuật xây dựng - hạ tầng / Construction - Architecture / 建築・土木"
    PROFESSIONAL_SERVICES = "Chuyên gia tư vấn - Luật - Tài chính / Professional Services / 専門職"
    CREATIVE_DESIGN = "Sáng tạo (Truyền thông - Thiết kế) / Creative - Design / クリエイティブ"
    SALES_SERVICE = "Bán hàng - Dịch vụ / Sales Service / 販売・サービス"
    ADMIN_ASSISTANT = "Hành chính - Trợ lý / Admin - Assistant / 事務・アシスタント"
    MEDICAL_WELFARE = "Y tế - Điều dưỡng / Medical - Welfare / 医療・福祉"
    EDUCATION_PUBLIC = "Giáo dục - Công chức / Education - Public Service / 教育・公務員"
    OTHER = "Khác / Other / その他"

class EmploymentType(str, Enum):
    FULL_TIME = "Nhân viên chính thức / Full-time / 正社員"
    CONTRACT = "Hợp đồng / Contract / 契約社員"
    PART_TIME = "Bán thời gian / Part-time / アルバイト"
    INTERN = "Thực tập / Internship / インターン"

class SalaryInfo(BaseModel):
    currency: str = Field(..., description="Đơn vị tiền tệ (VND, USD, JPY). Default: VND")
    min_salary: Optional[float] = Field(None, description="Mức lương tối thiểu (số).")
    max_salary: Optional[float] = Field(None, description="Mức lương tối đa (số).")
    salary_details: Optional[str] = Field(None, description="Chi tiết về thu nhập / Salary Details / 給与詳細")
    bonus_details: Optional[str] = Field(None, description="Thưởng / Bonus / 賞与")
    raise_details: Optional[str] = Field(None, description="Tăng lương / Promotion-Raise / 昇給")

class CompanyInfo(BaseModel):
    name: Optional[str] = Field(None, description="Tên công ty / Company Name / 会社名")
    listing_status: Optional[str] = Field(None, description="Thông tin trên sàn chứng khoán / Public Listing / 株式公開")
    industry_class: Optional[str] = Field(None, description="Phân loại lĩnh vực kinh doanh chi tiết / Industry Classification / 業種分類")
    revenue: Optional[str] = Field(None, description="Doanh thu / Revenue / 売上高")
    capital: Optional[str] = Field(None, description="Vốn đầu tư / Capital / 資本金")
    employee_count: Optional[str] = Field(None, description="Số nhân viên / Number of Employees / 従業員数")
    established_year: Optional[str] = Field(None, description="Năm thành lập / Established Date / 設立年月")
    headquarter: Optional[str] = Field(None, description="Trụ sở tại / Head Office Location / 本社所在地")
    overview: Optional[str] = Field(None, description="Giới thiệu chung / Company Overview / 会社概要")

class JobPosting(BaseModel):
    """
    Schema chính để parse thông tin tuyển dụng từ JD (Hỗ trợ 3 ngôn ngữ: VN, EN, JP).
    LLM sẽ trích xuất thông tin vào cấu trúc này.
    """
    job_code: Optional[str] = Field(None, description="Mã tin tuyển dụng / Job ID / 求人ID")
    job_title: str = Field(..., description="Tiêu đề việc làm / Job Title / 求人名")
    
    industry: Optional[IndustryType] = Field(
        None, 
        description="Lĩnh vực hoạt động chính. Chọn giá trị phù hợp nhất từ danh sách."
    )
    job_category: Optional[JobCategory] = Field(
        None, 
        description="Phân loại nghề nghiệp (Map.csv). Chọn giá trị phù hợp nhất."
    )
    employment_type: Optional[EmploymentType] = Field(
        None, 
        description="Hình thức tuyển dụng / Employment Type / 雇用形態"
    )
    visa_status: Optional[str] = Field(
        None, 
        description="Tư cách lưu trú / Visa Status / 在留資格 (Ví dụ: Kỹ thuật - Nhân văn / Engineer Visa)"
    )

    # --- Recruitment Specs ---
    headcount: Optional[int] = Field(None, description="Số lượng tuyển dụng / Number of Openings / 採用人数")
    experience_job: Optional[str] = Field(
        None, 
        description="Số năm kinh nghiệm vị trí / Required Years of Experience (Job) / 必要な経験年数（職種）"
    )
    experience_industry: Optional[str] = Field(
        None, 
        description="Số năm kinh nghiệm ngành / Required Years of Experience (Industry) / 必要な経験年数（業種）"
    )

    # --- Content ---
    features: List[str] = Field(
        default_factory=list, 
        description="Điểm nổi bật / Job Features / 特徴 (List of tags e.g. 'Urgent', 'No test')"
    )
    description: Optional[str] = Field(
        None, 
        description="Mô tả công việc chi tiết / Job Description / 仕事内容"
    )
    hiring_reason: Optional[str] = Field(
        None, 
        description="Lý do tuyển dụng / Hiring Background / 募集背景"
    )
    requirements_must: Optional[str] = Field(
        None, 
        description="Điều kiện ứng tuyển bắt buộc / Mandatory Requirements / 応募条件（必須）"
    )
    requirements_preferred: Optional[str] = Field(
        None, 
        description="Điều kiện ưu tiên / Preferred Qualifications / 歓迎条件"
    )

    # --- Conditions ---
    salary: Optional[SalaryInfo] = Field(None, description="Thông tin lương thưởng")
    
    location: Optional[str] = Field(
        None, 
        description="Địa điểm làm việc / Location / 勤務地"
    )
    working_hours: Optional[str] = Field(
        None, 
        description="Thời gian làm việc / Working Hours / 勤務時間"
    )
    overtime_details: Optional[str] = Field(
        None, 
        description="Chi tiết làm thêm giờ / Overtime Details / 月平均残業時間"
    )
    benefits: Optional[str] = Field(
        None, 
        description="Chế độ phúc lợi / Benefits / 福利厚生"
    )
    holidays: Optional[str] = Field(
        None, 
        description="Ngày nghỉ / Holidays / 休日"
    )
    probation: Optional[str] = Field(
        None, 
        description="Thử việc / Probation Period / 試用期間"
    )
    
    # --- Process & Company ---
    recruitment_process: Optional[str] = Field(
        None, 
        description="Quy trình tuyển dụng / Selection Flow / 選考フロー"
    )
    company: Optional[CompanyInfo] = Field(None, description="Thông tin công ty")