"""
Reports and Export Routes
"""

from flask import request, jsonify, send_file
import csv
import io
from app.routes import reports_bp
from app.services.firebase_service import FirebaseService

firebase = FirebaseService()

@reports_bp.route('/workload', methods=['GET'])
def get_workload_report():
    """
    Get teacher workload report
    """
    try:
        teachers = firebase.get_collection('teachers')
        timetable = firebase.get_collection('timetable')
        
        workload = {}
        
        for teacher in teachers:
            teacher_slots = [t for t in timetable if t.get('teacher') == teacher.get('id')]
            unique_subjects = len(set(t.get('subject') for t in teacher_slots))
            unique_classes = len(set(t.get('class_id') for t in teacher_slots))
            
            workload[teacher.get('id')] = {
                'name': teacher.get('name'),
                'subjects': unique_subjects,
                'classes': unique_classes,
                'total_hours': len(teacher_slots)
            }
        
        return jsonify(workload), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/conflicts', methods=['GET'])
def get_conflicts_report():
    """
    Get scheduling conflicts report
    """
    try:
        timetable = firebase.get_collection('timetable')
        conflicts = []
        
        # Check for conflicts
        for slot in timetable:
            conflicting = [t for t in timetable if 
                          t.get('teacher') == slot.get('teacher') and
                          t.get('day') == slot.get('day') and
                          t.get('period') == slot.get('period') and
                          t.get('id') != slot.get('id')]
            
            if conflicting:
                conflicts.append(slot)
        
        return jsonify({
            'conflicts_count': len(conflicts),
            'conflicts': conflicts
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/timetable/pdf/<class_id>', methods=['GET'])
def export_timetable_pdf(class_id):
    """
    Export timetable as PDF (returns CSV for now, integrate PDF library as needed)
    """
    try:
        cls = firebase.get_document('classes', class_id)
        timetable = firebase.get_collection('timetable')
        class_timetable = [t for t in timetable if t.get('class_id') == class_id]
        
        teachers = firebase.get_collection('teachers')
        subjects = firebase.get_collection('subjects')
        
        # Create CSV data
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['TIMETABLE MANAGEMENT SYSTEM'])
        writer.writerow([f"Class: {cls.get('name')}"])
        writer.writerow([f"Department: {cls.get('department')}"])
        writer.writerow([f"Semester: {cls.get('semester')}"])
        writer.writerow([])
        
        # Header
        writer.writerow(['Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        
        # Data
        for period in range(1, 8):
            row = [f'Period {period}']
            for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
                slot = next((t for t in class_timetable 
                           if t.get('day') == day and t.get('period') == str(period)), None)
                if slot:
                    teacher = next((t for t in teachers if t.get('id') == slot.get('teacher')), {})
                    subject = next((s for s in subjects if s.get('id') == slot.get('subject')), {})
                    row.append(f"{subject.get('code')} ({teacher.get('name')})")
                else:
                    row.append('-')
            writer.writerow(row)
        
        # Generate response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'timetable-{cls.get("name")}.csv'
        ), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/timetable/excel/<class_id>', methods=['GET'])
def export_timetable_excel(class_id):
    """
    Export timetable as Excel (CSV format for compatibility)
    """
    try:
        cls = firebase.get_document('classes', class_id)
        timetable = firebase.get_collection('timetable')
        class_timetable = [t for t in timetable if t.get('class_id') == class_id]
        
        teachers = firebase.get_collection('teachers')
        subjects = firebase.get_collection('subjects')
        
        # Create CSV data
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['TIMETABLE MANAGEMENT SYSTEM'])
        writer.writerow([f"Class: {cls.get('name')}"])
        writer.writerow([f"Department: {cls.get('department')}"])
        writer.writerow([f"Semester: {cls.get('semester')}"])
        writer.writerow([])
        
        # Header
        writer.writerow(['Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        
        # Data
        for period in range(1, 8):
            row = [f'Period {period}']
            for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
                slot = next((t for t in class_timetable 
                           if t.get('day') == day and t.get('period') == str(period)), None)
                if slot:
                    teacher = next((t for t in teachers if t.get('id') == slot.get('teacher')), {})
                    subject = next((s for s in subjects if s.get('id') == slot.get('subject')), {})
                    row.append(f"{subject.get('code')} ({teacher.get('name')})")
                else:
                    row.append('-')
            writer.writerow(row)
        
        # Generate response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'timetable-{cls.get("name")}.xlsx'
        ), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """
    Get dashboard statistics
    """
    try:
        teachers = firebase.get_collection('teachers')
        subjects = firebase.get_collection('subjects')
        classes = firebase.get_collection('classes')
        timetable = firebase.get_collection('timetable')
        
        return jsonify({
            'total_teachers': len(teachers),
            'total_subjects': len(subjects),
            'total_classes': len(classes),
            'total_timetables': len(timetable),
            'active_teachers': len([t for t in teachers if t.get('status') == 'Active'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
