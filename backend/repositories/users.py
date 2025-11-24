from db import get_conn
import hashlib

# ---- Utility ----
def _password_hash(password: str) -> str:
    """Return SHA-256 hash of password."""
    return hashlib.sha256(password.encode()).hexdigest()


# ---- CRUD / Auth: Users ----
def create_user(first: str, last: str, email: str, number: str | None, password: str) -> int:
    """Insert a new user record."""
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO users (FirstName, LastName, Email, number, password)
            VALUES (?, ?, ?, ?, ?)
        """, (first, last, email.lower(), number, _password_hash(password)))
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def check_login(email: str, password: str) -> bool:
    """Verify email and password credentials."""
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 1 FROM users WHERE Email=? AND password=?
        """, (email.lower(), _password_hash(password)))
        return cur.fetchone() is not None
    finally:
        conn.close()