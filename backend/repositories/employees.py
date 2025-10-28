from db import get_conn
from utils import row_to_dict
import sqlite3

def list_employees(department: str | None = None, location_id: str | int | None = None, status: str | None = None):
    conn = get_conn(); cur = conn.cursor()
    try:
        filters, params = [], []
        if department:  filters.append("e.department = ?"); params.append(department)
        if location_id: filters.append("e.location_id = ?"); params.append(location_id)
        if status:      filters.append("e.status = ?");     params.append(status)
        where = ("WHERE " + " AND ".join(filters)) if filters else ""

        if _has_column(cur, 'assets', 'assigned_to'):
            sql = f"""
              SELECT e.*,
                     IFNULL((SELECT COUNT(1) FROM assets a WHERE a.assigned_to = e.id), 0) AS assigned_count
              FROM employees e
              {where}
              ORDER BY e.id DESC
            """
        else:
            sql = f"SELECT e.*, 0 AS assigned_count FROM employees e {where} ORDER BY e.id DESC"

        cur.execute(sql, params)
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

def get_employee(emp_id: int):
    conn = get_conn(); cur = conn.cursor()
    try:
        if _has_column(cur, 'assets', 'assigned_to'):
            sql = """
              SELECT e.*,
                     IFNULL((SELECT COUNT(1) FROM assets a WHERE a.assigned_to = e.id), 0) AS assigned_count
              FROM employees e WHERE e.id=?
            """
        else:
            sql = "SELECT e.*, 0 AS assigned_count FROM employees e WHERE e.id=?"
        cur.execute(sql, (emp_id,))
        return row_to_dict(cur.fetchone())
    finally:
        conn.close()

def create_employee(name, department=None, location_id=None, status='active', email=None, phone=None):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO employees (name, department, location_id, status, email, phone)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, department, location_id, status, email, phone))
        new_id = cur.lastrowid
        conn.commit()
        # include assigned_count = 0 for new rows
        cur.execute("SELECT *, 0 AS assigned_count FROM employees WHERE id=?", (new_id,))
        return dict(cur.fetchone())
    finally:
        conn.close()

def update_employee(emp_id: int, data: dict) -> bool:
    if not data: return False
    conn = get_conn(); cur = conn.cursor()
    try:
        fields = ['name','department','location_id','status','email','phone']
        updates = {k: v for k, v in data.items() if k in fields}
        if not updates: return False
        set_clause = ", ".join([f"{k}=?" for k in updates.keys()])
        cur.execute(f"UPDATE employees SET {set_clause} WHERE id=?", list(updates.values())+[emp_id])
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

def delete_employee(emp_id: int) -> bool:
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("DELETE FROM employees WHERE id=?", (emp_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()

# ---- helpers ----
def _has_column(cur: sqlite3.Cursor, table: str, col: str) -> bool:
    cur.execute(f"PRAGMA table_info({table})")
    return any(row[1] == col for row in cur.fetchall())
