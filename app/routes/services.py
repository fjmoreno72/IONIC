"""
Services API routes
Handle CRUD operations for services
"""
import json
import os
import logging
from pathlib import Path
from flask import Blueprint, jsonify, request, current_app, send_file
from werkzeug.utils import secure_filename
from app.core.auth import login_required
from app.config import settings
from app.data_access.services_repository import (
    get_all_services, save_services, get_service_id_by_name, get_service_name_by_id, 
    get_service_gps, get_service_gps_all
)

services_bp = Blueprint('services', __name__)

@services_bp.route('/api/services/name_to_id', methods=['GET'])
def service_id_by_name():
    """
    Get a service ID by its name
    
    Query parameters:
        name: The name of the service to look up
        
    Returns:
        JSON with the service ID or error message
    """
    try:
        # Get service name from query parameter
        service_name = request.args.get('name', '')
        
        if not service_name:
            return jsonify({
                'success': False,
                'message': 'Service name is required',
            }), 400
        
        # Get service ID
        service_id = get_service_id_by_name(service_name)
        
        if not service_id:
            return jsonify({
                'success': False,
                'message': f'No service found with name: {service_name}',
            }), 404
        
        return jsonify({
            'success': True,
            'id': service_id,
        })
        
    except Exception as e:
        logging.error(f"Error in service_id_by_name: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
        }), 500

@services_bp.route('/api/services/id_to_name', methods=['GET'])
def service_name_by_id():
    """
    Get a service name by its ID
    
    Query parameters:
        id: The ID of the service to look up
        
    Returns:
        JSON with the service name or error message
    """
    try:
        # Get service ID from query parameter
        service_id = request.args.get('id', '')
        
        if not service_id:
            return jsonify({
                'success': False,
                'message': 'Service ID is required',
            }), 400
        
        # Get service name
        service_name = get_service_name_by_id(service_id)
        
        if not service_name:
            return jsonify({
                'success': False,
                'message': f'No service found with ID: {service_id}',
            }), 404
        
        return jsonify({
            'success': True,
            'name': service_name,
        })
        
    except Exception as e:
        logging.error(f"Error in service_name_by_id: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
        }), 500

@services_bp.route('/api/services/<service_id>/gps', methods=['GET'])
def service_gps(service_id):
    """
    Get GP IDs for a service that support a specific model
    
    Path parameters:
        service_id: The ID of the service to search for
        
    Query parameters:
        model_id: The ID of the model to filter by
        
    Returns:
        JSON with a list of GP IDs or error message
    """
    try:
        # Get the model ID from the query string
        model_id = request.args.get('model_id', '')
        
        # Validate the model_id parameter
        if not model_id:
            return jsonify({
                'success': False,
                'message': 'Model ID is required',
            }), 400
        
        # Get GP IDs
        gp_ids = get_service_gps(service_id, model_id)
        
        return jsonify({
            'success': True,
            'gp_ids': gp_ids,
        })
        
    except Exception as e:
        logging.error(f"Error in service_gps: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
        }), 500

@services_bp.route('/api/services/<service_id>/all_gps', methods=['GET'])
@login_required
def service_gps_all(service_id):
    """
    Get all GP IDs for a service regardless of model support
    
    Path parameters:
        service_id: The ID of the service to search for
        
    Returns:
        JSON with a list of GP IDs or error message
    """
    try:
        # Get all GP IDs for the service without model filtering
        gp_ids = get_service_gps_all(service_id)
        
        return jsonify({
            'success': True,
            'gp_ids': gp_ids,
        })
        
    except Exception as e:
        logging.error(f"Error in service_gps_all: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
        }), 500

# Test endpoint to check if our routes are properly registered
@services_bp.route('/api/services/test', methods=['GET'])
def test_services_route():
    return jsonify({
        'success': True,
        'message': 'Services API route is working!'
    })

