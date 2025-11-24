from flask import Blueprint

# Create blueprint objects (one per module)
assets_bp = Blueprint('assets', __name__)
employees_bp = Blueprint('employees', __name__)
locations_bp = Blueprint('locations', __name__)
users_bp = Blueprint('users', __name__)
dashboard_bp = Blueprint('dashboard', __name__)
