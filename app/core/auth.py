"""
Authentication functionality for the IOCore2 Coverage Analysis Tool.
"""
import logging
from functools import wraps
from typing import Dict, Any, Optional, Callable

from flask import session, redirect, url_for, jsonify, request

from app.api.iocore2 import IOCore2ApiClient

def login_required(f: Callable) -> Callable:
    """
    Decorator to ensure a route requires authentication.
    
    Args:
        f: The function to decorate
        
    Returns:
        Decorated function that checks for valid session
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'cookies' not in session:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'error': 'Authentication required',
                    'redirect': url_for('views.index')
                }), 401
            return redirect(url_for('views.index'))
        return f(*args, **kwargs)
    return decorated_function

def authenticate_user(url: str, username: str, password: str) -> Dict[str, Any]:
    """
    Authenticate a user against the IOCore2 API.
    
    Args:
        url: The base URL of the IOCore2 API
        username: The username to authenticate with
        password: The password to authenticate with
        
    Returns:
        Dict containing authentication result and session cookies if successful
    """
    try:
        client = IOCore2ApiClient(base_url=url)
        result = client.login(username, password)
        
        if result['success']:
            logging.info(f"User {username} authenticated successfully")
            return {
                'success': True,
                'cookies': result['cookies'],
                'url': url
            }
        else:
            logging.warning(f"Authentication failed for user {username}")
            return {
                'success': False,
                'error': result.get('error', 'Authentication failed')
            }
    except Exception as e:
        logging.error(f"Authentication error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_api_client() -> Optional[IOCore2ApiClient]:
    """
    Get an authenticated API client from the current session.
    
    Returns:
        Authenticated API client or None if no valid session exists
    """
    if 'cookies' not in session or 'url' not in session:
        return None
        
    return IOCore2ApiClient(
        base_url=session['url'],
        cookies=session['cookies']
    )
