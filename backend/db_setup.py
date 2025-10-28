import sqlite3, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "ams.db")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Users
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  FirstName TEXT NOT NULL,
  LastName  TEXT NOT NULL,
  Email     TEXT UNIQUE NOT NULL,
  number    TEXT,
  password  TEXT NOT NULL
);
""")

# Locations
cur.execute("""
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  floor TEXT,
  room TEXT
);
""")

# Assets
cur.execute("""
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_date TEXT,
  cost REAL,
  status TEXT CHECK(status IN ('in_use','available','maintenance','damaged')) DEFAULT 'available',
  serial_no TEXT,
  notes TEXT,
  location_id INTEGER,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
""")

# Employees
cur.execute("""
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT,
  location_id INTEGER,
  status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
  email TEXT,
  phone TEXT,
  FOREIGN KEY (location_id) REFERENCES locations(id)
);
""")

col_names = [r[1] for r in cur.execute("PRAGMA table_info(assets)").fetchall()]
if 'assigned_to' not in col_names:
    cur.execute("ALTER TABLE assets ADD COLUMN assigned_to INTEGER;")


conn.commit()
conn.close()
print("DB ready at:", DB_PATH)
