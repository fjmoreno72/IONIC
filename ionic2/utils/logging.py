"""
Logging configuration for the IOCore2 Coverage Analysis Tool.
"""
import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

from ionic2.config import settings

def configure_logging(app=None):
    """
    Configure logging for the application.
    
    Args:
        app: Optional Flask app instance. If provided, will configure Flask logging.
    """
    # Create a formatter
    formatter = logging.Formatter(
        fmt=settings.LOG_FORMAT,
        datefmt=settings.LOG_DATE_FORMAT
    )
    
    # Get log level from settings
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates when reconfiguring
    for handler in list(logger.handlers):
        logger.removeHandler(handler)
    
    # Create file handler
    try:
        # Ensure log directory exists
        log_file = Path(settings.LOG_FILE)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except (IOError, OSError) as e:
        print(f"Error setting up file logging: {e}", file=sys.stderr)
    
    # Always add console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Configure Flask logging if app is provided
    if app:
        # Set Flask logger level
        app.logger.setLevel(log_level)
        
        # Handle Flask's default logger
        for handler in list(app.logger.handlers):
            app.logger.removeHandler(handler)
            
        # Use the same handlers as root logger
        for handler in logger.handlers:
            app.logger.addHandler(handler)
            
        # Log Flask startup
        app.logger.info(f"Configured Flask app logging with level {settings.LOG_LEVEL}")
    
    logger.info(f"Logging system configured with level {settings.LOG_LEVEL}")
    return logger
