import base64
import pdfplumber
from models.candidate_schema import CandidateProfile
from models.schema import ResumeData
from .tracker import TokenTracker
from litellm import embedding, completion_cost
import docx
import pandas as pd
from io import BytesIO
import psutil
import os

def encode_image(image):
    import io
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

#ResumeData
def parse_resume_to_string(cv: ResumeData) -> str:
    """
    Chuyển đổi ResumeData thành chuỗi văn bản ngữ nghĩa tối ưu cho Embedding.
    Cấu trúc ưu tiên: Mong muốn (Title/Loc) -> Kỹ năng (Reqs) -> Kinh nghiệm (Desc).
    """
    full_text_parts = []

    if cv.preferences:
        pref_parts = []
        if cv.preferences.desired_job:
            pref_parts.append(f"Vị trí mong muốn: {cv.preferences.desired_job}")
        if cv.preferences.desired_location:
            pref_parts.append(f"Địa điểm làm việc mong muốn: {cv.preferences.desired_location}")
        
        if pref_parts:
            full_text_parts.append(". ".join(pref_parts))

    # 2. KỸ NĂNG & CHỨNG CHỈ (Matching với Job Requirements)
    if cv.skills_and_certifications:
        skill_parts = []
        # Kỹ năng cứng
        if cv.skills_and_certifications.technical_skills:
            skill_parts.append(f"Kỹ năng chuyên môn: {cv.skills_and_certifications.technical_skills}")
        
        # Chứng chỉ (Rất quan trọng với job tiếng Nhật/IT)
        if cv.skills_and_certifications.licenses:
            lic_names = [l.name for l in cv.skills_and_certifications.licenses if l.name]
            if lic_names:
                skill_parts.append(f"Chứng chỉ/Bằng cấp: {', '.join(lic_names)}")
        
        if skill_parts:
            full_text_parts.append(" | ".join(skill_parts))

    if cv.employment_history_details:
        history_texts = []
        for job in cv.employment_history_details[:3]:
            job_desc = f"Vai trò {job.scale_role or 'Nhân viên'} tại {job.company_name or 'công ty'}"
            
            if job.business_purpose:
                job_desc += f" (Lĩnh vực: {job.business_purpose})"
            
            if job.description:
                job_desc += f". Mô tả: {job.description}"
                
            if job.tools_tech:
                job_desc += f". Công nghệ sử dụng: {job.tools_tech}"
            
            history_texts.append(job_desc)
        
        if history_texts:
            full_text_parts.append("Kinh nghiệm làm việc:\n" + "\n".join(history_texts))

    if cv.self_promotion:
        pr_parts = []
        if cv.self_promotion.job_summary:
            pr_parts.append(f"Tóm tắt hồ sơ: {cv.self_promotion.job_summary}")
        if cv.self_promotion.self_pr:
            pr_parts.append(f"Điểm mạnh bản thân: {cv.self_promotion.self_pr}")
        
        if pr_parts:
            full_text_parts.append("\n".join(pr_parts))

    # 5. HỌC VẤN (Thường ít quan trọng hơn kinh nghiệm, để cuối)
    if cv.education_history:
        edu_texts = [f"{e.content}" for e in cv.education_history if e.content]
        if edu_texts:
            full_text_parts.append(f"Học vấn: {', '.join(edu_texts)}")

    # Nối tất cả lại thành một đoạn văn bản
    return "\n\n".join(full_text_parts)

