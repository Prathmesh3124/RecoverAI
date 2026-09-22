import sqlite3

DB_PATH = "backend/recoverai.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # Check whether user_id already exists
    columns = cursor.execute("PRAGMA table_info(customers)").fetchall()
    column_names = [column[1] for column in columns]

    if "user_id" not in column_names:
        cursor.execute(
            "ALTER TABLE customers ADD COLUMN user_id INTEGER REFERENCES users(id)"
        )
        conn.commit()
        print("user_id column added successfully.")
    else:
        print("user_id column already exists.")

finally:
    conn.close()