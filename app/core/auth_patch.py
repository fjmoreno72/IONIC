"""
Integration module for applying patches to the authentication system.
This enables the enhanced login functionality without modifying original files.
"""
import logging
import importlib
from functools import wraps

# Import the enhanced client
from app.api.iocore2_patch import EnhancedIOCore2ApiClient
from app.core.exceptions import ApiRequestError

def authenticate_user_enhanced(url, username, password):
    """
    Enhanced version of authenticate_user that uses the patched IOCore2ApiClient.
    
    Args:
        url: The base URL of the IOCore2 API
        username: The username to authenticate with
        password: The password to authenticate with
        
    Returns:
        Dict containing authentication result and session cookies if successful
    """
    try:
        # Use the enhanced client instead of the original
        client = EnhancedIOCore2ApiClient(base_url=url)
        result = client.login(username, password)
        
        if result['success']:
            logging.info(f"User {username} authenticated successfully using enhanced login")
            return {
                'success': True,
                'cookies': result['cookies'],
                'url': url
            }
        else:
            logging.warning(f"Enhanced authentication failed for user {username}")
            return {
                'success': False,
                'error': result.get('error', 'Authentication failed')
            }
    except Exception as e:
        logging.error(f"Enhanced authentication error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def apply_auth_patches():
    """
    Apply patches to the authentication system.
    This replaces the original authenticate_user function with the enhanced version.
    """
    logging.info("Applying authentication system patches...")
    
    # Import the auth module
    import app.core.auth as auth_module
    
    # Replace the authenticate_user function with our enhanced version
    auth_module.authenticate_user = authenticate_user_enhanced
    
    logging.info("Authentication system patches applied successfully")
    
    # Return the original function in case we need to restore it
    return auth_module.authenticate_user
