# Registeration and Login 
from flask import Blueprint, request, jsonify
from repositories import users
from . import users_bp

@users_bp.route('/register', methods=['POST'])
def register_user():
    d = request.json or {}
    first = (d.get('FirstName') or '').strip()
    last = (d.get('LastName') or '').strip()
    email = (d.get('Email') or '').strip()
    number = (d.get('number') or '').strip()
    pw1 = d.get('new_password') or ''
    pw2 = d.get('re_password') or ''
    if not all([first, last, email, pw1, pw2]):
        return jsonify({'status': 'error', 'message': 'All fields are required.'}), 400
    if pw1 != pw2:
        return jsonify({'status': 'error', 'message': 'Passwords do not match.'}), 400
    try:
        users.create_user(first, last, email, number, pw1)
        return jsonify({'status': 'success', 'message': 'User registered successfully!'}), 201
    except Exception:
        return jsonify({'status': 'error', 'message': 'Email already exists.'}), 409

@users_bp.route('/login', methods=['POST'])
def login_user():
    d = request.json or {}
    email = (d.get('Email') or '').strip()
    pw = d.get('password') or ''
    if not email or not pw:
        return jsonify({'status': 'error', 'message': 'Email and password required.'}), 400
    ok = users.check_login(email, pw)
    if ok:
        return jsonify({'status': 'success', 'message': 'Login successful!'})
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
