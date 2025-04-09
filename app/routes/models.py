"""
Models API routes
Handle operations for models
"""
import json
from flask import Blueprint, jsonify, current_app
from app.core.auth import login_required
from app.data_access.models_repository import get_all_models
import logging

models_bp = Blueprint('models', __name__)

@models_bp.route('/api/models', methods=['GET'])
@login_required
def get_models():
    """
    API endpoint to get all models.
    
    Returns:
        JSON response with models data or error message.
    """
    try:
        # Log the API call
        logging.info("API Route: /api/models GET endpoint called.")
        
        # Get models from repository
        models = get_all_models()
        
        # Log the result
        logging.info(f"API Route: Retrieved {len(models)} models from repository.")
        
        # Return the models as JSON
        logging.info("API Route: Returning models data successfully.")
        return jsonify(models)
        
    except Exception as e:
        logging.exception(f"API Route: Error retrieving models: {str(e)}")
        return jsonify({'error': f'Error retrieving models: {str(e)}'}), 500
