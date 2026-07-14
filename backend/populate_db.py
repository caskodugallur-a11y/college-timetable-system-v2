import os
import sys

# Add backend directory to Python path
sys.path.append(os.path.dirname(__file__))

from app.services.firebase_service import FirebaseService

def populate():
    print("Connecting to Firebase...")
    try:
        firebase = FirebaseService()
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        print("Please check serviceAccountKey.json is placed in the backend directory.")
        return

    print("Clearing existing Firestore collections...")
    for collection in ['timetable', 'subjects', 'classes', 'teachers']:
        try:
            docs = firebase.get_collection(collection)
            for doc in docs:
                firebase.delete_document(collection, doc['id'])
            print(f"Cleared collection: {collection}")
        except Exception as e:
            print(f"Error clearing collection {collection}: {e}")

    # 1. Create Teachers
    print("Populating Teachers...")
    teachers_data = {
        'Reji S Das': {'name': 'Reji S Das', 'email': 'reji@college.edu', 'department': 'BCA', 'status': 'active', 'phone': '+1234567890'},
        'Roshna K A': {'name': 'Roshna K A', 'email': 'roshna@college.edu', 'department': 'BCA', 'status': 'active', 'phone': '+1234567890'},
        'Ajikumar V P': {'name': 'Ajikumar V P', 'email': 'ajikumar@college.edu', 'department': 'BCA', 'status': 'active', 'phone': '+1234567890'},
        'Bidura V M': {'name': 'Bidura V M', 'email': 'bidura@college.edu', 'department': 'BCA', 'status': 'active', 'phone': '+1234567890'},
        'Sikha O S': {'name': 'Sikha O S', 'email': 'sikha@college.edu', 'department': 'BCom', 'status': 'active', 'phone': '+1234567890'}
    }
    teacher_ids = {}
    for name, data in teachers_data.items():
        teacher_ids[name] = firebase.create_teacher(data)
    print(f"Teachers populated: {list(teacher_ids.keys())}")

    # 2. Create Classes
    print("Populating Classes...")
    classes_data = {
        'III SEM BCA': {'name': 'III SEM BCA', 'code': 'BCA3', 'department': 'BCA', 'semester': 3, 'strength': 40, 'batch_year': 2023},
        'V SEM BCA': {'name': 'V SEM BCA', 'code': 'BCA5', 'department': 'BCA', 'semester': 5, 'strength': 35, 'batch_year': 2022},
        'III SEM BCOM': {'name': 'III SEM BCOM', 'code': 'BCOM3', 'department': 'BCom', 'semester': 3, 'strength': 50, 'batch_year': 2023},
        'V SEM BCOM': {'name': 'V SEM BCOM', 'code': 'BCOM5', 'department': 'BCom', 'semester': 5, 'strength': 45, 'batch_year': 2022}
    }
    class_ids = {}
    for name, data in classes_data.items():
        class_ids[name] = firebase.create_class(data)
    print(f"Classes populated: {list(class_ids.keys())}")

    # 3. Create Subjects
    print("Populating Subjects...")
    subjects_data = [
        # Reji S Das
        {'name': 'Computer Networks Lab', 'code': 'BCA3C201', 'department': 'BCA', 'semester': 3, 'teacher_id': teacher_ids['Reji S Das'], 'hours_per_week': 2, 'credits': 2, 'description': 'Computer Networks Practical Lab'},
        {'name': 'Computer Networks', 'code': 'BCA3C201', 'department': 'BCA', 'semester': 3, 'teacher_id': teacher_ids['Reji S Das'], 'hours_per_week': 4, 'credits': 4, 'description': 'Computer Networks theory'},
        {'name': 'Mastering Content Management Systems', 'code': 'CS3MN205', 'department': 'BCom', 'semester': 3, 'teacher_id': teacher_ids['Reji S Das'], 'hours_per_week': 4, 'credits': 3, 'description': 'Minor CMS Course'},
        {'name': 'Introduction to Data Science', 'code': 'BCA3C203', 'department': 'BCA', 'semester': 3, 'teacher_id': teacher_ids['Reji S Das'], 'hours_per_week': 3, 'credits': 3, 'description': 'Intro to Data Science'},
        {'name': 'Digital Electronics and Computer Architecture', 'code': 'BCASCJ303', 'department': 'BCA', 'semester': 5, 'teacher_id': teacher_ids['Reji S Das'], 'hours_per_week': 4, 'credits': 4, 'description': 'DE & CA'},
        
        # Roshna K A
        {'name': 'Cloud Computing', 'code': 'BCASEJ305(3)', 'department': 'BCA', 'semester': 5, 'teacher_id': teacher_ids['Roshna K A'], 'hours_per_week': 4, 'credits': 3, 'description': 'Elective Cloud Computing'},
        
        # Ajikumar V P
        {'name': 'Data Analytics and Visualization', 'code': 'BCASEJ307(4)', 'department': 'BCA', 'semester': 5, 'teacher_id': teacher_ids['Ajikumar V P'], 'hours_per_week': 4, 'credits': 3, 'description': 'Elective Data Analytics'},
        {'name': 'Progressive Web Application Using PHP', 'code': 'BCASCJ302', 'department': 'BCA', 'semester': 5, 'teacher_id': teacher_ids['Ajikumar V P'], 'hours_per_week': 4, 'credits': 4, 'description': 'Core PHP Web Apps'},
        {'name': 'Foundations of Artificial Intelligence', 'code': 'BCA3C204', 'department': 'BCA', 'semester': 3, 'teacher_id': teacher_ids['Ajikumar V P'], 'hours_per_week': 4, 'credits': 4, 'description': 'Core AI Intro'},
        {'name': 'Website Designing Using Content Management System Lab', 'code': 'BCA3FS113', 'department': 'BCA', 'semester': 3, 'teacher_id': teacher_ids['Ajikumar V P'], 'hours_per_week': 3, 'credits': 2, 'description': 'SEC CMS Practical Lab'},
        
        # Bidura V M
        {'name': 'Data Structures and Algorithms', 'code': 'BCA3CJ201', 'department': 'BCA', 'semester': 3, 'teacher_id': teacher_ids['Bidura V M'], 'hours_per_week': 4, 'credits': 4, 'description': 'Core DSA Course'},
        {'name': 'Emerging Trends in Computer Science', 'code': 'CSC3MN207', 'department': 'BCom', 'semester': 3, 'teacher_id': teacher_ids['Bidura V M'], 'hours_per_week': 5, 'credits': 3, 'description': 'Minor Computer Science'},
        {'name': 'Object Oriented Programming (Java)', 'code': 'BCASCJ301', 'department': 'BCA', 'semester': 5, 'teacher_id': teacher_ids['Bidura V M'], 'hours_per_week': 4, 'credits': 4, 'description': 'Core Java Course'},
        {'name': 'Professional Skill Development for IT Career Excellence', 'code': 'BCA3FS114', 'department': 'BCA', 'semester': 5, 'teacher_id': teacher_ids['Bidura V M'], 'hours_per_week': 1, 'credits': 1, 'description': 'SEC IT Skills'},
        
        # Sikha O S
        {'name': 'Financial Markets and Institutions Planning I', 'code': 'MCM3EJ301', 'department': 'BCom', 'semester': 3, 'teacher_id': teacher_ids['Sikha O S'], 'hours_per_week': 5, 'credits': 3, 'description': 'Elective Financial Markets'},
        {'name': 'Fundamentals of Banking and Insurance', 'code': 'COM5EJ302(2)', 'department': 'BCom', 'semester': 5, 'teacher_id': teacher_ids['Sikha O S'], 'hours_per_week': 3, 'credits': 3, 'description': 'Elective Banking & Insurance'},
        {'name': 'Business Regulations', 'code': 'COM3CJ201', 'department': 'BCom', 'semester': 3, 'teacher_id': teacher_ids['Sikha O S'], 'hours_per_week': 4, 'credits': 4, 'description': 'Core Business Regulations'}
    ]
    subject_ids = {}
    for sub in subjects_data:
        subject_id = firebase.create_subject(sub)
        subject_ids[sub['name']] = subject_id
    print("Subjects populated successfully!")

    # Helper function to find subject ID by name
    def get_subject_id(name):
        return subject_ids[name]

    # 4. Create Timetable Slots
    print("Populating Timetable Slots...")
    slots_data = [
        # REJI S DAS
        ('Reji S Das', 'III SEM BCA', 'Monday', 1, 'Computer Networks Lab', 'Lab 1'),
        ('Reji S Das', 'III SEM BCOM', 'Monday', 3, 'Mastering Content Management Systems', 'Room 301'),
        ('Reji S Das', 'III SEM BCA', 'Monday', 5, 'Introduction to Data Science', 'Room 201'),
        
        ('Reji S Das', 'III SEM BCA', 'Tuesday', 1, 'Computer Networks', 'Room 201'),
        ('Reji S Das', 'III SEM BCOM', 'Tuesday', 3, 'Mastering Content Management Systems', 'Room 301'),
        ('Reji S Das', 'V SEM BCA', 'Tuesday', 5, 'Digital Electronics and Computer Architecture', 'Room 203'),
        
        ('Reji S Das', 'III SEM BCA', 'Wednesday', 1, 'Computer Networks', 'Room 201'),
        ('Reji S Das', 'V SEM BCA', 'Wednesday', 2, 'Digital Electronics and Computer Architecture', 'Room 203'),
        ('Reji S Das', 'V SEM BCA', 'Wednesday', 3, 'Digital Electronics and Computer Architecture', 'Room 203'),
        ('Reji S Das', 'III SEM BCOM', 'Wednesday', 4, 'Mastering Content Management Systems', 'Room 301'),
        
        ('Reji S Das', 'III SEM BCA', 'Thursday', 1, 'Computer Networks', 'Room 201'),
        ('Reji S Das', 'III SEM BCA', 'Thursday', 5, 'Introduction to Data Science', 'Room 201'),
        
        ('Reji S Das', 'III SEM BCOM', 'Friday', 2, 'Mastering Content Management Systems', 'Room 301'),
        ('Reji S Das', 'III SEM BCA', 'Friday', 3, 'Introduction to Data Science', 'Room 201'),
        ('Reji S Das', 'V SEM BCA', 'Friday', 4, 'Digital Electronics and Computer Architecture', 'Room 203'),
        ('Reji S Das', 'III SEM BCA', 'Friday', 5, 'Computer Networks', 'Room 201'),
        
        # ROSHNA K A
        ('Roshna K A', 'V SEM BCA', 'Monday', 1, 'Cloud Computing', 'Room 203'),
        ('Roshna K A', 'V SEM BCA', 'Monday', 5, 'Cloud Computing', 'Room 203'),
        ('Roshna K A', 'V SEM BCA', 'Thursday', 3, 'Cloud Computing', 'Room 203'),
        ('Roshna K A', 'V SEM BCA', 'Thursday', 4, 'Cloud Computing', 'Room 203'),
        
        # AJIKUMAR V P
        ('Ajikumar V P', 'V SEM BCA', 'Monday', 1, 'Data Analytics and Visualization', 'Room 203'),
        ('Ajikumar V P', 'V SEM BCA', 'Monday', 3, 'Progressive Web Application Using PHP', 'Room 203'),
        ('Ajikumar V P', 'III SEM BCA', 'Monday', 4, 'Foundations of Artificial Intelligence', 'Room 201'),
        
        ('Ajikumar V P', 'III SEM BCA', 'Tuesday', 2, 'Foundations of Artificial Intelligence', 'Room 201'),
        ('Ajikumar V P', 'V SEM BCA', 'Tuesday', 3, 'Progressive Web Application Using PHP', 'Room 203'),
        ('Ajikumar V P', 'III SEM BCA', 'Tuesday', 5, 'Website Designing Using Content Management System Lab', 'Lab 2'),
        
        ('Ajikumar V P', 'V SEM BCA', 'Wednesday', 2, 'Progressive Web Application Using PHP', 'Room 203'),
        ('Ajikumar V P', 'V SEM BCA', 'Wednesday', 4, 'Data Analytics and Visualization', 'Room 203'),
        ('Ajikumar V P', 'III SEM BCA', 'Wednesday', 5, 'Website Designing Using Content Management System Lab', 'Lab 2'),
        
        ('Ajikumar V P', 'V SEM BCA', 'Thursday', 1, 'Data Analytics and Visualization', 'Room 203'),
        ('Ajikumar V P', 'III SEM BCA', 'Thursday', 3, 'Foundations of Artificial Intelligence', 'Room 201'),
        ('Ajikumar V P', 'V SEM BCA', 'Thursday', 4, 'Progressive Web Application Using PHP', 'Room 203'),
        
        ('Ajikumar V P', 'III SEM BCA', 'Friday', 1, 'Foundations of Artificial Intelligence', 'Room 201'),
        ('Ajikumar V P', 'V SEM BCA', 'Friday', 3, 'Data Analytics and Visualization', 'Room 203'),
        ('Ajikumar V P', 'III SEM BCA', 'Friday', 5, 'Website Designing Using Content Management System Lab', 'Lab 2'),
        
        # BIDURA V M
        ('Bidura V M', 'III SEM BCA', 'Monday', 1, 'Data Structures and Algorithms', 'Room 201'),
        ('Bidura V M', 'III SEM BCOM', 'Monday', 2, 'Emerging Trends in Computer Science', 'Room 301'),
        ('Bidura V M', 'V SEM BCA', 'Monday', 5, 'Object Oriented Programming (Java)', 'Room 203'),
        
        ('Bidura V M', 'V SEM BCA', 'Tuesday', 1, 'Professional Skill Development for IT Career Excellence', 'Room 203'),
        ('Bidura V M', 'V SEM BCA', 'Tuesday', 2, 'Object Oriented Programming (Java)', 'Room 203'),
        ('Bidura V M', 'III SEM BCA', 'Tuesday', 4, 'Data Structures and Algorithms', 'Room 201'),
        ('Bidura V M', 'III SEM BCOM', 'Tuesday', 5, 'Emerging Trends in Computer Science', 'Room 301'),
        
        ('Bidura V M', 'III SEM BCOM', 'Wednesday', 1, 'Emerging Trends in Computer Science', 'Room 301'),
        ('Bidura V M', 'III SEM BCA', 'Wednesday', 4, 'Data Structures and Algorithms', 'Room 201'),
        
        ('Bidura V M', 'III SEM BCOM', 'Thursday', 1, 'Emerging Trends in Computer Science', 'Room 301'),
        ('Bidura V M', 'III SEM BCA', 'Thursday', 4, 'Data Structures and Algorithms', 'Room 201'),
        
        ('Bidura V M', 'V SEM BCA', 'Friday', 1, 'Object Oriented Programming (Java)', 'Room 203'),
        ('Bidura V M', 'III SEM BCOM', 'Friday', 2, 'Emerging Trends in Computer Science', 'Room 301'),
        ('Bidura V M', 'V SEM BCA', 'Friday', 4, 'Object Oriented Programming (Java)', 'Room 203'),
        
        # SIKHA O S
        ('Sikha O S', 'III SEM BCOM', 'Monday', 3, 'Financial Markets and Institutions Planning I', 'Room 301'),
        ('Sikha O S', 'V SEM BCOM', 'Monday', 4, 'Fundamentals of Banking and Insurance', 'Room 302'),
        
        ('Sikha O S', 'V SEM BCOM', 'Tuesday', 1, 'Fundamentals of Banking and Insurance', 'Room 302'),
        ('Sikha O S', 'III SEM BCOM', 'Tuesday', 3, 'Financial Markets and Institutions Planning I', 'Room 301'),
        ('Sikha O S', 'III SEM BCOM', 'Tuesday', 5, 'Business Regulations', 'Room 301'),
        
        ('Sikha O S', 'III SEM BCOM', 'Wednesday', 1, 'Business Regulations', 'Room 301'),
        ('Sikha O S', 'V SEM BCOM', 'Wednesday', 3, 'Fundamentals of Banking and Insurance', 'Room 302'),
        ('Sikha O S', 'III SEM BCOM', 'Wednesday', 5, 'Financial Markets and Institutions Planning I', 'Room 301'),
        
        ('Sikha O S', 'III SEM BCOM', 'Thursday', 1, 'Financial Markets and Institutions Planning I', 'Room 301'),
        ('Sikha O S', 'III SEM BCOM', 'Thursday', 4, 'Business Regulations', 'Room 301'),
        
        ('Sikha O S', 'III SEM BCOM', 'Friday', 3, 'Financial Markets and Institutions Planning I', 'Room 301'),
        ('Sikha O S', 'III SEM BCOM', 'Friday', 5, 'Business Regulations', 'Room 301')
    ]

    for slot in slots_data:
        t_name, c_name, day, period, s_name, room = slot
        slot_doc = {
            'class_id': class_ids[c_name],
            'teacher_id': teacher_ids[t_name],
            'subject_id': get_subject_id(s_name),
            'day': day,
            'period': period,
            'start_time': get_time_for_period(period)[0],
            'end_time': get_time_for_period(period)[1],
            'room': room,
            'type': 'Lab' if 'Lab' in s_name else 'Lecture'
        }
        firebase.create_timetable_slot(slot_doc)
    
    print("Timetable Slots populated successfully!")
    print("Firestore Database Population Complete! 🚀")

def get_time_for_period(period):
    times = {
        1: ('09:00', '10:00'),
        2: ('10:00', '11:00'),
        3: ('11:15', '12:15'),
        4: ('14:00', '15:00'),
        5: ('15:00', '16:00')
    }
    return times.get(period, ('09:00', '10:00'))

if __name__ == '__main__':
    populate()
