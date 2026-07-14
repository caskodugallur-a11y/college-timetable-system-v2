"""
Subjects Management Routes
"""

from flask import request, jsonify
from app.routes import subjects_bp
from app.services.firebase_service import FirebaseService
from app.utils.validators import validate_subject_data

firebase = FirebaseService()

@subjects_bp.route('', methods=['GET'])
def get_subjects():
    """
    Get all subjects
    Query params: department, semester, teacher
    """
    try:
        subjects = firebase.get_collection('subjects')
        
        # Filter by department if specified
        department = request.args.get('department')
        if department:
            subjects = [s for s in subjects if s.get('department') == department]
        
        # Filter by semester if specified
        semester = request.args.get('semester')
        if semester:
            subjects = [s for s in subjects if s.get('semester') == semester]
        
        # Filter by teacher if specified
        teacher = request.args.get('teacher')
        if teacher:
            subjects = [s for s in subjects if s.get('teacher') == teacher]
        
        return jsonify(subjects), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['GET'])
def get_subject(subject_id):
    """
    Get specific subject by ID
    """
    try:
        subject = firebase.get_document('subjects', subject_id)
        
        if not subject:
            return jsonify({'error': 'Subject not found'}), 404
        
        return jsonify(subject), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('', methods=['POST'])
def create_subject():
    """
    Create a new subject
    Expected JSON: {name, code, department, semester, teacher, hours_per_week, credits}
    """
    try:
        data = request.get_json()
        
        if not validate_subject_data(data):
            return jsonify({'error': 'Invalid subject data'}), 400
        
        subject_id = firebase.add_document('subjects', data)
        
        return jsonify({
            'success': True,
            'id': subject_id,
            'message': 'Subject created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """
    Update an existing subject
    """
    try:
        data = request.get_json()
        
        if not validate_subject_data(data):
            return jsonify({'error': 'Invalid subject data'}), 400
        
        firebase.update_document('subjects', subject_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Subject updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """
    Delete a subject
    """
    try:
        firebase.delete_document('subjects', subject_id)
        
        return jsonify({
            'success': True,
            'message': 'Subject deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
