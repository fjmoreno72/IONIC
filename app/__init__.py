"""
Flask application setup for the IOCore2 Coverage Analysis Tool.
"""
import logging
import os
from pathlib import Path

from flask import Flask, jsonify, Response, make_response # Added Response, make_response

# Updated imports for the new structure
from app.config import settings
from app.utils.logging import configure_logging
from app.core.exceptions import IOnic2Error, handle_exception

def create_app():
    """
    Create and configure the Flask application.

    Returns:
        Flask application instance
    """
    # Create Flask app
    # Flask automatically finds 'static' and 'templates' folders
    # within the app package directory.
    app = Flask(__name__)

    # Configure app settings
    app.secret_key = settings.APP_SECRET_KEY
    app.config['DEBUG'] = settings.DEBUG
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

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

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)  # Register at root for backward compatibility
    app.register_blueprint(views_bp)
    app.register_blueprint(config_items_bp)
