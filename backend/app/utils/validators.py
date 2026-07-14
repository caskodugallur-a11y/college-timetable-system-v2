"""
Input Validators
"""

import re

def validate_login_credentials(username: str, password: str) -> bool:
    """
    Validate login credentials format
    """
    if not username or not password:
        return False
    
    if len(username) < 3 or len(password) < 6:
        return False
    
    return True

def validate_teacher_data(data: dict) -> bool:
    """
    Validate teacher data
    """
    if not data:
        return False
    
    required_fields = ['name', 'department']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False
    
    valid_departments = ['BCA', 'BCom', 'MCom']
    if data.get('department') not in valid_departments:
        return False
    
    valid_statuses = ['Active', 'Inactive']
    if 'status' in data and data['status'] not in valid_statuses:
        return False
    
    return True

def validate_subject_data(data: dict) -> bool:
    """
    Validate subject data
    """
    if not data:
        return False
    
    required_fields = ['name', 'code', 'department', 'semester']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False
    
    valid_departments = ['BCA', 'BCom', 'MCom']
    if data.get('department') not in valid_departments:
        return False
    
    try:
        semester = int(data.get('semester', 0))
        if semester < 1 or semester > 6:
            return False
    except:
        return False
    
    return True

def validate_class_data(data: dict) -> bool:
    """
    Validate class data
    """
    if not data:
        return False
    
    required_fields = ['name', 'department', 'semester']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False
    
    valid_departments = ['BCA', 'BCom', 'MCom']
    if data.get('department') not in valid_departments:
        return False
    
    try:
        semester = int(data.get('semester', 0))
        if semester < 1 or semester > 6:
            return False
    except:
        return False
    
    return True

def validate_timetable_slot_data(data: dict) -> bool:
    """
    Validate timetable slot data
    """
    if not data:
        return False
    
    required_fields = ['class_id', 'day', 'period', 'teacher', 'subject']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False
    
    valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    if data.get('day') not in valid_days:
        return False
    
    try:
        period = int(data.get('period', 0))
        if period < 1 or period > 7:
            return False
    except:
        return False
    
    return True

def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
