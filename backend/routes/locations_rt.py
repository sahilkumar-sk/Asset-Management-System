# Locations
from flask import Blueprint, request, jsonify
from repositories import locations
from . import locations_bp





@locations_bp.route('/locations', methods=['GET'])
def get_locations():
    return jsonify({'status': 'success', 'data': locations.list_locations()})

@locations_bp.route('/locations/<int:loc_id>', methods=['GET'])
def get_location(loc_id):
    loc = locations.get_location(loc_id)
    if loc:
        return jsonify({'status': 'success', 'data': loc})
    return jsonify({'status': 'error', 'message': 'Location not found'}), 404

@locations_bp.route('/locations', methods=['POST'])
def create_location():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'status': 'error', 'message': 'Name is required'}), 400
    row = locations.create_location(name, data.get('address'), data.get('floor'), data.get('room'))
    return jsonify({'status': 'success', 'message': 'Location added successfully', 'data': row}), 201

@locations_bp.route('/locations/<int:loc_id>', methods=['PUT'])
def update_location(loc_id):
    data = request.json or {}
    ok = locations.update_location(loc_id, {k: v for k, v in data.items() if v is not None})
    if ok:
        return jsonify({'status': 'success', 'message': 'Location updated'})
    return jsonify({'status': 'error', 'message': 'Location not found'}), 404

@locations_bp.route('/locations/<int:loc_id>', methods=['DELETE'])
def delete_location(loc_id):
    ok = locations.delete_location(loc_id)
    if ok:
        return jsonify({'status': 'success', 'message': 'Location deleted'})
    return jsonify({'status': 'error', 'message': 'Location not found'}), 404