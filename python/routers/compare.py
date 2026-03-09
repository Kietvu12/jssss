from fastapi import APIRouter, HTTPException, FastAPI
from dotenv import load_dotenv
import yaml
from typing import List, Dict, Optional
import json
from litellm import acompletion, aembedding
import numpy as np
import os
import faiss
import pickle
import aiomysql 

from models.candidate_schema import CandidateProfile
from utils.utils import parse_candidate_profile_to_string, get_memory_usage, caculate_price
from models.matching_schema import JobMatch, JobMatchResponse

load_dotenv()

router = APIRouter(
    prefix="/compare",
    tags=["Job Matching"]
)

# Load config
with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# DB Config
DB_CONFIG = { 
    "host": config['Db']['host'], 
    "user": config['Db']['user'], 
    "password": config['Db']['password'], 
    "database": config['Db']['database'], 
    "port": config['Db']['port'] 
}

# Embedding config
EMBEDDING_MODEL = config['LLM_Model']['embedding_model']
VECTOR_SIZE = config['LLM_Model']['vector_size']
MODEL = config['LLM_Model']['parse_model']

#Faiss
FAISS_FOLDER = config['faiss']['path']
INDEX_FILE = config['faiss']['index_file']
MAP_FILE = config['faiss']['payload_file']

print("⏳ Đang khởi tạo hệ thống...")
try:
    index_path = os.path.join(FAISS_FOLDER, INDEX_FILE)
    if os.path.exists(index_path):
        index = faiss.read_index(index_path, faiss.IO_FLAG_MMAP)
    else:
        index = None
        print(f"⚠️ Cảnh báo: Không tìm thấy {index_path}")

    map_path = os.path.join(FAISS_FOLDER, MAP_FILE)
    if os.path.exists(map_path):
        with open(map_path, "rb") as f:
            job_ids_list = pickle.load(f)
    else:
        job_ids_list = []
        print(f"⚠️ Cảnh báo: Không tìm thấy {map_path}")

    print("✅ Đã load xong dữ liệu Faiss & ID Map!")
except Exception as e:
    print(f"❌ Lỗi khi load dữ liệu: {e}")
    index = None
    job_ids_list = []

async def get_jobs_from_mysql(ids_list):
    """Query trực tiếp MySQL để lấy thông tin chi tiết của các Job ID (async)"""
    if not ids_list: return {}
    
    try:
        conn = await aiomysql.connect(**DB_CONFIG)
        cursor = await conn.cursor(aiomysql.DictCursor)
        
        placeholders = ', '.join(['%s'] * len(ids_list))
        
        sql = f"""
            SELECT 
                j.id, 
                j.title, 
                j.description, 
                c.name as company, 
                GROUP_CONCAT(DISTINCT w.location SEPARATOR ', ') as full_locations,
                GROUP_CONCAT(DISTINCT r.content SEPARATOR '\n') as full_requirements
            FROM jobs j
            LEFT JOIN requirements r ON j.id = r.job_id
            LEFT JOIN working_locations w ON j.id = w.job_id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE j.id IN ({placeholders})
            GROUP BY j.id
        """
        
        await cursor.execute(sql, ids_list)
        results = await cursor.fetchall()
        await cursor.close()
        conn.close()
        
        jobs_map = {}
        for row in results:
            loc_str = row['full_locations'] or ""
            
            jobs_map[row['id']] = {
                "title": row['title'],
                "company": row.get('company', 'Unknown Company'),
                "location": loc_str.split(', ') if loc_str else [],
                "requirements": (row['full_requirements'] or ""),
                "full_requirements": row['full_requirements'] or ""
            }
        return jobs_map
    except Exception as e:
        print(f"❌ Lỗi MySQL: {e}")
        return {}

async def get_embedding(text: str):
    """Tạo embedding bất đồng bộ"""
    response = await aembedding(
        model=EMBEDDING_MODEL,
        input=[text.replace("\n", " ")],
        dimensions=VECTOR_SIZE
    )
    try:
            usage = response.usage
            cost = caculate_price(usage.prompt_tokens, usage.completion_tokens, model_name=response.model)
            print("\n" + "="*40)
            print("📊 TOKEN USAGE & COST REPORT")
            print("="*40)
            print(f"🔹 Model:             {response.model}")
            print(f"🔹 Prompt Tokens:     {usage.prompt_tokens}")
            print(f"🔹 Completion Tokens: {usage.completion_tokens}")
            print(f"🔹 Total Tokens:      {usage.total_tokens}")
            print(f"💵 Estimated Cost:    ${cost:.6f}")
            print("="*40 + "\n")
            
    except Exception as e:
        print(f"⚠️ Không thể tính token: {e}")
    return response['data'][0]['embedding']

