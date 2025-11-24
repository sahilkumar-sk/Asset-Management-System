from db import get_conn
import sqlite3

# ---- Utility ----
def _row_to_dict(row):
    return dict(row) if row else None

# ---- CRUD: Assets ----
def list_assets(status: str | None = None, location_id: str | int | None = None):
    conn = get_conn()
    cur = conn.cursor()
    try:
        filters, params = [], []
        if status:
            filters.append("status = ?")
            params.append(status)
        if location_id:
            filters.append("location_id = ?")
            params.append(location_id)

        where = ("WHERE " + " AND ".join(filters)) if filters else ""
        cur.execute(f"SELECT * FROM assets {where} ORDER BY id DESC", params)
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def get_asset(asset_id: int):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM assets WHERE id=?", (asset_id,))
        return _row_to_dict(cur.fetchone())
    finally:
        conn.close()


def create_asset(
    name: str,
    category: str,
    purchase_date=None,
    cost=None,
    status="available",
    serial_no=None,
    notes=None,
    location_id=None,
    assigned_to=None
):
    conn = get_conn()
    cur = conn.cursor()
    try:
        has_assigned = _has_column(cur, "assets", "assigned_to")

        if has_assigned:
            cur.execute("""
                INSERT INTO assets
                (name, category, purchase_date, cost, status, serial_no, notes, location_id, assigned_to)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, category, purchase_date, cost, status, serial_no, notes, location_id, assigned_to))
        else:
            cur.execute("""
                INSERT INTO assets
                (name, category, purchase_date, cost, status, serial_no, notes, location_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (name, category, purchase_date, cost, status, serial_no, notes, location_id))

        new_id = cur.lastrowid
        conn.commit()

        cur.execute("SELECT * FROM assets WHERE id=?", (new_id,))
        return dict(cur.fetchone())
    finally:
        conn.close()


def update_asset(asset_id: int, data: dict) -> bool:
    if not data:
        return False

    conn = get_conn()
    cur = conn.cursor()
    try:
        fields = ["name", "category", "purchase_date", "cost", "status", "serial_no", "notes", "location_id"]
        if _has_column(cur, "assets", "assigned_to"):
            fields.append("assigned_to")

        updates = {k: v for k, v in data.items() if k in fields}
        if not updates:
            return False

        set_clause = ", ".join([f"{k}=?" for k in updates.keys()])
        cur.execute(f"UPDATE assets SET {set_clause} WHERE id=?", list(updates.values()) + [asset_id])
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def delete_asset(asset_id: int) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM assets WHERE id=?", (asset_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


# ---- Helpers ----
def _has_column(cur: sqlite3.Cursor, table: str, col: str) -> bool:
    cur.execute(f"PRAGMA table_info({table})")
    return any(row[1] == col for row in cur.fetchall())
