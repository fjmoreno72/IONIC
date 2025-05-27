"""
Exception classes for the IOCore2 Coverage Analysis Tool.
"""
import logging
from typing import Dict, Any, Optional

class IOnic2Error(Exception):
    """Base exception class for IOnic2 application errors."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to a dictionary for JSON response."""
        error_dict = {
            'success': False,
            'error': self.message,
            'status_code': self.status_code
        }
        
        if self.details:
            error_dict['details'] = self.details
            
        return error_dict

class InvalidSession(IOnic2Error):
    """Raised when the session is invalid or expired."""
    def __init__(self, message="Your session has expired. Please log in again.", **kwargs):
        super().__init__(message, status_code=401, **kwargs)

class ApiRequestError(IOnic2Error):
    """Raised when there is an error with an API request."""
    def __init__(self, message="API request failed", status_code=500, **kwargs):
        super().__init__(message, status_code=status_code, **kwargs)

class DataFormatError(IOnic2Error):
    """Raised when there is an error with data formatting or parsing."""
    def __init__(self, message="Data format error", **kwargs):
        super().__init__(message, status_code=400, **kwargs)

class ResourceNotFoundError(IOnic2Error):
    """Raised when a requested resource is not found."""
    def __init__(self, resource_type: str, resource_id: str, **kwargs):
        message = f"{resource_type} '{resource_id}' not found"
        super().__init__(message, status_code=404, **kwargs)

class ValidationError(IOnic2Error):
    """Raised when validation of data fails."""
    def __init__(self, message="Validation error", **kwargs):
        super().__init__(message, status_code=400, **kwargs)

def handle_exception(exc: Exception) -> Dict[str, Any]:
    """
    Handle exceptions and convert them to a standard format.
    
    Args:
        exc: The exception to handle
        
    Returns:
        Dictionary with standardized error response
    """
    if isinstance(exc, IOnic2Error):
        # Log the error
        logging.error(f"{exc.__class__.__name__}: {exc.message}")
        if exc.details:
            logging.error(f"Error details: {exc.details}")
        
        # Return the formatted error response
        return exc.to_dict()
    
    # Handle unknown exceptions
    logging.exception("Unexpected exception:")
    
    # Return a generic error response
    return {
        'success': False,
        'error': str(exc),
        'status_code': 500
    }