#CandidateProfile
def parse_candidate_profile_to_string(candidate: CandidateProfile) -> str:
    """
    Chuyển đổi CandidateProfile thành chuỗi tối ưu cho Semantic Search với Job.
    Chiến lược: Mapping 1-1 với cấu trúc Job (Title, Location, Skills, Description).
    """
    full_text_parts = []
    
    roles = []
    if candidate.rirekisho and candidate.rirekisho.desired_role:
        roles.append(candidate.rirekisho.desired_role)
    
    if candidate.shokumu_keirekisho and candidate.shokumu_keirekisho.job_history:
        recent_roles = [job.team_size_role for job in candidate.shokumu_keirekisho.job_history[:2] if job.team_size_role]
        roles.extend(recent_roles)
        
    if roles:
        full_text_parts.append(f"Title/Role: {', '.join(set(roles))}")

    if candidate.rirekisho:
        locs = []
        if candidate.rirekisho.desired_location:
            locs.append(candidate.rirekisho.desired_location)
        if candidate.rirekisho.address:
            locs.append(candidate.rirekisho.address)
        
        if locs:
            full_text_parts.append(f"Địa điểm: {', '.join(locs)}")

    skills = set()
    
    if candidate.shokumu_keirekisho and candidate.shokumu_keirekisho.skills_and_knowledge:
        skills.update(candidate.shokumu_keirekisho.skills_and_knowledge)
        
    if candidate.shokumu_keirekisho and candidate.shokumu_keirekisho.job_history:
        for job in candidate.shokumu_keirekisho.job_history:
            if job.tools:
                skills.update(job.tools)

    certs = []
    if candidate.shokumu_keirekisho and candidate.shokumu_keirekisho.qualifications:
        certs.extend([q.name for q in candidate.shokumu_keirekisho.qualifications])
    if candidate.rirekisho and candidate.rirekisho.licenses_qualifications:
        certs.extend([l.name for l in candidate.rirekisho.licenses_qualifications])
    
    req_text = "Yêu cầu kỹ năng: "
    if skills:
        req_text += f"Tech Stack ({', '.join(skills)}). "
    if certs:
        req_text += f"Chứng chỉ ({', '.join(set(certs))})."
    
    full_text_parts.append(req_text)

    if candidate.shokumu_keirekisho and candidate.shokumu_keirekisho.job_history:
        exp_parts = []
        for job in candidate.shokumu_keirekisho.job_history:
            job_str = f"Dự án: {job.business_objective or 'N/A'}. "
            job_str += f"Vai trò: {job.team_size_role}. "
            job_str += f"Nhiệm vụ: {job.responsibilities}. "
            if job.tools:
                job_str += f"Công nghệ: {', '.join(job.tools)}."
            exp_parts.append(job_str)
        
        full_text_parts.append(f"Mô tả kinh nghiệm: {' '.join(exp_parts)}")

    pr_text = ""
    if candidate.shokumu_keirekisho and candidate.shokumu_keirekisho.self_pr:
        pr_text += candidate.shokumu_keirekisho.self_pr
    elif candidate.rirekisho and candidate.rirekisho.self_pr:
        pr_text += candidate.rirekisho.self_pr
        
    if pr_text:
        full_text_parts.append(f"Giới thiệu: {pr_text}")

    return "\n\n".join(full_text_parts)

def extract_text_from_file(file_obj, filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    full_text = ""
    
    try:
        if ext == 'pdf':
            with pdfplumber.open(file_obj) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
        
        elif ext in ['doc', 'docx']:
            doc = docx.Document(file_obj)
            full_text = "\n".join([para.text for para in doc.paragraphs])
            
        elif ext in ['xls', 'xlsx']:
            dict_df = pd.read_excel(file_obj, sheet_name=None, header=None)
            for sheet_name, df in dict_df.items():
                # Xóa các dòng và cột hoàn toàn rỗng (NaN toàn bộ)
                df = df.dropna(how="all", axis=0).dropna(how="all", axis=1)
                
                # Nếu sheet trống sau khi lọc thì bỏ qua
                if df.empty:
                    continue

                full_text += f"--- SHEET: {sheet_name} ---\n"

                # Duyệt từng dòng
                for _, row in df.iterrows():
                    # Lọc lấy các ô có dữ liệu thực (bỏ ô trống/NaN)
                    # Giữ nguyên nội dung, không cắt chuỗi
                    valid_cells = [
                        str(val).strip() 
                        for val in row 
                        if str(val).strip() != "" and str(val).lower() != "nan"
                    ]
                    
                    # Chỉ thêm vào text nếu dòng đó có dữ liệu
                    if valid_cells:
                        # Dùng dấu " | " để ngăn cách các cột
                        row_text = " | ".join(valid_cells)
                        full_text += row_text + "\n"
        
        else:
            return f"[Lỗi: Định dạng .{ext} chưa được hỗ trợ]"

    except Exception as e:
        print(f"Lỗi khi đọc file {filename}: {e}")
        return ""
        
    return full_text

def get_memory_usage():
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    return mem_info.rss / 1024 / 1024

def caculate_price(input_usage, output_usage = None, model_name: str = "openai/text-embedding-3-small"):
    """Tính chi phí dựa trên token sử dụng và model"""
    pricing = {
        "text-embedding-3-small": {"input": 0.02},
        "gpt-4o-mini-2024-07-18": {'input': 0.15, 'output': 0.6}
    }
    
    if model_name not in pricing:
        raise ValueError(f"Giá cho model {model_name} chưa được định nghĩa.")
    
    input_cost = (input_usage / 1000000) * pricing[model_name]["input"]
    if output_usage is None or "output" not in pricing[model_name]:
        output_cost = 0
    else:
        output_cost = (output_usage / 1000000) * pricing[model_name]["output"]
    
    total_cost = input_cost + output_cost
    return total_cost