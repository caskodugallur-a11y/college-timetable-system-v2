"""
Flask Application Factory
"""

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv


def create_app(config_name='development'):
    """Create and configure the Flask application"""

    load_dotenv()

    app = Flask(
        __name__,
        static_folder="../../frontend",
        static_url_path=""
    )

    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register blueprints
    from app.routes import (
        auth_bp,
        teachers_bp,
        subjects_bp,
        classes_bp,
        timetable_bp,
        reports_bp
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(teachers_bp)
    app.register_blueprint(subjects_bp)
    app.register_blueprint(classes_bp)
    app.register_blueprint(timetable_bp)
    app.register_blueprint(reports_bp)

    # Serve frontend homepage
    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    # Serve frontend static files
    @app.route("/<path:path>")
    def static_files(path):
        return send_from_directory(app.static_folder, path)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            'status': 'healthy',
            'message': 'Timetable Management System API'
        }, 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500

    return app