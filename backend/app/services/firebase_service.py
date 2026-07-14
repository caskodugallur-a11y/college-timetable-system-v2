"""
Firebase Service - Handles all Firestore operations using Firebase Admin SDK
Complete CRUD operations for timetable management system
"""

import os
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

class FirebaseService:
    """
    Firebase Firestore Service
    Handles all CRUD operations for timetable management system
    Uses Firebase Admin SDK for secure backend operations
    
    Singleton pattern ensures only one Firebase instance
    """
    
    _instance = None
    _db = None
    
    def __new__(cls):
        """Singleton pattern - ensure only one Firebase instance"""
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        if FirebaseService._db is not None:
            return
        
        try:
            # Get service account key path from environment or default
            service_account_path = os.getenv(
                'FIREBASE_SERVICE_ACCOUNT_KEY',
                'serviceAccountKey.json'
            )
            
            # Resolve path relative to backend directory
            if not os.path.isabs(service_account_path):
                service_account_path = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                    service_account_path
                )
            
            # Initialize Firebase Admin SDK only once
            if not firebase_admin._apps:
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
            
            # Get Firestore client
            FirebaseService._db = firestore.client()
            logger.info("Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise
    
    @property
    def db(self):
        """Get Firestore database instance"""
        if FirebaseService._db is None:
            self.__init__()
        return FirebaseService._db
    
    # ==================== COLLECTION OPERATIONS ====================
    
    def get_collection(self, collection_name: str, filters: Dict = None) -> List[Dict]:
        """
        Get all documents from a collection with optional filters
        
        Args:
            collection_name: Name of the collection
            filters: Optional dict with filter conditions {field: value}
        
        Returns:
            List of documents with 'id' field added
        """
        try:
            query = self.db.collection(collection_name)
            
            # Apply filters if provided
            if filters:
                for key, value in filters.items():
                    query = query.where(key, '==', value)
            
            docs = query.stream()
            results = []
            
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            logger.info(f"Retrieved {len(results)} documents from {collection_name}")
            return results
            
        except Exception as e:
            logger.error(f"Error getting collection {collection_name}: {str(e)}")
            raise
    
    def get_document(self, collection_name: str, doc_id: str) -> Optional[Dict]:
        """
        Get a specific document by ID
        
        Args:
            collection_name: Name of the collection
            doc_id: Document ID
        
        Returns:
            Document data with 'id' field, or None if not found
        """
        try:
            doc = self.db.collection(collection_name).document(doc_id).get()
            
            if not doc.exists:
                logger.warning(f"Document {doc_id} not found in {collection_name}")
                return None
            
            data = doc.to_dict()
            data['id'] = doc.id
            return data
            
        except Exception as e:
            logger.error(f"Error getting document {doc_id}: {str(e)}")
            raise
    
    def add_document(self, collection_name: str, data: Dict) -> str:
        """
        Add a new document to a collection
        
        Args:
            collection_name: Name of the collection
            data: Document data
        
        Returns:
            Generated document ID
        """
        try:
            # Add metadata
            data['created_at'] = datetime.now()
            data['updated_at'] = datetime.now()
            
            # Add to Firestore with auto-generated ID
            doc_ref = self.db.collection(collection_name).document()
            doc_ref.set(data)
            
            logger.info(f"Document added to {collection_name}: {doc_ref.id}")
            return doc_ref.id
            
        except Exception as e:
            logger.error(f"Error adding document to {collection_name}: {str(e)}")
            raise
    
    def update_document(self, collection_name: str, doc_id: str, data: Dict) -> bool:
        """
        Update an existing document
        
        Args:
            collection_name: Name of the collection
            doc_id: Document ID
            data: Data to update (partial update)
        
        Returns:
            True if successful, False if document not found
        """
        try:
            # Check if document exists
            doc = self.db.collection(collection_name).document(doc_id).get()
            if not doc.exists:
                logger.warning(f"Document {doc_id} not found in {collection_name}")
                return False
            
            # Add update timestamp
            data['updated_at'] = datetime.now()
            
            # Update document
            self.db.collection(collection_name).document(doc_id).update(data)
            logger.info(f"Document {doc_id} updated in {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating document {doc_id}: {str(e)}")
            raise
    
    def delete_document(self, collection_name: str, doc_id: str) -> bool:
        """
        Delete a document
        
        Args:
            collection_name: Name of the collection
            doc_id: Document ID
        
        Returns:
            True if successful, False if document not found
        """
        try:
            # Check if document exists
            doc = self.db.collection(collection_name).document(doc_id).get()
            if not doc.exists:
                logger.warning(f"Document {doc_id} not found in {collection_name}")
                return False
            
            # Delete document
            self.db.collection(collection_name).document(doc_id).delete()
            logger.info(f"Document {doc_id} deleted from {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document {doc_id}: {str(e)}")
            raise
    
    def query_collection(
        self,
        collection_name: str,
        filter_key: str,
        filter_value: Any
    ) -> List[Dict]:
        """
        Query a collection with a simple filter
        
        Args:
            collection_name: Name of the collection
            filter_key: Field to filter by
            filter_value: Value to match
        
        Returns:
            List of matching documents with 'id' field
        """
        try:
            docs = self.db.collection(collection_name) \
                .where(filter_key, '==', filter_value) \
                .stream()
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
            
        except Exception as e:
            logger.error(f"Error querying {collection_name}: {str(e)}")
            raise
    
    # ==================== TEACHER OPERATIONS ====================
    
    def create_teacher(self, teacher_data: Dict) -> str:
        """
        Create a new teacher
        
        Args:
            teacher_data: {name, email, department, status, phone}
        
        Returns:
            Teacher ID
        """
        return self.add_document('teachers', teacher_data)
    
    def get_teachers(self, department: str = None, status: str = None) -> List[Dict]:
        """
        Get all teachers with optional filtering
        
        Args:
            department: Filter by department
            status: Filter by status
        
        Returns:
            List of teachers
        """
        filters = {}
        if department:
            filters['department'] = department
        if status:
            filters['status'] = status
        
        return self.get_collection('teachers', filters if filters else None)
    
    def get_teacher(self, teacher_id: str) -> Optional[Dict]:
        """Get a specific teacher"""
        return self.get_document('teachers', teacher_id)
    
    def update_teacher(self, teacher_id: str, teacher_data: Dict) -> bool:
        """Update teacher information"""
        return self.update_document('teachers', teacher_id, teacher_data)
    
    def delete_teacher(self, teacher_id: str) -> bool:
        """Delete a teacher"""
        return self.delete_document('teachers', teacher_id)
    
    # ==================== SUBJECT OPERATIONS ====================
    
    def create_subject(self, subject_data: Dict) -> str:
        """
        Create a new subject
        
        Args:
            subject_data: {name, code, department, semester, teacher_id, 
                          hours_per_week, credits, description}
        
        Returns:
            Subject ID
        """
        return self.add_document('subjects', subject_data)
    
    def get_subjects(
        self,
        department: str = None,
        semester: int = None,
        teacher_id: str = None
    ) -> List[Dict]:
        """
        Get all subjects with optional filtering
        
        Args:
            department: Filter by department
            semester: Filter by semester
            teacher_id: Filter by teacher
        
        Returns:
            List of subjects
        """
        subjects = self.get_collection('subjects')
        
        if department:
            subjects = [s for s in subjects if s.get('department') == department]
        if semester:
            subjects = [s for s in subjects if s.get('semester') == semester]
        if teacher_id:
            subjects = [s for s in subjects if s.get('teacher_id') == teacher_id]
        
        return subjects
    
    def get_subject(self, subject_id: str) -> Optional[Dict]:
        """Get a specific subject"""
        return self.get_document('subjects', subject_id)
    
    def update_subject(self, subject_id: str, subject_data: Dict) -> bool:
        """Update subject information"""
        return self.update_document('subjects', subject_id, subject_data)
    
    def delete_subject(self, subject_id: str) -> bool:
        """Delete a subject"""
        return self.delete_document('subjects', subject_id)
    
    # ==================== CLASS OPERATIONS ====================
    
    def create_class(self, class_data: Dict) -> str:
        """
        Create a new class
        
        Args:
            class_data: {name, code, department, semester, 
                        strength, batch_year}
        
        Returns:
            Class ID
        """
        return self.add_document('classes', class_data)
    
    def get_classes(self, department: str = None, semester: int = None) -> List[Dict]:
        """
        Get all classes with optional filtering
        
        Args:
            department: Filter by department
            semester: Filter by semester
        
        Returns:
            List of classes
        """
        classes = self.get_collection('classes')
        
        if department:
            classes = [c for c in classes if c.get('department') == department]
        if semester:
            classes = [c for c in classes if c.get('semester') == semester]
        
        return classes
    
    def get_class(self, class_id: str) -> Optional[Dict]:
        """Get a specific class"""
        return self.get_document('classes', class_id)
    
    def update_class(self, class_id: str, class_data: Dict) -> bool:
        """Update class information"""
        return self.update_document('classes', class_id, class_data)
    
    def delete_class(self, class_id: str) -> bool:
        """Delete a class"""
        return self.delete_document('classes', class_id)
    
    # ==================== TIMETABLE OPERATIONS ====================
    
    def create_timetable_slot(self, slot_data: Dict) -> str:
        """
        Create a new timetable slot
        
        Args:
            slot_data: {class_id, teacher_id, subject_id, day, period,
                       start_time, end_time, room, type}
        
        Returns:
            Slot ID
        """
        return self.add_document('timetable', slot_data)
    
    def get_timetable_slots(
        self,
        class_id: str = None,
        day: str = None,
        period: int = None,
        teacher_id: str = None
    ) -> List[Dict]:
        """
        Get timetable slots with optional filtering
        
        Args:
            class_id: Filter by class
            day: Filter by day
            period: Filter by period
            teacher_id: Filter by teacher
        
        Returns:
            List of timetable slots
        """
        slots = self.get_collection('timetable')
        
        if class_id:
            slots = [s for s in slots if s.get('class_id') == class_id]
        if day:
            slots = [s for s in slots if s.get('day') == day]
        if period:
            slots = [s for s in slots if s.get('period') == period]
        if teacher_id:
            slots = [s for s in slots if s.get('teacher_id') == teacher_id]
        
        return slots
    
    def get_timetable_slot(self, slot_id: str) -> Optional[Dict]:
        """Get a specific timetable slot"""
        return self.get_document('timetable', slot_id)
    
    def update_timetable_slot(self, slot_id: str, slot_data: Dict) -> bool:
        """Update timetable slot information"""
        return self.update_document('timetable', slot_id, slot_data)
    
    def delete_timetable_slot(self, slot_id: str) -> bool:
        """Delete a timetable slot"""
        return self.delete_document('timetable', slot_id)
    
    def get_class_timetable(self, class_id: str) -> List[Dict]:
        """Get complete timetable for a class"""
        return self.get_timetable_slots(class_id=class_id)
    
    def get_teacher_timetable(self, teacher_id: str) -> List[Dict]:
        """Get complete timetable for a teacher"""
        return self.get_timetable_slots(teacher_id=teacher_id)
    
    # ==================== CONFLICT DETECTION ====================
    
    def check_teacher_conflict(
        self,
        teacher_id: str,
        day: str,
        period: int
    ) -> bool:
        """
        Check if teacher has conflict in given time slot
        
        Args:
            teacher_id: Teacher ID
            day: Day of week
            period: Period number
        
        Returns:
            True if conflict exists, False otherwise
        """
        try:
            conflicts = self.db.collection('timetable') \
                .where('teacher_id', '==', teacher_id) \
                .where('day', '==', day) \
                .where('period', '==', period) \
                .stream()
            
            return any(True for _ in conflicts)
            
        except Exception as e:
            logger.error(f"Error checking teacher conflict: {str(e)}")
            raise
    
    def check_room_conflict(
        self,
        room: str,
        day: str,
        period: int
    ) -> bool:
        """
        Check if room has conflict in given time slot
        
        Args:
            room: Room number/name
            day: Day of week
            period: Period number
        
        Returns:
            True if conflict exists, False otherwise
        """
        try:
            conflicts = self.db.collection('timetable') \
                .where('room', '==', room) \
                .where('day', '==', day) \
                .where('period', '==', period) \
                .stream()
            
            return any(True for _ in conflicts)
            
        except Exception as e:
            logger.error(f"Error checking room conflict: {str(e)}")
            raise
    
    def check_class_conflict(
        self,
        class_id: str,
        day: str,
        period: int
    ) -> bool:
        """
        Check if class has conflict in given time slot
        
        Args:
            class_id: Class ID
            day: Day of week
            period: Period number
        
        Returns:
            True if conflict exists, False otherwise
        """
        try:
            conflicts = self.db.collection('timetable') \
                .where('class_id', '==', class_id) \
                .where('day', '==', day) \
                .where('period', '==', period) \
                .stream()
            
            return any(True for _ in conflicts)
            
        except Exception as e:
            logger.error(f"Error checking class conflict: {str(e)}")
            raise
    
    # ==================== HELPER METHODS ====================
    
    def get_teacher_workload(self, teacher_id: str) -> Dict:
        """
        Calculate teacher's workload
        
        Args:
            teacher_id: Teacher ID
        
        Returns:
            Workload info {total_hours, subjects, classes}
        """
        try:
            slots = self.get_timetable_slots(teacher_id=teacher_id)
            subjects = self.query_collection('subjects', 'teacher_id', teacher_id)
            
            # Count unique classes
            classes = set(slot.get('class_id') for slot in slots)
            
            return {
                'teacher_id': teacher_id,
                'total_slots': len(slots),
                'unique_classes': len(classes),
                'unique_subjects': len(subjects),
                'subjects': [s.get('name') for s in subjects]
            }
            
        except Exception as e:
            logger.error(f"Error calculating workload: {str(e)}")
            raise
    
    def export_timetable_to_dict(self, class_id: str) -> Dict:
        """
        Export class timetable as organized dictionary
        
        Args:
            class_id: Class ID
        
        Returns:
            Organized timetable dict
        """
        try:
            slots = self.get_timetable_slots(class_id=class_id)
            timetable = {}
            
            for slot in slots:
                day = slot.get('day', 'Unknown')
                if day not in timetable:
                    timetable[day] = {}
                
                period = slot.get('period')
                timetable[day][period] = {
                    'subject': slot.get('subject_id'),
                    'teacher': slot.get('teacher_id'),
                    'room': slot.get('room'),
                    'start_time': slot.get('start_time'),
                    'end_time': slot.get('end_time')
                }
            
            return timetable
            
        except Exception as e:
            logger.error(f"Error exporting timetable: {str(e)}")
            raise
    
    def get_statistics(self) -> Dict:
        """
        Get system statistics
        
        Returns:
            System stats
        """
        try:
            return {
                'total_teachers': len(self.get_collection('teachers')),
                'total_subjects': len(self.get_collection('subjects')),
                'total_classes': len(self.get_collection('classes')),
                'total_slots': len(self.get_collection('timetable'))
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            raise
