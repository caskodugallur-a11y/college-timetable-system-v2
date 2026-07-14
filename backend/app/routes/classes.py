"""
Classes Management Routes
"""

from flask import request, jsonify
from app.routes import classes_bp
from app.services.firebase_service import FirebaseService
from app.utils.validators import validate_class_data

firebase = FirebaseService()

@classes_bp.route('', methods=['GET'])
def get_classes():
    """
    Get all classes
    Query params: department, semester
    """
    try:
        classes = firebase.get_collection('classes')
        
        # Filter by department if specified
        department = request.args.get('department')
        if department:
            classes = [c for c in classes if c.get('department') == department]
        
        # Filter by semester if specified
        semester = request.args.get('semester')
        if semester:
            classes = [c for c in classes if c.get('semester') == semester]
        
        return jsonify(classes), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@classes_bp.route('/<class_id>', methods=['GET'])
def get_class(class_id):
    """
    Get specific class by ID
    """
    try:
        cls = firebase.get_document('classes', class_id)
        
        if not cls:
            return jsonify({'error': 'Class not found'}), 404
        
        return jsonify(cls), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@classes_bp.route('', methods=['POST'])
def create_class():
    """
    Create a new class
    Expected JSON: {name, department, semester}
    """
    try:
        data = request.get_json()
        
        if not validate_class_data(data):
            return jsonify({'error': 'Invalid class data'}), 400
        
        class_id = firebase.add_document('classes', data)
        
        return jsonify({
            'success': True,
            'id': class_id,
            'message': 'Class created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@classes_bp.route('/<class_id>', methods=['PUT'])
def update_class(class_id):
    """
    Update an existing class
    """
    try:
        data = request.get_json()
        
        if not validate_class_data(data):
            return jsonify({'error': 'Invalid class data'}), 400
        
        firebase.update_document('classes', class_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Class updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@classes_bp.route('/<class_id>', methods=['DELETE'])
def delete_class(class_id):
    """
    Delete a class
    """
    try:
        firebase.delete_document('classes', class_id)
        
        return jsonify({
            'success': True,
            'message': 'Class deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
