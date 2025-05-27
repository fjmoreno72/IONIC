"""
Authentication routes for the System Monitor Application.
"""
import logging
from flask import Blueprint, request, jsonify, session, redirect, url_for, render_template

from shared_core.auth import authenticate_user
from shared_core.config import MonitorSettings

# Create blueprint
monitor_auth_bp = Blueprint('auth', __name__)

@monitor_auth_bp.route('/')
def login_page():
    """
    Render the login page for the monitor application.
    
    Returns:
        Rendered login template
    """
    return render_template('login.html')

@monitor_auth_bp.route('/login', methods=['POST'])
def login():
    """
    Handle user login requests.
    
    Returns:
        JSON response with authentication result
    """
    # Get login details from request
    data = request.json
    
    if not data:
        return jsonify({
            'success': False,
            'error': 'Missing request data'
        }), 400
    
    environment = data.get('environment')
    username = data.get('username')
    password = data.get('password')
    api_url = data.get('api_url')
    
    # Validate required fields
    if not environment or not username or not password:
        return jsonify({
            'success': False,
            'error': 'Missing required fields (environment, username, password)'
        }), 400
    
    # Use provided API URL or determine default based on environment
    if not api_url:
        settings = MonitorSettings()
        if environment in settings.ENVIRONMENT_URLS:
            api_url = settings.ENVIRONMENT_URLS[environment]
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid environment selected and no API URL provided'
            }), 400

    if not api_url:
         return jsonify({
            'success': False,
            'error': 'Could not determine API URL'
        }), 500
    
    # Authenticate user
    result = authenticate_user(api_url, username, password)
    
    if result['success']:
        # Store session data
        session['cookies'] = result['cookies']
        session['url'] = api_url
        session['environment'] = environment
        logging.info(f"User {username} logged in successfully to {environment} environment using URL: {api_url}")
        
    return jsonify(result)

@monitor_auth_bp.route('/logout')
def logout():
    """
    Handle user logout requests.
    
    Returns:
        JSON response confirming logout
    """
    if 'cookies' in session:
        username = session.get('username', 'User')
        logging.info(f"{username} logged out")
        
    # Clear session data
    session.clear()
    
    return jsonify({'success': True})

@monitor_auth_bp.route('/check_auth')
def check_auth():
    """
    Check if user is authenticated.
    
    Returns:
        JSON response with authentication status
    """
    return jsonify({
        'authenticated': 'cookies' in session
    }) 