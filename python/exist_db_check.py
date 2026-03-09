import mysql.connector

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password='123456',
        port=3306
    )
    cursor = conn.cursor()
    
    cursor.execute("SHOW DATABASES")
    
    print("--- CÁC SCHEMA HIỆN CÓ TRONG DOCKER ---")
    for db in cursor:
        print(f"📦 {db[0]}")

except Exception as e:
    print(f"Lỗi kết nối: {e}")