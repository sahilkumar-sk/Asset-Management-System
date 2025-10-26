# backend/server.py
from http.server import BaseHTTPRequestHandler, HTTPServer
import json, urllib.parse, sqlite3, hashlib, os, sys

# -------------------------------
# Config: absolute DB path + helpers
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "ams.db")

def password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_conn():
    """Return a connection and ensure the users table exists."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName TEXT NOT NULL,
            LastName  TEXT NOT NULL,
            Email     TEXT UNIQUE NOT NULL,
            number    TEXT,
            password  TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn

class RequestHandler(BaseHTTPRequestHandler):
    # CORS
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    # Health check
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        response = {
            'status': 'success',
            'message': 'Server is running (SQLite connected)!',
            'db_path': DB_PATH
        }
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        # Parse body (json or form)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            data = {k: v[0] for k, v in urllib.parse.parse_qs(body).items()}

        path = self.path
        status_code = 200
        response = {}

        # Connect DB (absolute path)
        try:
            conn = get_conn()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
        except sqlite3.Error as err:
            status_code = 500
            response = {"status": "error", "message": f"Database Connection Error: {err}"}
            self._send(status_code, response)
            return

        try:
            # ---------------------------
            # Register
            # ---------------------------
            if path == '/register':
                first  = data.get('FirstName', '').strip()
                last   = data.get('LastName', '').strip()
                email  = data.get('Email', '').strip().lower()
                number = data.get('number', '').strip()
                new_pw = data.get('new_password', '')
                re_pw  = data.get('re_password', '')

                if not all([first, last, email, new_pw, re_pw]):
                    status_code = 400
                    response = {'status': 'error', 'message': 'All fields are required.'}
                elif new_pw != re_pw:
                    status_code = 400
                    response = {'status': 'error', 'message': 'Passwords do not match.'}
                else:
                    hashed = password_hash(new_pw)
                    try:
                        cursor.execute(
                            "INSERT INTO users (FirstName, LastName, Email, number, password) VALUES (?, ?, ?, ?, ?)",
                            (first, last, email, number, hashed)
                        )
                        conn.commit()
                        response = {'status': 'success', 'message': 'User registered successfully!'}
                    except sqlite3.IntegrityError:
                        status_code = 409
                        response = {'status': 'error', 'message': 'Email already exists.'}

            # ---------------------------
            # Login
            # ---------------------------
            elif path == '/login':
                email = data.get('Email', '').strip().lower()
                pw    = data.get('password', '')
                if not email or not pw:
                    status_code = 400
                    response = {'status': 'error', 'message': 'Email and password required.'}
                else:
                    hashed = password_hash(pw)
                    cursor.execute("SELECT 1 FROM users WHERE Email=? AND password=?", (email, hashed))
                    user = cursor.fetchone()
                    if user:
                        response = {'status': 'success', 'message': 'Login successful!'}
                    else:
                        status_code = 401
                        response = {'status': 'error', 'message': 'Invalid email or password.'}

            # ---------------------------
            # Unknown route
            # ---------------------------
            else:
                status_code = 404
                response = {'status': 'error', 'message': 'Invalid endpoint.'}

        finally:
            cursor.close()
            conn.close()

        self._send(status_code, response)

    # helper to send JSON
    def _send(self, code, obj):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode())

if __name__ == "__main__":
    print("Using database at:", DB_PATH)  # <- watch this path
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("✅ Server running on http://localhost:8000 (SQLite)")
    httpd.serve_forever()
