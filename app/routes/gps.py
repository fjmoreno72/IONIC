import uuid
import os # Import os module
import logging # Import logging
from flask import Blueprint, request, jsonify, current_app # Import current_app
from app.data_access import gps_repository

gps_bp = Blueprint('gps_bp', __name__, url_prefix='/api/gps')

def _get_json_path():
    """Helper function to get the absolute path to the _gps.json file."""
    # Use current_app.static_folder which points directly to the 'static' directory
    json_path = os.path.join(current_app.static_folder, 'ASC', 'data', '_gps.json')
    # No need to log here anymore as the repository does it.
    # current_app.logger.debug(f"Constructed JSON path: {json_path}") 
    return json_path

def _generate_gp_id():
    """Generates a unique GP ID in the format GP-xxxx."""
    # Find the highest existing number to avoid collisions after restarts
    # This is a simple approach; a more robust system might use a dedicated counter or UUIDs
    json_path = _get_json_path()
    gps_data = gps_repository.get_all_gps(json_path) # Pass path
    max_num = 0
    for gp in gps_data:
        if gp.get('id', '').startswith('GP-'):
            try:
                num = int(gp['id'].split('-')[1])
                if num > max_num:
                    max_num = num
            except (IndexError, ValueError):
                continue # Ignore malformed IDs
    new_num = max_num + 1
    return f"GP-{new_num:04d}"

@gps_bp.route('', methods=['GET'])
def get_gps():
    """Endpoint to retrieve all GPs."""
    current_app.logger.info("API Route: /api/gps GET endpoint called.") # Use app logger
    json_path = _get_json_path()
    current_app.logger.info(f"API Route: Using JSON path: {json_path}") # Use app logger
    try:
        gps_data = gps_repository.get_all_gps(json_path) # Pass path
        current_app.logger.info(f"API Route: Retrieved {len(gps_data)} GPs from repository.") # Use app logger
        if not isinstance(gps_data, list):
             current_app.logger.warning(f"API Route: gps_data is not a list: {type(gps_data)}") # Use app logger
             # Decide how to handle non-list data, maybe return error or empty list
             return jsonify({"error": "Invalid data format received from repository"}), 500
        
        current_app.logger.info("API Route: Returning GP data successfully.") # Use app logger
        return jsonify(gps_data)
    except Exception as e:
        current_app.logger.error(f"API Route: Error in /api/gps GET endpoint: {e}", exc_info=True) # Use app logger, add traceback
        return jsonify({"error": "Internal server error fetching GP data"}), 500

@gps_bp.route('', methods=['POST'])
def add_gp():
    """Endpoint to add a new GP."""
    current_app.logger.info("API Route: /api/gps POST endpoint called.") # Use app logger
    json_path = _get_json_path()
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Missing 'name' in request data"}), 400

    gps_list = gps_repository.get_all_gps(json_path) # Pass path

    # Basic name uniqueness check (optional, based on requirements)
    # if any(gp.get('name') == data['name'] for gp in gps_list):
    #     return jsonify({"error": f"GP with name '{data['name']}' already exists"}), 409

    new_gp = {
        "id": _generate_gp_id(),
        "name": data['name'],
        "description": data.get("description", ""),
        "iconPath": data.get("iconPath", "")
        # Add other fields as necessary from the request
    }
    gps_list.append(new_gp)

    if gps_repository.save_gps(gps_list, json_path): # Pass path
        current_app.logger.info(f"API Route: Successfully added GP {new_gp.get('id')}") # Use app logger
        return jsonify(new_gp), 201
    else:
        current_app.logger.error(f"API Route: Failed to save new GP data.") # Use app logger
        return jsonify({"error": "Failed to save GP data"}), 500

@gps_bp.route('/<string:gp_id>', methods=['PUT'])
def update_gp(gp_id):
    """Endpoint to update an existing GP by ID."""
    current_app.logger.info(f"API Route: /api/gps PUT endpoint called for ID: {gp_id}") # Use app logger
    json_path = _get_json_path()
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request data"}), 400

    gps_list = gps_repository.get_all_gps(json_path) # Pass path
    gp_found = False
    updated_list = []

    for gp in gps_list:
        if gp.get('id') == gp_id:
            gp_found = True
            # Update fields provided in the request
            for key, value in data.items():
                # Don't allow changing the ID via PUT
                if key != 'id':
                    gp[key] = value
            updated_list.append(gp) # Add the updated GP
        else:
            updated_list.append(gp) # Add other GPs unchanged

    if not gp_found:
        return jsonify({"error": f"GP with ID '{gp_id}' not found"}), 404

    if gps_repository.save_gps(updated_list, json_path): # Pass path
        # Find the updated GP again to return it
        updated_gp = next((gp for gp in updated_list if gp.get('id') == gp_id), None)
        current_app.logger.info(f"API Route: Successfully updated GP {gp_id}") # Use app logger
        return jsonify(updated_gp)
    else:
        current_app.logger.error(f"API Route: Failed to save updated GP data for ID: {gp_id}") # Use app logger
        return jsonify({"error": "Failed to save updated GP data"}), 500


@gps_bp.route('/<string:gp_id>', methods=['DELETE'])
def delete_gp(gp_id):
    """Endpoint to delete a GP by ID."""
    current_app.logger.info(f"API Route: /api/gps DELETE endpoint called for ID: {gp_id}") # Use app logger
    json_path = _get_json_path()
    gps_list = gps_repository.get_all_gps(json_path) # Pass path
    original_length = len(gps_list)
    
    # Filter out the GP with the matching ID
    updated_list = [gp for gp in gps_list if gp.get('id') != gp_id]

    if len(updated_list) == original_length:
        # No GP was removed, meaning the ID was not found
        return jsonify({"error": f"GP with ID '{gp_id}' not found"}), 404

    if gps_repository.save_gps(updated_list, json_path): # Pass path
        current_app.logger.info(f"API Route: Successfully deleted GP {gp_id}") # Use app logger
        return jsonify({"message": f"GP with ID '{gp_id}' deleted successfully"}), 200 # Or 204 No Content
    else:
        current_app.logger.error(f"API Route: Failed to save GP data after deleting ID: {gp_id}") # Use app logger
        return jsonify({"error": "Failed to save GP data after deletion"}), 500