async def generate_matching_reasons(candidate_summary: str, jobs: List[Dict]):
    jobs_context = []
    for job in jobs:
        jobs_context.append({
            "id": job['id'],
            "title": job['payload'].get('title'),
            "requirements": job['payload'].get('requirements', '')
        })

    prompt = f"""
    You are an HR Expert. Analyze why the Candidate matches these Jobs.
    CANDIDATE PROFILE: {candidate_summary}
    JOB LIST: {json.dumps(jobs_context, ensure_ascii=False)}
    TASK: Provide score (0-100) and reason (Vietnamese) for each job.
    OUTPUT FORMAT JSON: {{ "job_id": {{ "score": 90, "reason": "..." }} }}
    """
    try:
        response = await acompletion(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        try:
            usage = response.usage
            cost = caculate_price(usage.prompt_tokens, usage.completion_tokens, model_name=response.model)
            print("\n" + "="*40)
            print("📊 TOKEN USAGE & COST REPORT")
            print("="*40)
            print(f"🔹 Model:             {response.model}")
            print(f"🔹 Prompt Tokens:     {usage.prompt_tokens}")
            print(f"🔹 Completion Tokens: {usage.completion_tokens}")
            print(f"🔹 Total Tokens:      {usage.total_tokens}")
            print(f"💵 Estimated Cost:    ${cost:.6f}")
            print("="*40 + "\n")
            
        except Exception as e:
            print(f"⚠️ Không thể tính token: {e}")
        return json.loads(content)
    except Exception as e:
        print(f"LLM Error: {e}")
        return {}

@router.post("/jobs", response_model=JobMatchResponse)
async def match_candidate_to_jobs(candidate: CandidateProfile):  
    mem_before = get_memory_usage()
    print(f"📉 RAM trước khi xử lý: {mem_before:.2f} MB")
    
    if index is None:
         raise HTTPException(status_code=500, detail="Server chưa load được Index.")

    try:
        candidate_text = parse_candidate_profile_to_string(candidate)
        candidate_vector = await get_embedding(candidate_text)

        query_vector = np.array([candidate_vector]).astype('float32')
        faiss.normalize_L2(query_vector)

        scores, indices = index.search(query_vector, 50)

        found_real_ids = []
        temp_score_map = {} 
        
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1: continue
            if idx < len(job_ids_list):
                real_id = job_ids_list[idx]
                found_real_ids.append(real_id)
                temp_score_map[real_id] = float(score)

        details_map = await get_jobs_from_mysql(found_real_ids)

        found_jobs = []
        desired_loc = candidate.rirekisho.desired_location if candidate.rirekisho else None
        
        for real_id in found_real_ids:
            payload = details_map.get(real_id)
            if not payload: continue

            if desired_loc:
                job_locs = payload.get('location', [])
                if not any(desired_loc.lower() in loc.lower() for loc in job_locs):
                    continue 
                
            found_jobs.append({
                "id": str(real_id),
                "payload": payload,
                "score": temp_score_map[real_id]
            })
            
            if len(found_jobs) >= 10: 
                break

        reasons_map = {}
        if len(candidate_text) > 50 and found_jobs:
            reasons_map = await generate_matching_reasons(candidate_text, found_jobs)

        matches = []
        for job in found_jobs:
            job_id = job['id']
            payload = job['payload']
            score = job['score']
            
            ai_data = reasons_map.get(job_id, {})
            llm_score = ai_data.get("score") if isinstance(ai_data, dict) else None
            ai_reason = ai_data.get("reason") if isinstance(ai_data, dict) else None
            final_reason = ai_reason if ai_reason else "Chưa có phân tích chi tiết từ AI."

            matches.append(JobMatch(
                job_id=job_id,
                job_title=payload.get('title', 'Unknown'),
                company=payload.get('company', 'Unknown'), 
                vector_score=round(score, 4),
                llm_score=llm_score,
                matching_reason=final_reason
            ))
        
        matches.sort(key=lambda x: (x.llm_score if x.llm_score is not None else 0, x.vector_score), reverse=True)
        
        mem_after = get_memory_usage()
        print(f"📈 RAM sau khi xử lý: {mem_after:.2f} MB (+{mem_after - mem_before:.2f} MB)")
        
        return JobMatchResponse(
            success=True,
            message=f"Đã tìm thấy {len(matches)} công việc phù hợp.",
            total_matches=len(matches),
            matches=matches
        )
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    app = FastAPI()
    app.include_router(router)
    print(f"🚀 Server running in FAISS + MYSQL MODE")
    uvicorn.run(app, host="0.0.0.0", port=8001)