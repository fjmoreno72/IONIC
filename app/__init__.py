"""
Flask application setup for the IOCore2 Coverage Analysis Tool.
"""
import logging
import os
from pathlib import Path

from flask import Flask, jsonify, Response, make_response, session, current_app # Added session, current_app

# Updated imports for the new structure
from app.config import settings
from app.utils.logging import configure_logging
from app.core.exceptions import IOnic2Error, handle_exception

def create_app(bypass_auth: bool = False): # Added bypass_auth parameter
    """
    Create and configure the Flask application.

    Args:
        bypass_auth (bool): If True, bypass authentication for development.

    Returns:
        Flask application instance
    """
    # Create Flask app
    # Flask automatically finds 'static' and 'templates' folders
    # within the app package directory.
    app = Flask(__name__)
    
    # Apply authentication patches to enhance login robustness
    try:
        from app.core.auth_patch import apply_auth_patches
        apply_auth_patches()
        logging.info("Enhanced authentication system applied")
    except Exception as e:
        logging.warning(f"Failed to apply authentication patches: {str(e)}")

    # Configure app settings
    app.secret_key = settings.APP_SECRET_KEY
    app.config['DEBUG'] = settings.DEBUG
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
    app.config['BYPASS_AUTH'] = bypass_auth # Store bypass flag in config

    # Set up logging
    configure_logging(app)

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints (routes)
    register_blueprints(app)

    # Log app startup
    logging.info(f"IOCore2 Coverage Analysis Tool started - {'DEBUG' if app.debug else 'PRODUCTION'} mode")
    logging.info(f"Static files: {app.static_folder}") # Flask finds this automatically
    logging.info(f"Template files: {app.template_folder}") # Flask finds this automatically

    # Add favicon route to prevent 404s
    @app.route('/favicon.ico')
    def favicon():
        # Return an empty 204 No Content response
        return make_response('', 204)

    # Add security headers after each request
    @app.after_request
    def add_security_headers(response: Response):
        # Set comprehensive Permissions-Policy to properly handle all privacy features
        # Include interest-cohort=() since it's detected by the scanner
        response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), interest-cohort=()'

        # We're using <meta> tags in head_favicons.html for CSP
        # Remove CSP headers to prevent conflicts with meta tags
        if 'Content-Security-Policy' in response.headers:
            del response.headers['Content-Security-Policy']

        # Add other common security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Enable HSTS only if using HTTPS
        # response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response

    # --- Auth Bypass Hook ---
    if bypass_auth:
        logging.warning("Authentication Bypass ENABLED for development.")
        @app.before_request
        def inject_dummy_session():
            # Only inject if bypass is on AND no real session exists
            if 'cookies' not in session and current_app.config.get('BYPASS_AUTH', False):
                logging.debug("Injecting dummy session for auth bypass.")
                # Use a simple structure for dummy cookies
                session['cookies'] = {'dummy_session_id': 'bypass-active', 'user': 'bypass_user'}
                # Use the configured API URL (DEFAULT_URL) or a sensible default if not set
                session['url'] = settings.DEFAULT_URL or 'http://localhost:8080' # Corrected setting name
                # Provide a basic dummy user structure
                session['user'] = {'username': 'bypass_user', 'roles': ['admin', 'developer']} # Example roles
                logging.info(f"Auth bypass: Injected dummy session for user 'bypass_user' targeting URL '{session['url']}'")
    # --- End Auth Bypass Hook ---

    return app

def register_error_handlers(app):
    """Register error handlers for the application."""

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(error):
        logging.exception("Unhandled server error")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

    @app.errorhandler(IOnic2Error)
    def handle_ionic2_error(error):
        response = handle_exception(error)
        return jsonify(response), error.status_code

    @app.errorhandler(Exception)
    def handle_general_exception(error):
        response = handle_exception(error)
        return jsonify(response), response.get('status_code', 500)

def register_blueprints(app):
    """Register Flask blueprints with the application."""
    # Updated imports for blueprints
    from app.routes.auth import auth_bp
    from app.routes.api import api_bp
    from app.routes.views import views_bp
    from app.routes.config_items import config_items_bp
    from app.routes.services import services_bp
    from app.routes.gps import gps_bp # Import the new GP blueprint
    from app.routes.models import models_bp # Import the new models blueprint
    from app.routes.actors2gp import actors2gp_bp # Import the new actors to GP blueprint

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)  # Register at root for backward compatibility
    app.register_blueprint(views_bp)
    app.register_blueprint(config_items_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(gps_bp) # Register the new GP blueprint
    app.register_blueprint(models_bp) # Register the new models blueprint
    app.register_blueprint(actors2gp_bp) # Register the new actors to GP blueprint
