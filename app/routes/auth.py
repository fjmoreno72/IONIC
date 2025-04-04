"""
Authentication routes for the IOCore2 Coverage Analysis Tool.
"""
import logging
from flask import Blueprint, request, jsonify, session, redirect, url_for

from app.core.auth import authenticate_user

# Create blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
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
        }), 400 # Add 400 status code
    
    environment = data.get('environment')
    username = data.get('username')
    password = data.get('password')
    
    # Validate required fields
    if not environment or not username or not password:
        return jsonify({
            'success': False,
            'error': 'Missing required fields (environment, username, password)'
        }), 400 # Add 400 status code for bad request
        
    # Determine API URL based on environment
    api_url = None
    if environment == 'ciav':
        api_url = 'https://iocore2-ciav.ivv.ncia.nato.int'
    elif environment == 'cwix':
        api_url = 'https://iocore2-cwix.ivv.ncia.nato.int'
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid environment selected'
        }), 400 # Add 400 status code

    if not api_url: # Should be caught by else, but double-check
         return jsonify({
            'success': False,
            'error': 'Could not determine API URL for the selected environment'
        }), 500 # Internal server error if logic fails
    
    # Authenticate user
    result = authenticate_user(api_url, username, password)
    
    if result['success']:
        # Store session data
        session['cookies'] = result['cookies']
        session['url'] = api_url # Store the actual URL used
        session['environment'] = environment # Store the selected environment identifier
        logging.info(f"User {username} logged in successfully to {environment} environment")
        
    return jsonify(result)

@auth_bp.route('/logout')
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

@auth_bp.route('/check_auth')
def check_auth():
    """
    Check if user is authenticated.
    
    Returns:
        JSON response with authentication status
    """
    return jsonify({
        'authenticated': 'cookies' in session
    })
