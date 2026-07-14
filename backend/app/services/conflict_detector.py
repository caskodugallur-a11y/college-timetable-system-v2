"""
Conflict Detection Service
Detects scheduling conflicts
"""

from app.services.firebase_service import FirebaseService

class ConflictDetector:
    """
    Detects teacher and room conflicts in timetable
    """
    
    def __init__(self):
        self.firebase = FirebaseService()
    
    def check_teacher_conflict(self, teacher_id: str, day: str, period: str, exclude_slot_id: str = None) -> bool:
        """
        Check if teacher is already assigned during this period
        
        Args:
            teacher_id: ID of the teacher
            day: Day of the week
            period: Period number
            exclude_slot_id: ID of slot to exclude from check (for updates)
        
        Returns:
            True if conflict exists, False otherwise
        """
        timetable = self.firebase.get_collection('timetable')
        
        for slot in timetable:
            # Skip the current slot if updating
            if exclude_slot_id and slot.get('id') == exclude_slot_id:
                continue
            
            # Check for conflict
            if (slot.get('teacher') == teacher_id and
                slot.get('day') == day and
                slot.get('period') == period):
                return True
        
        return False
    
    def check_room_conflict(self, room_id: str, day: str, period: str, exclude_slot_id: str = None) -> bool:
        """
        Check if room is already booked during this period
        
        Args:
            room_id: ID of the room
            day: Day of the week
            period: Period number
            exclude_slot_id: ID of slot to exclude from check
        
        Returns:
            True if conflict exists, False otherwise
        """
        timetable = self.firebase.get_collection('timetable')
        
        for slot in timetable:
            if exclude_slot_id and slot.get('id') == exclude_slot_id:
                continue
            
            if (slot.get('room_id') == room_id and
                slot.get('day') == day and
                slot.get('period') == period):
                return True
        
        return False
    
    def get_all_conflicts(self) -> list:
        """
        Get all scheduling conflicts in the timetable
        
        Returns:
            List of conflict objects
        """
        timetable = self.firebase.get_collection('timetable')
        conflicts = []
        
        for i, slot1 in enumerate(timetable):
            for slot2 in timetable[i+1:]:
                # Check teacher conflict
                if (slot1.get('teacher') == slot2.get('teacher') and
                    slot1.get('day') == slot2.get('day') and
                    slot1.get('period') == slot2.get('period')):
                    conflicts.append({
                        'type': 'teacher_conflict',
                        'teacher_id': slot1.get('teacher'),
                        'day': slot1.get('day'),
                        'period': slot1.get('period'),
                        'slots': [slot1.get('id'), slot2.get('id')]
                    })
                
                # Check room conflict if room is tracked
                if ('room_id' in slot1 and 'room_id' in slot2 and
                    slot1.get('room_id') == slot2.get('room_id') and
                    slot1.get('day') == slot2.get('day') and
                    slot1.get('period') == slot2.get('period')):
                    conflicts.append({
                        'type': 'room_conflict',
                        'room_id': slot1.get('room_id'),
                        'day': slot1.get('day'),
                        'period': slot1.get('period'),
                        'slots': [slot1.get('id'), slot2.get('id')]
                    })
        
        return conflicts
    
    def validate_timetable_slot(self, slot_data: dict, exclude_slot_id: str = None) -> dict:
        """
        Validate a timetable slot and return validation result
        
        Args:
            slot_data: Slot data to validate
            exclude_slot_id: ID of slot to exclude from checks
        
        Returns:
            Dictionary with 'valid' boolean and 'errors' list
        """
        errors = []
        
        # Check required fields
        required_fields = ['teacher', 'day', 'period', 'subject', 'class_id']
        for field in required_fields:
            if field not in slot_data or not slot_data[field]:
                errors.append(f'Missing required field: {field}')
        
        if errors:
            return {'valid': False, 'errors': errors}
        
        # Check teacher conflict
        teacher_conflict = self.check_teacher_conflict(
            slot_data['teacher'],
            slot_data['day'],
            slot_data['period'],
            exclude_slot_id
        )
        
        if teacher_conflict:
            errors.append('Teacher is already assigned during this period')
        
        # Check room conflict if applicable
        if 'room_id' in slot_data:
            room_conflict = self.check_room_conflict(
                slot_data['room_id'],
                slot_data['day'],
                slot_data['period'],
                exclude_slot_id
            )
            
            if room_conflict:
                errors.append('Room is already booked during this period')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
