# Employees 
from flask import Blueprint, request, jsonify
from repositories import employees
from . import employees_bp

@employees_bp.route('/employees', methods=['GET'])
def get_employees():
    department = request.args.get('department')
    location_id = request.args.get('location_id')
    status = request.args.get('status')
    data = employees.list_employees(department=department, location_id=location_id, status=status)
    return jsonify({'status': 'success', 'data': data})

@employees_bp.route('/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    row = employees.get_employee(emp_id)
    if row:
        return jsonify({'status': 'success', 'data': row})
    return jsonify({'status': 'error', 'message': 'Employee not found'}), 404

@employees_bp.route('/employees', methods=['POST'])
def create_employee():
    d = request.json or {}
    name = (d.get('name') or '').strip()
    if not name:
        return jsonify({'status': 'error', 'message': 'Name is required'}), 400
    row = employees.create_employee(
        name=name,
        department=d.get('department'),
        location_id=d.get('location_id'),
        status=d.get('status', 'active'),
        email=d.get('email'),
        phone=d.get('phone')
    )
    return jsonify({'status': 'success', 'message': 'Employee added successfully', 'data': row}), 201

@employees_bp.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    d = request.json or {}
    ok = employees.update_employee(emp_id, {k: v for k, v in d.items() if v is not None})
    if ok:
        return jsonify({'status': 'success', 'message': 'Employee updated'})
    return jsonify({'status': 'error', 'message': 'Employee not found'}), 404

@employees_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    ok = employees.delete_employee(emp_id)
    if ok:
        return jsonify({'status': 'success', 'message': 'Employee deleted'})
    return jsonify({'status': 'error', 'message': 'Employee not found'}), 404
