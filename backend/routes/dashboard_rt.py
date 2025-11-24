from flask import jsonify
from services import dashboard
from . import dashboard_bp

@dashboard_bp.route('/dashboard/summary')
def dashboard_summary():
    return jsonify({'status': 'success', 'data': dashboard.summary()})

@dashboard_bp.route('/dashboard/by-category')
def dashboard_by_category():
    return jsonify({'status': 'success', 'data': dashboard.by_category()})
