from db import get_conn

# ---- Utility ----
def _row_to_dict(row):
    return dict(row) if row else None


# ---- CRUD: Locations ----
def list_locations():
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM locations ORDER BY id DESC")
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def get_location(loc_id: int):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM locations WHERE id=?", (loc_id,))
        return _row_to_dict(cur.fetchone())
    finally:
        conn.close()


def create_location(name: str, address: str | None = None,
                    floor: str | None = None, room: str | None = None):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO locations (name, address, floor, room)
            VALUES (?, ?, ?, ?)
        """, (name, address, floor, room))
        new_id = cur.lastrowid
        conn.commit()

        cur.execute("SELECT * FROM locations WHERE id=?", (new_id,))
        return dict(cur.fetchone())
    finally:
        conn.close()


def update_location(loc_id: int, data: dict) -> bool:
    if not data:
        return False

    conn = get_conn()
    cur = conn.cursor()
    try:
        set_clause = ", ".join([f"{k}=?" for k in data.keys()])
        cur.execute(f"UPDATE locations SET {set_clause} WHERE id=?",
                    list(data.values()) + [loc_id])
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def delete_location(loc_id: int) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM locations WHERE id=?", (loc_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()
