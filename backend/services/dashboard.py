from db import get_conn

def summary():
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) AS c FROM assets"); total = cur.fetchone()['c']
        def count_status(s):
            cur.execute("SELECT COUNT(*) AS c FROM assets WHERE status=?", (s,))
            return cur.fetchone()['c']
        cur.execute("SELECT COUNT(*) AS c FROM assets WHERE assigned_to IS NOT NULL")
        assigned = cur.fetchone()['c'] if 'assigned_to' in [d[0] for d in cur.description or []] else 0
        unassigned = max(total - assigned, 0)
        return {
            'total_assets': total,
            'assigned_assets': assigned,
            'unassigned_assets': unassigned,
            'under_maintenance': count_status('maintenance'),
            'damaged': count_status('damaged'),
        }
    finally:
        conn.close()

def by_category():
    sql = """
      SELECT category,
             COUNT(*) AS total,
             SUM(CASE WHEN status='in_use' THEN 1 ELSE 0 END) AS in_use,
             SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) AS available,
             SUM(CASE WHEN status='maintenance' THEN 1 ELSE 0 END) AS maintenance,
             SUM(CASE WHEN status='damaged' THEN 1 ELSE 0 END) AS damaged
      FROM assets GROUP BY category ORDER BY category
    """
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute(sql)
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
