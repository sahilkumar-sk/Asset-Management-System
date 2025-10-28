from db import get_conn
from utils import password_hash

def create_user(first, last, email, number, password):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (FirstName, LastName, Email, number, password) VALUES (?,?,?,?,?)",
                    (first, last, email.lower(), number, password_hash(password)))
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()

def check_login(email, password) -> bool:
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM users WHERE Email=? AND password=?",
                    (email.lower(), password_hash(password)))
        return cur.fetchone() is not None
    finally:
        conn.close()
