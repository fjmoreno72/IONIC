#!/usr/bin/env python3
"""
Main entry point for the IOCore2 Coverage Analysis Tool.
"""
import os
import sys
import logging
import warnings
import argparse # Added for command-line arguments
from pathlib import Path

# Import settings first to ensure environment variables are loaded early
# Assuming settings will be moved to app.config or similar
from app.config import settings # Updated import
from app.utils.logging import configure_logging # Updated import
from app import create_app # Updated import - create_app should be in app/__init__.py
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

    # --- Argument Parsing ---
    parser = argparse.ArgumentParser(description='Run the IOCore2 Coverage Analysis Tool.')
    parser.add_argument('--bypassAuth', action='store_true',
                        help='Bypass authentication for development purposes.')
    args = parser.parse_args()
    # --- End Argument Parsing ---

    # Create Flask app, passing the bypass flag
    app = create_app(bypass_auth=args.bypassAuth)

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
