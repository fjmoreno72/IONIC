"""
Authentication routes for the IOCore2 Coverage Analysis Tool.
"""
import logging
from flask import Blueprint, request, jsonify, session, redirect, url_for

from ionic2.core.auth import authenticate_user

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
        })
    
    url = data.get('url')
    username = data.get('username')
    password = data.get('password')
    
    # Validate required fields
    if not url or not username or not password:
        return jsonify({
            'success': False,
            'error': 'Missing required fields (url, username, password)'
        })
    
    # Authenticate user
    result = authenticate_user(url, username, password)
    
    if result['success']:
        # Store session data
        session['cookies'] = result['cookies']
        session['url'] = result['url']
        logging.info(f"User {username} logged in successfully")
        
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
