from fastapi import FastAPI
from .database import get_db_connection  # database.py から関数をインポート

app = FastAPI()

@app.get("/users")
def get_users():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users")  # users テーブルから全データを取得
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return {"users": users}
