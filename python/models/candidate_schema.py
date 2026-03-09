from pydantic import BaseModel, Field
from typing import Optional

from models.cv_schema import RirekishoSchema
from models.work_history_schema import ShokumuKeirekishoSchema

class CandidateProfile(BaseModel):
    """
    Schema tổng hợp xử lý linh hoạt cho cả 2 trường hợp:
    1. Ứng viên gửi 2 file riêng biệt.
    2. Ứng viên gửi 1 file gộp chung (CV + Kinh nghiệm).
    """
    rirekisho: Optional[RirekishoSchema] = Field(
        None, 
        description="Extract generic/personal information: Basic Info, Education, Contact, and simple Work History summary. (Thông tin cơ bản, Học vấn, Liên lạc)."
    )
    shokumu_keirekisho: Optional[ShokumuKeirekishoSchema] = Field(
        None, 
        description="Extract detailed professional experience: Projects, Technical Skills, Self-PR regarding career. If the input file contains detailed project history, map it here regardless of the file header. (Kinh nghiệm chuyên môn chi tiết, Dự án, Kỹ năng)."
    )