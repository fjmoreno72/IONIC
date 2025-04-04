"""
Configuration Items API routes
Handle CRUD operations for configuration items
"""
import json
import os
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app # Import current_app
from app.config import settings
from app.core.auth import login_required
from app.data_access.config_items_repository import get_all_config_items, save_config_items # Import repository
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
    # Removed direct path construction (handled by repository)

    try:
        # GET: Return all configuration items
        if request.method == 'GET':
            config_items = get_all_config_items() # Use repository function
            return jsonify(config_items)
            
        # POST: Create a new configuration item
        elif request.method == 'POST':
            config_items = get_all_config_items() # Load existing data via repository
            new_item_data = request.json
            
            # Check if name is unique
            if any(item['Name'] == new_item_data['Name'] for item in config_items):
                return jsonify({
                    'error': f"A configuration item with the name '{new_item_data['Name']}' already exists"
                }), 400

            # Generate a new unique ID
            highest_id_num = 0
            for item in config_items:
                if 'id' in item and item['id'].startswith('CI-'):
                    try:
                        num = int(item['id'].split('-')[1])
                        highest_id_num = max(highest_id_num, num)
                    except (IndexError, ValueError):
                        pass # Ignore malformed IDs
            
            new_id = f"CI-{str(highest_id_num + 1).zfill(4)}"
            # Ensure the generated ID is truly unique (highly unlikely collision, but good practice)
            while any(item.get('id') == new_id for item in config_items):
                 highest_id_num += 1
                 new_id = f"CI-{str(highest_id_num + 1).zfill(4)}"

            new_item_data['id'] = new_id
                
            # Add to list
            config_items.append(new_item_data)
            
            save_config_items(config_items) # Save back via repository
                
            return jsonify({
                'success': True,
                'item': new_item_data, # Return item with new ID
                'message': 'Configuration item added successfully'
            }), 201 # Use 201 Created status code
            
        # PUT: Update an existing configuration item (identified by ID)
        elif request.method == 'PUT':
            config_items = get_all_config_items() # Load existing data via repository
            updated_item_data = request.json
            
            item_id_to_update = updated_item_data.get('id')
            new_name = updated_item_data.get('Name')

            if not item_id_to_update:
                 return jsonify({'error': 'id is required for update operation'}), 400
            if not new_name:
                 return jsonify({'error': 'Name is required for update operation'}), 400

            # Find the item by its ID
            item_index = -1
            for i, item in enumerate(config_items):
                if item.get('id') == item_id_to_update:
                    item_index = i
                    break
                    
            if item_index == -1:
                return jsonify({'error': f'Configuration item with id "{item_id_to_update}" not found'}), 404

            # Check if the *new* name conflicts with any *other* item (excluding itself)
            if any(item['Name'] == new_name for i, item in enumerate(config_items) if item.get('id') != item_id_to_update):
                 return jsonify({'error': f'Another configuration item with the name "{new_name}" already exists'}), 400
            
            # Remove originalName if it was sent by mistake (no longer needed)
            updated_item_data.pop('originalName', None) 

            # Update the item in the list
            config_items[item_index] = updated_item_data
                
            save_config_items(config_items) # Save back via repository
                
            # Return the updated item data (without originalName)
            return jsonify({
                'success': True,
                'item': updated_item_data, 
                'message': 'Configuration item updated successfully'
            })
            
        # DELETE: Delete a configuration item
        elif request.method == 'DELETE':
            # Get ID from query parameter
            item_id_to_delete = request.args.get('id')
            if not item_id_to_delete:
                return jsonify({'error': 'id parameter is required for delete operation'}), 400
                
            config_items = get_all_config_items() # Load existing data via repository
                
            # Find and remove the item by ID
            initial_count = len(config_items)
            config_items = [item for item in config_items if item.get('id') != item_id_to_delete]
            
            if len(config_items) == initial_count:
                return jsonify({'error': f'Configuration item with id "{item_id_to_delete}" not found'}), 404
                
            save_config_items(config_items) # Save back via repository
                
            return jsonify({
                'success': True,
                'message': f'Configuration item with id {item_id_to_delete} deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing configuration items: {str(e)}")
        return jsonify({'error': f'Error: {str(e)}'}), 500
