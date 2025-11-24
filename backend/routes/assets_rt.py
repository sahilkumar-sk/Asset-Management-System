# Assets
from flask import Blueprint, request, jsonify
from repositories import assets
from . import assets_bp








@assets_bp.route('/assets', methods=['GET'])
def get_assets():
    status = request.args.get('status')
    location_id = request.args.get('location_id')
    data = assets.list_assets(status=status, location_id=location_id)
    return jsonify({'status': 'success', 'data': data})

@assets_bp.route('/assets/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    row = assets.get_asset(asset_id)
    if row:
        return jsonify({'status': 'success', 'data': row})
    return jsonify({'status': 'error', 'message': 'Asset not found'}), 404

@assets_bp.route('/assets', methods=['POST'])
def create_asset():
    d = request.json or {}
    name = (d.get('name') or '').strip()
    category = (d.get('category') or '').strip()
    if not name or not category:
        return jsonify({'status': 'error', 'message': 'Name and category are required.'}), 400
    row = assets.create_asset(
        name=name,
        category=category,
        purchase_date=d.get('purchase_date'),
        cost=d.get('cost'),
        status=d.get('status', 'available'),
        serial_no=d.get('serial_no'),
        notes=d.get('notes'),
        location_id=d.get('location_id'),
        assigned_to=d.get('assigned_to')
    )
    return jsonify({'status': 'success', 'message': 'Asset added successfully', 'data': row}), 201

@assets_bp.route('/assets/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    d = request.json or {}
    ok = assets.update_asset(asset_id, {k: v for k, v in d.items() if v is not None})
    if ok:
        return jsonify({'status': 'success', 'message': 'Asset updated'})
    return jsonify({'status': 'error', 'message': 'Asset not found'}), 404

@assets_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    ok = assets.delete_asset(asset_id)
    if ok:
        return jsonify({'status': 'success', 'message': 'Asset deleted'})
    return jsonify({'status': 'error', 'message': 'Asset not found'}), 404