@services_bp.route('/api/services/upload-icon', methods=['POST'])
@login_required
def upload_service_icon():
    """
    API endpoint to handle icon image uploads for services.
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get service name from request to name the icon
        service_name = request.form.get('serviceName', '')
        if not service_name:
            return jsonify({'error': 'Service name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(service_name.lower().replace(' ', '_'))
        filename = f"icon_{safe_name}.png"
        
        # Ensure the service icons directory exists
        srv_dir = Path(current_app.static_folder) / "ASC" / "image" / "srv"
        os.makedirs(srv_dir, exist_ok=True)

        # Save the file
        file_path = srv_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/srv/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Icon uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading service icon: {str(e)}")
        return jsonify({'error': f'Error uploading service icon: {str(e)}'}), 500

@services_bp.route('/api/services/upload-diagram', methods=['POST'])
@login_required
def upload_service_diagram():
    """
    API endpoint to handle diagram image uploads for services.
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get service name from request to name the diagram
        service_name = request.form.get('serviceName', '')
        if not service_name:
            return jsonify({'error': 'Service name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(service_name.lower().replace(' ', '_'))
        
        # Preserve file extension if it's an image
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            ext = '.jpg'  # Default to jpg if not a supported format
            
        filename = f"diagram_{safe_name}{ext}"
        
        # Ensure the service diagrams directory exists
        srv_dir = Path(current_app.static_folder) / "ASC" / "image" / "srv"
        os.makedirs(srv_dir, exist_ok=True)

        # Save the file
        file_path = srv_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/srv/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Diagram uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading service diagram: {str(e)}")
        return jsonify({'error': f'Error uploading service diagram: {str(e)}'}), 500

@services_bp.route('/api/services', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_services():
    """
    Handle CRUD operations for services
    GET: Return all services
    POST: Create a new service
    PUT: Update an existing service
    DELETE: Delete a service
    """
    # Removed direct path construction

    try:
        # GET: Return all services
        if request.method == 'GET':
            services = get_all_services() # Use repository function
            return jsonify(services)
            
        # POST: Create a new service
        elif request.method == 'POST':
            services = get_all_services() # Load existing data via repository
            new_service = request.json
            
            # Generate a new ID
            last_id = 0
            if services:
                try:
                    # Extract the numeric part of the last ID, safely checking for the 'id' key
                    id_numbers = [
                        int(service['id'].split('-')[1]) 
                        for service in services 
                        if 'id' in service 
                        and isinstance(service['id'], str)
                        and service['id'].startswith('SRV-')
                    ]
                    if id_numbers:
                        last_id = max(id_numbers)
                except (IndexError, ValueError, KeyError):
                    # Handle any parsing errors gracefully
                    pass
                    
            new_id = f"SRV-{str(last_id + 1).zfill(4)}"
            new_service['id'] = new_id
            
            # Add to list
            services.append(new_service)
            
            save_services(services) # Save back via repository
                
            return jsonify({
                'success': True,
                'service': new_service,
                'message': 'Service added successfully'
            })
            
        # PUT: Update an existing service
        elif request.method == 'PUT':
            services = get_all_services() # Load existing data via repository
            
            # Optional: Check if loading failed explicitly, though repo handles file not found
            # if not services and services_path.exists(): # Check if repo returned empty but file existed
            #     return jsonify({'error': 'Could not load services data'}), 500

            updated_service = request.json
            
            # Find and update the service by ID
            found = False
            for i, service in enumerate(services):
                if service['id'] == updated_service['id']:
                    services[i] = updated_service
                    found = True
                    break
                    
            if not found:
                return jsonify({'error': 'Service not found'}), 404
                
            save_services(services) # Save back via repository
                
            return jsonify({
                'success': True,
                'service': updated_service,
                'message': 'Service updated successfully'
            })
            
        # DELETE: Delete a service
        elif request.method == 'DELETE':
            # Get ID from query parameter
            service_id = request.args.get('id')
            if not service_id:
                return jsonify({'error': 'ID parameter is required'}), 400
                
            services = get_all_services() # Load existing data via repository

            # Find and remove the service by ID
            initial_count = len(services)
            services = [service for service in services if service['id'] != service_id]
            
            if len(services) == initial_count:
                return jsonify({'error': 'Service not found'}), 404
                
            save_services(services) # Save back via repository
                
            return jsonify({
                'success': True,
                'message': 'Service deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing services: {str(e)}")
        return jsonify({'error': f'Error: {str(e)}'}), 500
