"""
Teachers Management Routes
"""

from flask import request, jsonify
from app.routes import teachers_bp
from app.services.firebase_service import FirebaseService
from app.utils.validators import validate_teacher_data

firebase = FirebaseService()

@teachers_bp.route('', methods=['GET'])
def get_teachers():
    """
    Get all teachers
    Query params: department, status
    """
    try:
        teachers = firebase.get_collection('teachers')
        
        # Filter by department if specified
        department = request.args.get('department')
        if department:
            teachers = [t for t in teachers if t.get('department') == department]
        
        # Filter by status if specified
        status = request.args.get('status')
        if status:
            teachers = [t for t in teachers if t.get('status') == status]
        
        return jsonify(teachers), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['GET'])
def get_teacher(teacher_id):
    """
    Get specific teacher by ID
    """
    try:
        teacher = firebase.get_document('teachers', teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        return jsonify(teacher), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('', methods=['POST'])
def create_teacher():
    """
    Create a new teacher
    Expected JSON: {name, department, status}
    """
    try:
        data = request.get_json()
        
        if not validate_teacher_data(data):
            return jsonify({'error': 'Invalid teacher data'}), 400
        
        teacher_id = firebase.add_document('teachers', data)
        
        return jsonify({
            'success': True,
            'id': teacher_id,
            'message': 'Teacher created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['PUT'])
def update_teacher(teacher_id):
    """
    Update an existing teacher
    """
    try:
        data = request.get_json()
        
        if not validate_teacher_data(data):
            return jsonify({'error': 'Invalid teacher data'}), 400
        
        firebase.update_document('teachers', teacher_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Teacher updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['DELETE'])
def delete_teacher(teacher_id):
    """
    Delete a teacher
    """
    try:
        firebase.delete_document('teachers', teacher_id)
        
        return jsonify({
            'success': True,
            'message': 'Teacher deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>/workload', methods=['GET'])
def get_teacher_workload(teacher_id):
    """
    Get teacher's workload and assigned subjects/classes
    """
    try:
        workload = firebase.get_teacher_workload(teacher_id)
        
        return jsonify(workload), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
