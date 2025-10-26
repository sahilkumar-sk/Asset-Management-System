# backend/db_setup.py
import sqlite3

conn = sqlite3.connect("ams.db")
cursor = conn.cursor()

# Create users table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    number TEXT,
    password TEXT NOT NULL
)
""")

conn.commit()
conn.close()

print("Database and users table created successfully!")
