#!/usr/bin/env python3
"""
Main entry point for the IOCore2 Coverage Analysis Tool.
"""
import os
import sys
import logging
import warnings
from pathlib import Path

# Add the parent directory to the Python path to allow running from the command line
sys.path.append(str(Path(__file__).parent.parent))

# Import settings first to ensure environment variables are loaded early
from ionic2.config import settings
from ionic2.utils.logging import configure_logging
from ionic2.web.app import create_app
from urllib3.exceptions import InsecureRequestWarning

# Suppress only the single InsecureRequestWarning from urllib3 needed for self-signed certificates
# if SSL verification is disabled in settings.
if not settings.VERIFY_SSL and not (hasattr(settings, 'CUSTOM_CA_BUNDLE') and settings.CUSTOM_CA_BUNDLE):
    warnings.simplefilter('ignore', InsecureRequestWarning)
    logging.warning("Suppressed InsecureRequestWarning from urllib3 due to disabled SSL verification.")

def main():
    """
    Main entry point for the application.
    """
    # Configure logging
    logger = configure_logging()
    logger.info("Starting IOCore2 Coverage Analysis Tool")
    
    # Create Flask app
    app = create_app()
    
    # Run the app
    debug_mode = os.environ.get("IONIC2_DEBUG", "False").lower() == "true"
    port = int(os.environ.get("IONIC2_PORT", "5005"))
    host = os.environ.get("IONIC2_HOST", "0.0.0.0")
    
    logger.info(f"Running in {'DEBUG' if debug_mode else 'PRODUCTION'} mode")
    logger.info(f"Listening on {host}:{port}")
    
    app.run(
        debug=debug_mode,
        host=host,
        port=port
    )

if __name__ == "__main__":
    main()
