import mysql.connector

def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",  # MySQL サーバーのホスト名
        user="yourusername",  # ユーザー名
        password="yourpassword",  # パスワード
        database="mydatabase"  # 使用するデータベース名
    )
    return connection
