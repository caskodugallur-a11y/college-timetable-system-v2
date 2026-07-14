"""
Authentication Routes
"""

from flask import request, jsonify
from app.routes import auth_bp
from app.services.firebase_service import FirebaseService
from app.utils.validators import validate_login_credentials

firebase = FirebaseService()

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Admin login endpoint
    Expected JSON: {"username": "admin", "password": "admin123"}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Invalid request'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Validate input
        if not validate_login_credentials(username, password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # For demo, verify against default admin
        if username == 'admin' and password == 'admin123':
            return jsonify({
                'success': True,
                'token': f'demo-token-{username}',
                'username': username,
                'role': 'admin'
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verify authentication token
    Expected Header: Authorization: Bearer <token>
    """
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Missing authorization header'}), 401
        
        token = auth_header.split(' ')[1]
        
        if token.startswith('demo-token-'):
            return jsonify({
                'valid': True,
                'username': token.replace('demo-token-', '')
            }), 200
        
        return jsonify({'valid': False}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout endpoint
    """
    try:
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
