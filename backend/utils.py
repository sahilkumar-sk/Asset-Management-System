import hashlib

def password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def row_to_dict(row):
    return dict(row) if row else None
