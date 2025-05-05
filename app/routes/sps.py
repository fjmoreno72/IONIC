"""
Service Providers (SPs) API routes
Handle CRUD operations for service providers
"""
import os
import logging
from pathlib import Path
from flask import Blueprint, render_template, redirect, url_for, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.core.auth import login_required
from app.data_access.sps_repository import get_all_sps, save_sps, get_sp_versions_by_id, get_sp_name_by_id, get_sp_id_by_name

sps_bp = Blueprint('sps', __name__)

@sps_bp.route('/asc_sps')
@login_required
def asc_sps():
    """Render the ASC SPs page."""
    logging.info("Accessing ASC SPs page")
    # Now uses the refactored component-based template
    return render_template('pages/sps_new.html', title="ASC SPs")

@sps_bp.route('/asc_sps_new')
@login_required
def asc_sps_new():
    """Redirects to main SPs page."""
    logging.info("Redirecting from /asc_sps_new to /asc_sps")
    return redirect(url_for('sps.asc_sps'))

@sps_bp.route('/api/sps/upload-icon', methods=['POST'])
@login_required
def upload_sp_icon():
    """
    API endpoint to handle icon image uploads for service providers (SPs).
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get SP name from request to name the icon
        sp_name = request.form.get('spName', '')
        if not sp_name:
            return jsonify({'error': 'SP name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(sp_name.lower().replace(' ', '_'))
        filename = f"sp_icon_{safe_name}.png"
        
        # Ensure the sp icons directory exists (Using current_app.static_folder)
        sp_dir = Path(current_app.static_folder) / "ASC" / "image" / "sp" # Corrected path
        os.makedirs(sp_dir, exist_ok=True)

        # Save the file
        file_path = sp_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/sp/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Icon uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading SP icon: {str(e)}")
        return jsonify({'error': f'Error uploading SP icon: {str(e)}'}), 500

@sps_bp.route('/api/sps/versions/<sp_id>', methods=['GET'])
@login_required
def get_sp_versions(sp_id):
    """
    API endpoint to retrieve versions for a specific SP by its ID.
    
    Args:
        sp_id (str): The ID of the specific product (SP) to retrieve versions for
        
    Returns:
        JSON response with the list of versions or error message
    """
    try:
        versions = get_sp_versions_by_id(sp_id)
        return jsonify({
            'success': True,
            'sp_id': sp_id,
            'versions': versions
        })
    except Exception as e:
        logging.exception(f"Error retrieving versions for SP ID {sp_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error retrieving versions: {str(e)}"
        }), 500

@sps_bp.route('/api/sps/name/<sp_id>', methods=['GET'])
@login_required
def get_name_by_sp_id(sp_id):
    """
    API endpoint to retrieve the name of a specific SP by its ID.
    
    Args:
        sp_id (str): The ID of the specific product (SP) to retrieve the name for
        
    Returns:
        JSON response with the SP name or error message
    """
    try:
        name = get_sp_name_by_id(sp_id)
        if name is None:
            return jsonify({
                'success': False,
                'error': f"SP with ID {sp_id} not found"
            }), 404
        
        return jsonify({
            'success': True,
            'sp_id': sp_id,
            'name': name
        })
    except Exception as e:
        logging.exception(f"Error retrieving name for SP ID {sp_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error retrieving SP name: {str(e)}"
        }), 500

@sps_bp.route('/api/sps/id', methods=['GET'])
@login_required
def get_id_by_sp_name():
    """
    API endpoint to retrieve the ID of a specific SP by its name.
    
    Query Parameters:
        name (str): The name of the specific product (SP) to retrieve the ID for
        
    Returns:
        JSON response with the SP ID or error message
    """
    try:
        sp_name = request.args.get('name')
        if not sp_name:
            return jsonify({
                'success': False,
                'error': "SP name parameter is required"
            }), 400
        
        sp_id = get_sp_id_by_name(sp_name)
        if sp_id is None:
            return jsonify({
                'success': False,
                'error': f"SP with name '{sp_name}' not found"
            }), 404
        
        return jsonify({
            'success': True,
            'name': sp_name,
            'sp_id': sp_id
        })
    except Exception as e:
        logging.exception(f"Error retrieving ID for SP name '{request.args.get('name')}': {str(e)}")
        return jsonify({
            'success': False,
            'error': f"Error retrieving SP ID: {str(e)}"
        }), 500

@sps_bp.route('/api/sps', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_sps():
    """
    API endpoint to manage Service Providers (SPs) data.
    
    Methods:
        GET: Return all SPs
        POST: Add a new SP
        PUT: Update an existing SP
        DELETE: Delete an SP
    
    Returns:
        JSON response with the result of the operation
    """
    try:
        # GET: Return all SPs
        if request.method == 'GET':
            sps = get_all_sps() # Use repository function
            return jsonify(sps)
            
        # POST: Add a new SP
        elif request.method == 'POST':
            sps = get_all_sps() # Load existing data via repository
            new_sp = request.json
            
            # Generate a new ID - find the highest existing ID
            highest_id = 0
            if sps:
                try:
                    # Extract all numeric parts and find the highest
                    for sp in sps:
                        if 'id' in sp and sp['id'].startswith('SP-'):
                            try:
                                current_id = int(sp['id'].split('-')[1])
                                highest_id = max(highest_id, current_id)
                            except (IndexError, ValueError):
                                pass
                except Exception:
                    pass
                    
            new_id = f"SP-{str(highest_id + 1).zfill(4)}"
            
            # Double-check that the ID is unique
            while any(sp.get('id') == new_id for sp in sps):
                highest_id += 1
                new_id = f"SP-{str(highest_id + 1).zfill(4)}"
                
            new_sp['id'] = new_id
            
            # Add to list
            sps.append(new_sp)
            
            save_sps(sps) # Save back via repository
                
            return jsonify({
                'success': True,
                'sp': new_sp,
                'message': 'Service Provider added successfully'
            })
            
        # PUT: Update an existing SP
        elif request.method == 'PUT':
            sps = get_all_sps() # Load existing data via repository
            updated_sp = request.json
            
            # Find and update the SP
            sp_id = updated_sp.get('id')
            if not sp_id:
                return jsonify({'error': 'SP ID is required'}), 400
                
            found = False
            for i, sp in enumerate(sps):
                if sp.get('id') == sp_id:
                    sps[i] = updated_sp
                    found = True
                    break
                    
            if not found:
                return jsonify({'error': f'SP with ID {sp_id} not found'}), 404
                
            save_sps(sps) # Save back via repository
                
            return jsonify({
                'success': True,
                'sp': updated_sp,
                'message': 'Service Provider updated successfully'
            })
        
        # DELETE: Delete an SP
        elif request.method == 'DELETE':
            sps = get_all_sps() # Load existing data via repository
            
            # Get the SP ID from query params
            sp_id = request.args.get('id')
            if not sp_id:
                return jsonify({'error': 'SP ID is required'}), 400
            
            # Find the SP to get its icon path before removal
            sp_to_delete = next((sp for sp in sps if sp.get('id') == sp_id), None)
            
            # Remove SP from list
            initial_count = len(sps)
            sps = [sp for sp in sps if sp.get('id') != sp_id]
            
            if len(sps) == initial_count:
                return jsonify({'error': f'SP with ID {sp_id} not found'}), 404
            
            save_sps(sps) # Save back via repository
            
            # Try to delete the icon file if it exists
            if sp_to_delete and sp_to_delete.get('iconPath'):
                try:
                    # Use current_app.static_folder reference
                    icon_path = Path(current_app.static_folder) / "ASC" / sp_to_delete['iconPath'].replace('./', '') # Corrected path
                    if icon_path.exists():
                        os.remove(icon_path)
                except Exception as e:
                    logging.warning(f"Could not delete icon file: {str(e)}")
            
            return jsonify({
                'success': True,
                'message': f'Service Provider with ID {sp_id} deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing SPs: {str(e)}")
        return jsonify({'error': f'Error managing SPs: {str(e)}'}), 500
