import json
from http.server import BaseHTTPRequestHandler

def send_json(handler: BaseHTTPRequestHandler, code: int, obj: dict):
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(json.dumps(obj).encode())

def read_json(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get('Content-Length', 0))
    raw = handler.rfile.read(length).decode() if length else ''
    if not raw: return {}
    try:
        return json.loads(raw)
    except Exception:
        return {}
