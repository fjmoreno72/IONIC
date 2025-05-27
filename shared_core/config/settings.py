"""
Shared settings configuration.

This module provides configuration settings that can be shared across
different applications.
"""
import os
from typing import Optional


class MonitorSettings:
    """Configuration settings for the monitor application."""
    
    # App configuration
    APP_SECRET_KEY: str = os.environ.get('IONIC2_SECRET_KEY', 'your-secret-key-here-change-in-production')
    DEBUG: bool = os.environ.get('IONIC2_DEBUG', 'False').lower() == 'true'
    
    # Server configuration
    HOST: str = os.environ.get('IONIC2_HOST', '0.0.0.0')
    PORT: int = int(os.environ.get('IONIC2_MONITOR_PORT', '5007'))  # Different port for monitor
    
    # Default IOCore2 URL
    DEFAULT_URL: Optional[str] = os.environ.get('IONIC2_DEFAULT_URL', None)
    
    # SSL Configuration
    VERIFY_SSL: bool = os.environ.get('IONIC2_VERIFY_SSL', 'True').lower() == 'true'
    CUSTOM_CA_BUNDLE: Optional[str] = os.environ.get('IONIC2_CA_BUNDLE', None)
    
    # Logging configuration
    LOG_LEVEL: str = os.environ.get('IONIC2_LOG_LEVEL', 'INFO')
    
    # Environment URLs for quick selection
    ENVIRONMENT_URLS = {
        'ciav': 'https://iocore2-ciav.ivv.ncia.nato.int',
        'cwix': 'https://iocore2-cwix.ivv.ncia.nato.int'
    } 