"""
Shared authentication decorators.
"""
import logging
from functools import wraps
from flask import session, jsonify, request, redirect, url_for, current_app

def login_required(f):
    """
    Decorator to require authentication for routes.
    
    This decorator checks if a user is authenticated by verifying the presence
    of session cookies. It can be used for both API endpoints and view routes.
    
    Args:
        f: The function to decorate
        
    Returns:
        The decorated function or a redirect/error response
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if authentication bypass is enabled (for development)
        if current_app.config.get('BYPASS_AUTH', False):
            logging.debug("Authentication bypassed for development")
            return f(*args, **kwargs)
            
        # Check if user has session cookies (authenticated)
        if 'cookies' not in session:
            logging.warning(f"Unauthenticated access attempt to {request.endpoint}")
            
            # Handle API requests differently from web requests
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({
                    'success': False,
                    'error': 'Authentication required',
                    'redirect': '/login'
                }), 401
            else:
                # For web requests, redirect to login page
                return redirect(url_for('auth.login_page') if 'auth.login_page' in current_app.view_functions else '/')
        
        return f(*args, **kwargs)
    
    return decorated_function 