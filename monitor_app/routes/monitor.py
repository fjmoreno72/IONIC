"""
System monitoring routes for the lightweight monitor application.
"""
import logging
from flask import Blueprint, render_template, jsonify, session

from shared_core.auth import login_required, get_api_client

# Create blueprint
monitor_bp = Blueprint('monitor', __name__)

@monitor_bp.route('/monitor')
@login_required
def system_monitor():
    """
    Render the system monitor page.
    
    Returns:
        Rendered system monitor template
    """
    logging.info("Accessing system monitor")
    server_url = session.get('url', 'Unknown Server')
    return render_template('system_monitor.html', server_url=server_url)

@monitor_bp.route('/api/remote_system_health')
@login_required
def get_remote_system_health():
    """
    Proxy endpoint to fetch system health data from the remote IOCore2 API.

    Returns:
        JSON response with health data or error.
    """
    try:
        client = get_api_client()
        if not client:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401

        # Call the system health method on the client
        # Note: This assumes the IOCore2ApiClient has a get_system_health method
        # You may need to adapt this based on your actual API client implementation
        try:
            health_data, request_time_ms = client.get_system_health()
        except AttributeError:
            # Fallback if get_system_health method doesn't exist
            logging.warning("get_system_health method not available on API client")
            return jsonify({
                'success': False, 
                'error': 'System health endpoint not available',
                'request_time_ms': 0
            }), 502

        # Add request time to the response data
        if isinstance(health_data, dict):
            health_data['request_time_ms'] = request_time_ms
        else:
            health_data = {
                'data': health_data,
                'request_time_ms': request_time_ms
            }

        return jsonify(health_data)

    except Exception as e:
        logging.exception("Unexpected error fetching remote system health")
        return jsonify({
            'success': False, 
            'error': 'An unexpected internal error occurred.',
            'request_time_ms': 0
        }), 500 