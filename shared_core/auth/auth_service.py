"""
Shared authentication service.

This module provides authentication functionality that can be shared
across different applications.
"""
import logging
from typing import Dict, Any, Optional

from flask import session

# We'll need to import the IOCore2ApiClient from the existing app
# For now, we'll create a placeholder that can be replaced with the actual import
try:
    from shared_core.api.iocore2 import IOCore2ApiClient
except ImportError:
    # Fallback for when this is used in standalone monitor app
    class IOCore2ApiClient:
        def __init__(self, base_url, cookies=None):
            self.base_url = base_url
            self.session = None
            
        def login(self, username, password):
            return {'success': False, 'error': 'API client not available'}
            
        def get_cookies(self):
            return {}


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