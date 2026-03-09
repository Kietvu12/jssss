import asyncio
import yaml
import json
from dotenv import load_dotenv
from litellm import acompletion
import aiomysql

# Load biến môi trường (ví dụ API Keys)
load_dotenv()

# Load config Database & LLM
with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

DB_CONFIG = {
    "host": config['Db']['host'],
    "user": config['Db']['user'],
    "password": config['Db']['password'],
    "db": config['Db']['database'],
    "port": config['Db']['port'],
}

MODEL = config['LLM_Model']['parse_model']
BATCH_SIZE = 10  # Dịch 10 jobs mỗi lần để tránh quá tải token

# Khai báo các cột cần dịch và kiểu dữ liệu tương ứng cho cột tiếng Anh
SCHEMA = {
    "title": "VARCHAR(255)",
    "description": "TEXT",
    "instruction": "TEXT",
    "bonus": "TEXT",
    "salary_review": "TEXT",
    "holidays": "TEXT",
    "social_insurance": "TEXT",
    "transportation": "TEXT",
    "break_time": "TEXT",
    "overtime": "TEXT",
    "contract_period": "TEXT",
    "recruitment_process": "TEXT"
}

TABLE_NAME = "jobs"


async def _ensure_column(conn, table: str, column: str, col_type: str):
    """Tự động kiểm tra và tạo cột nếu chưa có."""
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT COUNT(*) FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s",
            (config['Db']['database'], table, column)
        )
        (count,) = await cur.fetchone()
        if count == 0:
            await cur.execute(f"ALTER TABLE `{table}` ADD COLUMN `{column}` {col_type} NULL")
            await conn.commit()
            print(f"➕ Đã thêm cột `{column}` ({col_type})")


async def _translate_batch(batch_data: dict) -> dict:
    """Dịch batch JSON sử dụng LLM."""
    prompt = (
        "Translate the text values in the following JSON from Vietnamese to English.\n"
        "Keep the exact same JSON structure, keys, and row IDs.\n"
        "If a value is null, empty, or a number, keep it as is.\n"
        "Preserve formatting (like HTML tags or bullet points) if present.\n"
        "Only output the valid JSON object.\n"
        f"Input JSON:\n{json.dumps(batch_data, ensure_ascii=False)}"
    )

    response = await acompletion(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.1, # Giữ temperature thấp để LLM dịch chính xác, bớt bay bổng
    )
    return json.loads(response.choices[0].message.content)


async def main():
    print("🚀 Bắt đầu tiến trình dịch bảng jobs...")
    conn = await aiomysql.connect(**DB_CONFIG)
    
    try:
        columns = list(SCHEMA.keys())
        
        # 1. Tạo các cột _en
        print("Đang kiểm tra cấu trúc bảng...")
        for col, col_type in SCHEMA.items():
            await _ensure_column(conn, TABLE_NAME, f"{col}_en", col_type)

        # 2. Tìm các dòng cần dịch (có ít nhất 1 cột _en bị NULL)
        en_columns = [f"{col}_en" for col in columns]
        where_clauses = [f"{en_col} IS NULL" for en_col in en_columns]
        where_sql = " OR ".join(where_clauses)
        
        select_query = f"SELECT id, {', '.join(columns)} FROM {TABLE_NAME} WHERE {where_sql}"

        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(select_query)
            rows = await cur.fetchall()

        if not rows:
            print("✅ Tất cả records đã được dịch, không có gì mới.")
            return

        print(f"📋 Tìm thấy {len(rows)} records cần dịch.")
        translated_count = 0

        # 3. Chạy từng batch
        for batch_start in range(0, len(rows), BATCH_SIZE):
            batch = rows[batch_start: batch_start + BATCH_SIZE]
            
            # Chỉ lấy các trường có dữ liệu thực tế để nén dung lượng request
            batch_payload = {}
            for row in batch:
                row_id = str(row['id'])
                batch_payload[row_id] = {col: row[col] for col in columns if row.get(col)}

            if not batch_payload:
                continue

            print(f"⏳ Đang xử lý batch từ {batch_start} đến {batch_start + len(batch) - 1}...")
            
            try:
                translated_batch = await _translate_batch(batch_payload)
            except Exception as e:
                print(f"⚠️ Lỗi LLM ở batch {batch_start}: {e}")
                continue

            # 4. Ghi kết quả vào Database
            async with conn.cursor() as cur:
                for row in batch:
                    row_id_str = str(row['id'])
                    result_data = translated_batch.get(row_id_str, {})
                    
                    set_clauses = [f"{col}_en = %s" for col in columns]
                    update_query = f"UPDATE {TABLE_NAME} SET {', '.join(set_clauses)} WHERE id = %s"
                    
                    # Cập nhật kết quả tiếng Anh, giữ nguyên tiếng Việt gốc nếu LLM trả thiếu
                    values = [result_data.get(col, row[col]) for col in columns]
                    values.append(row['id'])
                    
                    await cur.execute(update_query, tuple(values))
                    
            await conn.commit()
            translated_count += len(batch)
            print(f"✅ Đã dịch xong {translated_count}/{len(rows)} records.")

        print("🎉 Đã hoàn thành quá trình dịch!")

    except Exception as e:
        print(f"❌ Lỗi hệ thống: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    asyncio.run(main())