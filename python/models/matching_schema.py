from pydantic import BaseModel, Field
from typing import List, Optional, Union 

class JobMatch(BaseModel):
    """Schema cho kết quả matching chi tiết"""
    job_id: Union[str, int] = Field(..., description="ID công việc")
    job_title: str = Field(..., description="Tiêu đề công việc")
    company: Optional[str] = Field("Unknown", description="Tên công ty")
    vector_score: float = Field(..., description="Điểm thô từ Qdrant (VD: 0.812)")
    llm_score: Optional[int] = Field(None, description="Điểm 0-100 do AI chấm dựa trên logic tuyển dụng")
    matching_reason: Optional[str] = Field(None, description="Lý do chi tiết tại sao AI thấy phù hợp/không phù hợp")

class JobMatchResponse(BaseModel):
    """Schema cho response trả về"""
    success: bool
    message: str
    total_matches: int
    matches: List[JobMatch]