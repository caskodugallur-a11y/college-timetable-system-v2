"""
Routes Package - Initialize all route blueprints
"""

from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
teachers_bp = Blueprint('teachers', __name__, url_prefix='/api/teachers')
subjects_bp = Blueprint('subjects', __name__, url_prefix='/api/subjects')
classes_bp = Blueprint('classes', __name__, url_prefix='/api/classes')
timetable_bp = Blueprint('timetable', __name__, url_prefix='/api/timetable')
reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

# Import route handlers
from . import auth, teachers, subjects, classes, timetable, reports
