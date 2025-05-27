#!/usr/bin/env python3
"""
Entry point for the lightweight System Monitor Application.

This runs only the monitoring functionality with login capabilities.
"""
import os
import sys
import logging
import warnings
import argparse
from pathlib import Path

# Add the current directory to the Python path so we can import shared_core
sys.path.insert(0, str(Path(__file__).parent))

from shared_core.config import MonitorSettings
from monitor_app import create_monitor_app

# Suppress SSL warnings if needed
from urllib3.exceptions import InsecureRequestWarning

def main():
    """
    Main entry point for the monitor application.
    """
    # Configure basic logging first
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    logger = logging.getLogger(__name__)
    logger.info("Starting IOCore2 System Monitor")

    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Run the IOCore2 System Monitor.')
    parser.add_argument('--bypassAuth', action='store_true',
                        help='Bypass authentication for development purposes.')
    args = parser.parse_args()

    # Load settings
    settings = MonitorSettings()
    
    # Suppress SSL warnings if verification is disabled
    if not settings.VERIFY_SSL:
        warnings.simplefilter('ignore', InsecureRequestWarning)
        logger.warning("SSL verification disabled - InsecureRequestWarning suppressed")

    # Create the monitor app
    app = create_monitor_app(bypass_auth=args.bypassAuth)

    # Configure runtime settings
    debug_mode = settings.DEBUG
    port = settings.PORT
    host = settings.HOST
    
    logger.info(f"Running in {'DEBUG' if debug_mode else 'PRODUCTION'} mode")
    logger.info(f"Listening on {host}:{port}")
    
    if args.bypassAuth:
        logger.warning("Authentication bypass is ENABLED - for development only!")
    
    # Run the app
    try:
        app.run(
            debug=debug_mode,
            host=host,
            port=port
        )
    except KeyboardInterrupt:
        logger.info("Application shutdown requested by user")
    except Exception as e:
        logger.error(f"Application startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 