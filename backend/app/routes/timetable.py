"""
Timetable Management Routes
"""

from flask import request, jsonify
from app.routes import timetable_bp
from app.services.firebase_service import FirebaseService
from app.services.conflict_detector import ConflictDetector
from app.utils.validators import validate_timetable_slot_data

firebase = FirebaseService()
conflict_detector = ConflictDetector()

@timetable_bp.route('', methods=['GET'])
def get_timetable():
    """
    Get timetable entries
    Query params: class_id, day, period, teacher
    """
    try:
        timetable = firebase.get_collection('timetable')
        
        # Filter by class if specified
        class_id = request.args.get('class_id')
        if class_id:
            timetable = [t for t in timetable if t.get('class_id') == class_id]
        
        # Filter by day if specified
        day = request.args.get('day')
        if day:
            timetable = [t for t in timetable if t.get('day') == day]
        
        # Filter by period if specified
        period = request.args.get('period')
        if period:
            timetable = [t for t in timetable if t.get('period') == period]
        
        # Filter by teacher if specified
        teacher = request.args.get('teacher')
        if teacher:
            timetable = [t for t in timetable if t.get('teacher') == teacher]
        
        return jsonify(timetable), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetable_bp.route('/<slot_id>', methods=['GET'])
def get_timetable_slot(slot_id):
    """
    Get specific timetable slot by ID
    """
    try:
        slot = firebase.get_document('timetable', slot_id)
        
        if not slot:
            return jsonify({'error': 'Timetable slot not found'}), 404
        
        return jsonify(slot), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetable_bp.route('', methods=['POST'])
def create_timetable_slot():
    """
    Create a new timetable slot
    Expected JSON: {class_id, day, period, teacher, subject}
    """
    try:
        data = request.get_json()
        
        if not validate_timetable_slot_data(data):
            return jsonify({'error': 'Invalid timetable slot data'}), 400
        
        # Check for conflicts
        has_conflict = conflict_detector.check_teacher_conflict(
            teacher_id=data['teacher'],
            day=data['day'],
            period=data['period']
        )
        
        if has_conflict:
            return jsonify({'error': 'Teacher already assigned during this period'}), 409
        
        slot_id = firebase.add_document('timetable', data)
        
        return jsonify({
            'success': True,
            'id': slot_id,
            'message': 'Timetable slot created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetable_bp.route('/<slot_id>', methods=['PUT'])
def update_timetable_slot(slot_id):
    """
    Update an existing timetable slot
    """
    try:
        data = request.get_json()
        
        if not validate_timetable_slot_data(data):
            return jsonify({'error': 'Invalid timetable slot data'}), 400
        
        # Check for conflicts (excluding current slot)
        has_conflict = conflict_detector.check_teacher_conflict(
            teacher_id=data['teacher'],
            day=data['day'],
            period=data['period'],
            exclude_slot_id=slot_id
        )
        
        if has_conflict:
            return jsonify({'error': 'Teacher already assigned during this period'}), 409
        
        firebase.update_document('timetable', slot_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Timetable slot updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetable_bp.route('/<slot_id>', methods=['DELETE'])
def delete_timetable_slot(slot_id):
    """
    Delete a timetable slot
    """
    try:
        firebase.delete_document('timetable', slot_id)
        
        return jsonify({
            'success': True,
            'message': 'Timetable slot deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@timetable_bp.route('/check-conflicts', methods=['POST'])
def check_conflicts():
    """
    Check for scheduling conflicts
    Expected JSON: {teacher, day, period}
    """
    try:
        data = request.get_json()
        
        has_conflict = conflict_detector.check_teacher_conflict(
            teacher_id=data.get('teacher'),
            day=data.get('day'),
            period=data.get('period')
        )
        
        return jsonify({
            'has_conflict': has_conflict,
            'message': 'Teacher already assigned during this period' if has_conflict else 'No conflicts'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
