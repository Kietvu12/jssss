from fastapi import FastAPI, APIRouter, HTTPException, UploadFile
from litellm import acompletion
from models.jd_schema import JobPosting
import instructor
import yaml
from dotenv import load_dotenv

from utils.utils import get_memory_usage, extract_text_from_file, caculate_price
from utils.prompt import get_jd_system_prompt

load_dotenv()

with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

MODEL = config['LLM_Model']['parse_model']

router = APIRouter(
    prefix='/jd',
    tags=['Job Description Parser']
)

client = instructor.from_litellm(acompletion)

@router.post('/parse-jd', response_model=JobPosting)
async def parse_job_description(file: UploadFile, lang: str):
    mem_before = get_memory_usage()
    print(f"📉 RAM trước khi xử lý: {mem_before:.2f} MB")

    JD_SYSTEM_PROMPT = get_jd_system_prompt(lang)

    combined_content = ""

    if not file.filename.lower().endswith(('.pdf', '.xlsx', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="File không hợp lệ. Chỉ hỗ trợ PDF, XLSX, DOC, DOCX.")
    try:
        text = extract_text_from_file(file.file, file.filename)
        combined_content += f"\n--- START OF FILE {file.filename} ---\n{text}\n"
    except Exception as e:
        print(f"Lỗi đọc file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi đọc file {file.filename}")

    print('x' * 20)
    if not combined_content.strip():
        raise HTTPException(status_code=400, detail="Không trích xuất được nội dung.")

    try:
        jd_data, raw_response = await client.chat.completions.create_with_completion(
            model=MODEL,
            messages=[
                {'role': 'system', 'content': JD_SYSTEM_PROMPT},
                {'role': 'user', 'content': combined_content}
            ],
            response_model=JobPosting,
            temperature=0,
        ) 
        try:
            usage = raw_response.usage
            cost = caculate_price(usage.prompt_tokens, usage.completion_tokens, model_name=raw_response.model)
            print("\n" + "="*40)
            print("📊 TOKEN USAGE & COST REPORT")
            print("="*40)
            print(f"🔹 Model:             {raw_response.model}")
            print(f"🔹 Prompt Tokens:     {usage.prompt_tokens}")
            print(f"🔹 Completion Tokens: {usage.completion_tokens}")
            print(f"🔹 Total Tokens:      {usage.total_tokens}")
            print(f"💵 Estimated Cost:    ${cost:.6f}")
            print("="*40 + "\n")
        except Exception as e:
            print(f"⚠️ Không thể tính token: {e}")
        mem_after = get_memory_usage()
        print(f"📈 RAM sau khi xử lý: {mem_after:.2f} MB")
        print(f"⚠️ Chênh lệch: {mem_after - mem_before:.2f} MB")
        return jd_data
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    app = FastAPI()
    app.include_router(router)
    uvicorn.run(app, host="0.0.0.0", port=8000)