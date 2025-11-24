from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# Import blueprints
from routes.assets_rt import assets_bp
from routes.employees_rt import employees_bp
from routes.locations_rt import locations_bp
from routes.users_rt import users_bp
from routes.dashboard_rt import dashboard_bp

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Register all blueprints
app.register_blueprint(assets_bp)
app.register_blueprint(employees_bp)
app.register_blueprint(locations_bp)
app.register_blueprint(users_bp)
app.register_blueprint(dashboard_bp)

# Serve frontend
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    from db import DB_PATH
    print(f"Using database at: {DB_PATH}")
    print("✅ AMS running at http://127.0.0.1:5000/")
    app.run(host='0.0.0.0', port=5000, debug=True)
