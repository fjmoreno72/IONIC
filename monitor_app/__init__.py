"""
Lightweight System Monitor Application.

This is a minimal Flask application that only includes login functionality
and system monitoring capabilities.
"""
import logging
from pathlib import Path

from flask import Flask, jsonify, Response, make_response, session, current_app

# Import shared components
from shared_core.auth import login_required, authenticate_user, get_api_client
from shared_core.config import MonitorSettings

def create_monitor_app(bypass_auth: bool = False):
    """
    Create and configure the lightweight monitor Flask application.

    Args:
        bypass_auth (bool): If True, bypass authentication for development.

    Returns:
        Flask application instance
    """
    # Create Flask app
    app = Flask(__name__)
    
    # Configure app settings
    settings = MonitorSettings()
    app.secret_key = settings.APP_SECRET_KEY
    app.config['DEBUG'] = settings.DEBUG
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
    app.config['BYPASS_AUTH'] = bypass_auth

    # Set up logging
    configure_monitor_logging(app)

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints (routes)
    register_monitor_blueprints(app)

    # Log app startup
    logging.info(f"System Monitor started - {'DEBUG' if app.debug else 'PRODUCTION'} mode")

    # Add favicon route to prevent 404s
    @app.route('/favicon.ico')
    def favicon():
        return make_response('', 204)

    # Add security headers after each request
    @app.after_request
    def add_security_headers(response: Response):
        response.headers['Permissions-Policy'] = 'geolocation=(), camera=(), microphone=(), interest-cohort=()'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    # --- Auth Bypass Hook ---
    if bypass_auth:
        logging.warning("Authentication Bypass ENABLED for development.")
        @app.before_request
        def inject_dummy_session():
            if 'cookies' not in session and current_app.config.get('BYPASS_AUTH', False):
                logging.debug("Injecting dummy session for auth bypass.")
                session['cookies'] = {'dummy_session_id': 'bypass-active', 'user': 'bypass_user'}
                session['url'] = settings.DEFAULT_URL or 'http://localhost:8080'
                session['user'] = {'username': 'bypass_user', 'roles': ['admin']}
                logging.info(f"Auth bypass: Injected dummy session for user 'bypass_user' targeting URL '{session['url']}'")

    return app


def configure_monitor_logging(app):
    """Configure logging for the monitor application."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    

def register_error_handlers(app):
    """Register error handlers for the application."""

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(error):
        logging.exception("Unhandled server error")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


def register_monitor_blueprints(flask_app):
    """Register Flask blueprints for the monitor application."""
    from monitor_app.routes.auth import monitor_auth_bp
    from monitor_app.routes.monitor import monitor_bp

    flask_app.register_blueprint(monitor_auth_bp)
    flask_app.register_blueprint(monitor_bp) 