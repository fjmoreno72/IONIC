"""
Configuration Items API routes
Handle CRUD operations for configuration items
"""
import json
import os
from pathlib import Path
from flask import Blueprint, request, jsonify
from ionic2.config import settings
from ionic2.core.auth import login_required
import logging

config_items_bp = Blueprint('config_items', __name__)

@config_items_bp.route('/api/config-items', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_config_items():
    """
    Handle CRUD operations for configuration items
    GET: Return all configuration items
    POST: Create a new configuration item
    PUT: Update an existing configuration item
    DELETE: Delete a configuration item
    """
    # Path to the configuration items JSON file
    config_items_path = Path(settings.STATIC_DIR) / "ASC" / "data" / "configItem.json"
    
    try:
        # GET: Return all configuration items
        if request.method == 'GET':
            if not config_items_path.exists():
                return jsonify([])
                
            with open(config_items_path, 'r') as f:
                config_items = json.load(f)
                
            return jsonify(config_items)
            
        # POST: Create a new configuration item
        elif request.method == 'POST':
            # Load existing data
            if config_items_path.exists():
                with open(config_items_path, 'r') as f:
                    config_items = json.load(f)
            else:
                config_items = []
                
            new_item = request.json
            
            # Check if name is unique
            if any(item['Name'] == new_item['Name'] for item in config_items):
                return jsonify({
                    'error': 'A configuration item with this name already exists'
                }), 400
                
            # Add to list
            config_items.append(new_item)
            
            # Save back to file
            with open(config_items_path, 'w') as f:
                json.dump(config_items, f, indent=2)
                
            return jsonify({
                'success': True,
                'item': new_item,
                'message': 'Configuration item added successfully'
            })
            
        # PUT: Update an existing configuration item
        elif request.method == 'PUT':
            # Load existing data
            if not config_items_path.exists():
                return jsonify({'error': 'No configuration items found'}), 404
                
            with open(config_items_path, 'r') as f:
                config_items = json.load(f)
                
            updated_item = request.json
            
            # Find and update the item by name
            found = False
            for i, item in enumerate(config_items):
                if item['Name'] == updated_item['Name']:
                    config_items[i] = updated_item
                    found = True
                    break
                    
            if not found:
                return jsonify({'error': 'Configuration item not found'}), 404
                
            # Save back to file
            with open(config_items_path, 'w') as f:
                json.dump(config_items, f, indent=2)
                
            return jsonify({
                'success': True,
                'item': updated_item,
                'message': 'Configuration item updated successfully'
            })
            
        # DELETE: Delete a configuration item
        elif request.method == 'DELETE':
            # Get name from query parameter
            name = request.args.get('name')
            if not name:
                return jsonify({'error': 'Name parameter is required'}), 400
                
            # Load existing data
            if not config_items_path.exists():
                return jsonify({'error': 'No configuration items found'}), 404
                
            with open(config_items_path, 'r') as f:
                config_items = json.load(f)
                
            # Find and remove the item by name
            initial_count = len(config_items)
            config_items = [item for item in config_items if item['Name'] != name]
            
            if len(config_items) == initial_count:
                return jsonify({'error': 'Configuration item not found'}), 404
                
            # Save back to file
            with open(config_items_path, 'w') as f:
                json.dump(config_items, f, indent=2)
                
            return jsonify({
                'success': True,
                'message': 'Configuration item deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing configuration items: {str(e)}")
        return jsonify({'error': f'Error: {str(e)}'}), 500
