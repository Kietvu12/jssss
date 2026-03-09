from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, APIRouter
from fastapi.concurrency import run_in_threadpool
from litellm import acompletion
import instructor
from dotenv import load_dotenv
import yaml

from models.candidate_schema import CandidateProfile
from utils.utils import extract_text_from_file, get_memory_usage, caculate_price
from utils.prompt import RESUME_SYSTEM_PROMPT

load_dotenv()

with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

MODEL = config['LLM_Model']['parse_model']

router = APIRouter(
    prefix="/resume",
    tags=["Resume Parser"]
)
client = instructor.from_litellm(acompletion)

@router.post("/parse-candidate", response_model=CandidateProfile)
async def parse_candidate_documents(files: List[UploadFile] = File(...)):
    combined_content = ""
    mem_before = get_memory_usage()
    print(f"📉 RAM trước khi xử lý: {mem_before:.2f} MB")

    for idx, file in enumerate(files):
        if not file.filename.lower().endswith(('.pdf', '.xlsx', '.doc', '.docx')):
            continue
        try:
            text = await run_in_threadpool(extract_text_from_file, file.file, file.filename)
            combined_content += f"\n--- START OF FILE {idx+1}: {file.filename} ---\n{text}\n"
        except Exception as e:
            print(f"Lỗi đọc file {file.filename}: {e}")
            continue

    if not combined_content.strip():
        raise HTTPException(status_code=400, detail="Không trích xuất được nội dung.")
    # print('x' * 20)
    try:
        candidate_data, raw_response = await client.chat.completions.create_with_completion(
            model=MODEL,
            messages=[
                {'role': 'system', 'content': RESUME_SYSTEM_PROMPT},
                {'role': 'user', 'content': combined_content}
            ],
            response_model=CandidateProfile,
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
        return candidate_data

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    app = FastAPI()
    app.include_router(router)
    uvicorn.run(app, host="0.0.0.0", port=8000)
