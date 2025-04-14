"""
Actors to GP API routes
Handle operations for actor to GP mappings
"""
import json
from flask import Blueprint, request, jsonify
from app.core.auth import login_required
from app.data_access.actors_to_gp import (
    get_all_actor_gp,
    update_actor_to_gp,
    delete_gp_from_actor,
    regenerate_actor_to_gp_file,
    clean_old_actors,
    get_possible_gps_for_actor
)
import logging

actors2gp_bp = Blueprint('actors2gp', __name__)

# Test endpoint to check if our routes are properly registered
@actors2gp_bp.route('/api/actors2gp/test', methods=['GET'])
def test_route():
    """Test route to verify the blueprint is registered correctly."""
    return jsonify({"status": "success", "message": "Actors to GP API is working"})

@actors2gp_bp.route('/api/actors2gp/all', methods=['GET'])
@login_required
def get_all_actors_gp():
    """Get all actor to GP mappings."""
    try:
        data = get_all_actor_gp()
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        logging.error(f"Error getting all actor to GP mappings: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@actors2gp_bp.route('/api/actors2gp/update', methods=['POST'])
@login_required
def update_actor_gp():
    """Update the GP list for a specific actor in a service."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['service_id', 'model_id', 'actor_key', 'gps']
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing required field: {field}"}), 400
        
        # Update the actor to GP mapping
        result = update_actor_to_gp(
            data['service_id'],
            data['model_id'],
            data['actor_key'],
            data['gps']
        )
        
        if result:
            return jsonify({"status": "success", "message": "Actor to GP mapping updated successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to update actor to GP mapping"}), 400
    except Exception as e:
        logging.error(f"Error updating actor to GP mapping: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@actors2gp_bp.route('/api/actors2gp/delete', methods=['DELETE'])
@login_required
def delete_gp():
    """Delete GPs associated with a specific actor in a service."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['service_id', 'model_id', 'actor_key']
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing required field: {field}"}), 400
        
        # Get optional gp_id parameter
        gp_id = data.get('gp_id', None)
        
        # Delete the GP(s) from the actor
        result = delete_gp_from_actor(
            data['service_id'],
            data['model_id'],
            data['actor_key'],
            gp_id
        )
        
        if result:
            return jsonify({"status": "success", "message": "GPs deleted successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to delete GPs"}), 400
    except Exception as e:
        logging.error(f"Error deleting GPs: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@actors2gp_bp.route('/api/actors2gp/regenerate', methods=['POST'])
@login_required
def regenerate_file():
    """Regenerate the actor to GP JSON file."""
    try:
        data = request.get_json()
        force_regenerate = data.get('force_regenerate', False)
        
        result = regenerate_actor_to_gp_file(force_regenerate)
        
        if result:
            return jsonify({"status": "success", "message": "Actor to GP file regenerated successfully"})
        else:
            return jsonify({"status": "error", "message": "Failed to regenerate actor to GP file"}), 400
    except Exception as e:
        logging.error(f"Error regenerating actor to GP file: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

@actors2gp_bp.route('/api/actors2gp/clean', methods=['POST'])
@login_required
def clean_old():
    """Clean up actors that haven't been updated in the specified time period."""
    try:
        data = request.get_json()
        minutes = data.get('minutes', 60)  # Default to 60 minutes if not specified
        
        result, actors_removed = clean_old_actors(minutes)
        
        if result:
            return jsonify({
                "status": "success", 
                "message": f"Successfully cleaned up old actors", 
                "actors_removed": actors_removed
            })
        else:
            return jsonify({"status": "error", "message": "Failed to clean up old actors"}), 400
    except Exception as e:
        logging.error(f"Error cleaning up old actors: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


@actors2gp_bp.route('/api/actors2gp/possible-gps', methods=['GET'])
@login_required
def get_possible_gps():
    """Get all possible GPs for an actor in a specific service and model."""
    try:
        # Get query parameters
        service_id = request.args.get('service_id')
        model_id = request.args.get('model_id')
        
        # Validate required parameters
        if not service_id or not model_id:
            return jsonify({
                "status": "error", 
                "message": "Missing required parameters: service_id and model_id are required"
            }), 400
        
        # Get possible GPs
        gps = get_possible_gps_for_actor(service_id, model_id)
        
        return jsonify({
            "status": "success", 
            "data": gps
        })
    except Exception as e:
        logging.error(f"Error getting possible GPs: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


