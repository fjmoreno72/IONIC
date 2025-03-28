"""
Flask application setup for the IOCore2 Coverage Analysis Tool.
"""
import logging
import os
from pathlib import Path

from flask import Flask, jsonify

from ionic2.config import settings
from ionic2.utils.logging import configure_logging
from ionic2.core.exceptions import IOnic2Error, handle_exception

def create_app():
    """
    Create and configure the Flask application.
    
    Returns:
        Flask application instance
    """
    # Create Flask app
    app = Flask(
        __name__,
        static_folder=str(settings.STATIC_DIR),
        template_folder=str(settings.TEMPLATES_DIR)
    )
    
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
    logging.info(f"Static files: {app.static_folder}")
    logging.info(f"Template files: {app.template_folder}")
    
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
    from ionic2.web.routes.auth import auth_bp
    from ionic2.web.routes.api import api_bp
    from ionic2.web.routes.views import views_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)  # Register at root for backward compatibility
    app.register_blueprint(views_bp)
