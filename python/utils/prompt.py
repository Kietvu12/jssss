from typing import List, Dict
import json

RESUME_SYSTEM_PROMPT = f'''ROLE: Expert HR Parser for Resumes.
TASK: Parse the input text (which may contain a Rirekisho, a Shokumu Keirekisho, or BOTH) into the specified JSON structure.

### RULES:
1. **Source Identification:** The input text may come from multiple PDF files concatenated together. You must intelligently separate the information.
2. **Rirekisho Field:** If you find basic profile info (Name, Address, Education, Simple Work History table), map it to the `rirekisho` field.
3. **Shokumu Keirekisho Field:** If you find detailed project descriptions, technical skills, specific roles (Business content, Scale), map it to the `shokumu_keirekisho` field.
4. **Missing Documents:** - If ONLY Rirekisho text is present, return `shokumu_keirekisho`: null.
   - If ONLY Shokumu Keirekisho text is present, return `rirekisho`: null.
   - If BOTH are present, fill BOTH fields.
'''

def generate_matching_reasons_sync(candidate_summary: str, jobs_context):
    prompt = f"""
    You are an HR Expert. Analyze why the Candidate matches these Jobs.
    
    CANDIDATE PROFILE:
    {candidate_summary}
    
    JOB LIST:
    {json.dumps(jobs_context, ensure_ascii=False)}
    
    TASK:
    For each job, provide:
    1. "score": An integer from 0 to 100 representing the match quality.
       - 90-100: Perfect match (Skills, Experience, Role align perfectly).
       - 70-89: Good match (Minor gaps but trainable).
       - <70: Poor match.
    2. "reason": A short explanation (1-2 sentences in Vietnamese) focusing on matching/missing skills and salary.

    OUTPUT FORMAT (JSON Object):
    {{
        "job_id_1": {{ "score": 95, "reason": "Ứng viên có đủ kỹ năng Java và AWS..." }},
        "job_id_2": {{ "score": 60, "reason": "Thiếu kinh nghiệm về VueJS..." }}
    }}
    """
    return prompt

def get_jd_system_prompt(target_language: str) -> str:
    lang_instruction = ""
    
    # Custom chỉ dẫn tùy theo ngôn ngữ để LLM hiểu rõ hơn context
    if target_language.lower() in ['vi', 'vietnamese', 'tiếng việt']:
        lang_name = "Vietnamese (Tiếng Việt)"
    elif target_language.lower() in ['en', 'english', 'tiếng anh']:
        lang_name = "English"
    elif target_language.lower() in ['jp', 'ja', 'japanese', 'tiếng nhật']:
        lang_name = "Japanese (Tiếng Nhật)"
    else:
        lang_name = target_language

    return f"""
    You are an expert HR Data Extraction Specialist and Translator.
    
    YOUR TASK:
    1. Analyze the provided Job Description (JD) text, which may be in any language or mixed languages.
    2. Extract all relevant information to populate the `JobPosting` schema.
    3. **CRITICAL: TRANSLATION REQUIREMENT**: 
       - All free-text fields (such as `job_description`, `requirements`, `benefits`, `job_title`, `company_overview`, etc.) MUST be translated into **{lang_name}**.
       - If the original text is already in **{lang_name}**, keep it original and refine it for professional clarity.
       - Do NOT translate technical terms that are commonly used in English (e.g., Python, Java, ReactJS, AI) unless standard in the target language.

    4. **ENUM MAPPING**:
       - For fields like `industry`, `job_category`, `employment_type`, select the Enum option that best fits the meaning of the job, regardless of the language in the Enum definition.
    
    5. **DATA NORMALIZATION**:
       - Convert salary to numbers (min/max). If currency is not specified but implied by location (e.g., Vietnam), assume local currency or USD as per context.
       - Extract explicit criteria for 'must_have' vs 'preferred'.

    Output strictly in the requested JSON schema structure.
    """