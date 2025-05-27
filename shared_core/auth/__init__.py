"""
Shared Authentication Components.

Contains authentication functionality that can be reused across applications.
"""

from .decorators import login_required
from .auth_service import authenticate_user, get_api_client

__all__ = ['login_required', 'authenticate_user', 'get_api_client'] 