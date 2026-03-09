from pydantic import BaseModel, Field
from typing import List, Optional

class ProjectExperience(BaseModel):
    period_start: Optional[str]= Field(None, description="Thời điểm bắt đầu (Ví dụ: 2021年04月) / Start period / 開始時期")
    period_end: Optional[str] = Field(None, description="Thời điểm kết thúc hoặc 'Hiện tại' / End period or 'Present' / 終了時期または現在")
    company_name: str = Field(..., description="Tên công ty / Company name / 株式会社○○○○○")
    business_objective: Optional[str] = Field(None, description="Mục đích kinh doanh của dự án/công ty / Business objective / 【事業目的】")
    team_size_role: Optional[str] = Field(None, description="Quy mô dự án và vai trò của bản thân / Team size and role / 規模／役割")
    responsibilities: Optional[str] = Field(None, description="Nội dung công việc chi tiết / Job responsibilities / 【業務内容】")
    tools: Optional[List[str]] = Field(None, description="Công cụ và công nghệ sử dụng / Tools and technologies / 【ツール】")

class QualificationEntry(BaseModel):
    name: str = Field(..., description="Tên chứng chỉ / Qualification name / 資格名")
    acquired_date: Optional[str] = Field(None, description="Ngày cấp (Ví dụ: 20xx年xx月) / Date acquired / 取得年月")

class ShokumuKeirekishoSchema(BaseModel):
    creation_date: Optional[str] = Field(None, description="Ngày tạo tài liệu (Ví dụ: 2025年09月29日) / Date of document creation / 20xx年xx月xx日現在")
    full_name: Optional[str] = Field(None, description="Họ và tên / Full name / 氏名")
    
    summary: Optional[str] = Field(None, description="Tóm tắt quá trình làm việc / Career summary / ■職務要約")
    
    job_history: List[ProjectExperience] = Field(..., description="Lịch sử công việc chi tiết / Detailed job history / ■職務経歴")
    
    skills_and_knowledge: List[str] = Field(..., description="Các kinh nghiệm, kiến thức và kỹ năng có thể phát huy / Key skills, knowledge and experience / ■活かせる経験・知識・技術")
    
    qualifications: List[QualificationEntry] = Field(..., description="Danh sách bằng cấp, chứng chỉ / List of qualifications / ■資格")
    
    self_pr: str = Field(..., description="Tự quảng bá bản thân (Điểm mạnh) / Self-promotion / ■自己PR")