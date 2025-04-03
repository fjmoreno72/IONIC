"""
Services API routes
Handle CRUD operations for services
"""
import json
import os
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app
from app.config import settings
from app.core.auth import login_required
from app.data_access.services_repository import get_all_services, save_services # Added import
from werkzeug.utils import secure_filename
import logging

services_bp = Blueprint('services', __name__)

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
