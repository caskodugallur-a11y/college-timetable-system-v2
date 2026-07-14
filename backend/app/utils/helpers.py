"""
Helper Functions
"""

from datetime import datetime
import json

def format_response(success: bool, message: str = '', data: dict = None, status_code: int = 200):
    """
    Format API response
    """
    response = {
        'success': success,
        'message': message
    }
    
    if data:
        response['data'] = data
    
    return response, status_code

def parse_json_safely(json_str: str, default=None):
    """
    Safely parse JSON string
    """
    try:
        return json.loads(json_str)
    except:
        return default

def get_current_timestamp():
    """
    Get current timestamp in ISO format
    """
    return datetime.utcnow().isoformat()

def sanitize_string(text: str) -> str:
    """
    Sanitize string input
    """
    if not text:
        return ''
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Remove special characters that could cause issues
    text = ''.join(char for char in text if char.isalnum() or char in ' -_.')
    
    return text

def get_days_of_week():
    """
    Get list of weekdays
    """
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

def get_periods():
    """
    Get list of periods
    """
    return ['1', '2', '3', '4', '5', '6', '7']

def get_departments():
    """
    Get list of departments
    """
    return ['BCA', 'BCom', 'MCom']

def get_semesters():
    """
    Get list of semesters
    """
    return ['1', '2', '3', '4', '5', '6']

def generate_csv(headers: list, rows: list) -> str:
    """
    Generate CSV string from headers and rows
    """
    csv_content = ','.join(f'"{h}"' for h in headers) + '\n'
    
    for row in rows:
        csv_content += ','.join(f'"{v}"' for v in row) + '\n'
    
    return csv_content

def paginate(items: list, page: int = 1, per_page: int = 10):
    """
    Paginate a list of items
    """
    total = len(items)
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': items[start:end],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }
