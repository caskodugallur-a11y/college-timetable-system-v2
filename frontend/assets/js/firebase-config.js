// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Replace these with your actual Firebase project credentials
// Get these from your Firebase Console: https://console.firebase.google.com

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase initialization (when using Firebase SDK)
// Uncomment these lines when you integrate Firebase SDK
/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
*/

// DEMO MODE: Using localStorage instead of Firebase for development
// This allows you to test the entire application without Firebase

// Demo data storage key
const DEMO_DATA_KEY = 'timetable_system_demo_data';

// Force reset database to load the new official timetable schema once
const SCHEMA_VERSION = 'v4_with_notifications';
const currentVersion = localStorage.getItem('demo_data_schema_version');
if (currentVersion !== SCHEMA_VERSION) {
    localStorage.removeItem(DEMO_DATA_KEY);
    localStorage.setItem('demo_data_schema_version', SCHEMA_VERSION);
}

// Initialize demo database with sample data
function initializeDemoDatabase() {
    const existingData = localStorage.getItem(DEMO_DATA_KEY);
    if (existingData) return JSON.parse(existingData);

    const demoData = {
        teachers: [
            { id: '1', name: 'Reji S Das', department: 'BCA', status: 'active', email: 'reji@college.edu', phone: '+1234567890' },
            { id: '2', name: 'Roshna K A', department: 'BCA', status: 'active', email: 'roshna@college.edu', phone: '+1234567890' },
            { id: '3', name: 'Ajikumar V P', department: 'BCA', status: 'active', email: 'ajikumar@college.edu', phone: '+1234567890' },
            { id: '4', name: 'Bidura V M', department: 'BCA', status: 'active', email: 'bidura@college.edu', phone: '+1234567890' },
            { id: '5', name: 'Sikha O S', department: 'BCom', status: 'active', email: 'sikha@college.edu', phone: '+1234567890' }
        ],
        classes: [
            { id: '1', name: 'III SEM BCA', department: 'BCA', semester: '3' },
            { id: '2', name: 'V SEM BCA', department: 'BCA', semester: '5' },
            { id: '3', name: 'III SEM BCOM', department: 'BCom', semester: '3' },
            { id: '4', name: 'V SEM BCOM', department: 'BCom', semester: '5' }
        ],
        subjects: [
            { id: 's1', name: 'Computer Networks Lab', code: 'BCA3C201', department: 'BCA', semester: '3', teacher: '1', hours_per_week: 2, credits: 2 },
            { id: 's2', name: 'Computer Networks', code: 'BCA3C201', department: 'BCA', semester: '3', teacher: '1', hours_per_week: 4, credits: 4 },
            { id: 's3', name: 'Mastering Content Management Systems', code: 'CS3MN205', department: 'BCom', semester: '3', teacher: '1', hours_per_week: 4, credits: 3 },
            { id: 's4', name: 'Introduction to Data Science', code: 'BCA3C203', department: 'BCA', semester: '3', teacher: '1', hours_per_week: 3, credits: 3 },
            { id: 's5', name: 'Digital Electronics and Computer Architecture', code: 'BCASCJ303', department: 'BCA', semester: '5', teacher: '1', hours_per_week: 4, credits: 4 },
            { id: 's6', name: 'Cloud Computing', code: 'BCASEJ305(3)', department: 'BCA', semester: '5', teacher: '2', hours_per_week: 4, credits: 3 },
            { id: 's7', name: 'Data Analytics and Visualization', code: 'BCASEJ307(4)', department: 'BCA', semester: '5', teacher: '3', hours_per_week: 4, credits: 3 },
            { id: 's8', name: 'Progressive Web Application Using PHP', code: 'BCASCJ302', department: 'BCA', semester: '5', teacher: '3', hours_per_week: 4, credits: 4 },
            { id: 's9', name: 'Foundations of Artificial Intelligence', code: 'BCA3C204', department: 'BCA', semester: '3', teacher: '3', hours_per_week: 4, credits: 4 },
            { id: 's10', name: 'Website Designing Using Content Management System Lab', code: 'BCA3FS113', department: 'BCA', semester: '3', teacher: '3', hours_per_week: 3, credits: 2 },
            { id: 's11', name: 'Data Structures and Algorithms', code: 'BCA3CJ201', department: 'BCA', semester: '3', teacher: '4', hours_per_week: 4, credits: 4 },
            { id: 's12', name: 'Emerging Trends in Computer Science', code: 'CSC3MN207', department: 'BCom', semester: '3', teacher: '4', hours_per_week: 5, credits: 3 },
            { id: 's13', name: 'Object Oriented Programming (Java)', code: 'BCASCJ301', department: 'BCA', semester: '5', teacher: '4', hours_per_week: 4, credits: 4 },
            { id: 's14', name: 'Professional Skill Development for IT Career Excellence', code: 'BCA3FS114', department: 'BCA', semester: '5', teacher: '4', hours_per_week: 1, credits: 1 },
            { id: 's15', name: 'Financial Markets and Institutions Planning I', code: 'MCM3EJ301', department: 'BCom', semester: '3', teacher: '5', hours_per_week: 5, credits: 3 },
            { id: 's16', name: 'Fundamentals of Banking and Insurance', code: 'COM5EJ302(2)', department: 'BCom', semester: '5', teacher: '5', hours_per_week: 3, credits: 3 },
            { id: 's17', name: 'Business Regulations', code: 'COM3CJ201', department: 'BCom', semester: '3', teacher: '5', hours_per_week: 4, credits: 4 }
        ],
        timetable: [
            // Reji S Das (id '1')
            { id: 't1', class_id: '1', day: 'Monday', period: '1', teacher: '1', subject: 's1', room: 'Lab 1' },
            { id: 't2', class_id: '3', day: 'Monday', period: '3', teacher: '1', subject: 's3', room: 'Room 301' },
            { id: 't3', class_id: '1', day: 'Monday', period: '5', teacher: '1', subject: 's4', room: 'Room 201' },
            { id: 't4', class_id: '1', day: 'Tuesday', period: '1', teacher: '1', subject: 's2', room: 'Room 201' },
            { id: 't5', class_id: '3', day: 'Tuesday', period: '3', teacher: '1', subject: 's3', room: 'Room 301' },
            { id: 't6', class_id: '2', day: 'Tuesday', period: '5', teacher: '1', subject: 's5', room: 'Room 203' },
            { id: 't7', class_id: '1', day: 'Wednesday', period: '1', teacher: '1', subject: 's2', room: 'Room 201' },
            { id: 't8', class_id: '2', day: 'Wednesday', period: '2', teacher: '1', subject: 's5', room: 'Room 203' },
            { id: 't9', class_id: '2', day: 'Wednesday', period: '3', teacher: '1', subject: 's5', room: 'Room 203' },
            { id: 't10', class_id: '3', day: 'Wednesday', period: '4', teacher: '1', subject: 's3', room: 'Room 301' },
            { id: 't11', class_id: '1', day: 'Thursday', period: '1', teacher: '1', subject: 's2', room: 'Room 201' },
            { id: 't12', class_id: '1', day: 'Thursday', period: '5', teacher: '1', subject: 's4', room: 'Room 201' },
            { id: 't13', class_id: '3', day: 'Friday', period: '2', teacher: '1', subject: 's3', room: 'Room 301' },
            { id: 't14', class_id: '1', day: 'Friday', period: '3', teacher: '1', subject: 's4', room: 'Room 201' },
            { id: 't15', class_id: '2', day: 'Friday', period: '4', teacher: '1', subject: 's5', room: 'Room 203' },
            { id: 't16', class_id: '1', day: 'Friday', period: '5', teacher: '1', subject: 's2', room: 'Room 201' },

            // Roshna K A (id '2')
            { id: 't17', class_id: '2', day: 'Monday', period: '1', teacher: '2', subject: 's6', room: 'Room 203' },
            { id: 't18', class_id: '2', day: 'Monday', period: '5', teacher: '2', subject: 's6', room: 'Room 203' },
            { id: 't19', class_id: '2', day: 'Thursday', period: '3', teacher: '2', subject: 's6', room: 'Room 203' },
            { id: 't20', class_id: '2', day: 'Thursday', period: '4', teacher: '2', subject: 's6', room: 'Room 203' },

            // Ajikumar V P (id '3')
            { id: 't21', class_id: '2', day: 'Monday', period: '1', teacher: '3', subject: 's7', room: 'Room 203' },
            { id: 't22', class_id: '2', day: 'Monday', period: '3', teacher: '3', subject: 's8', room: 'Room 203' },
            { id: 't23', class_id: '1', day: 'Monday', period: '4', teacher: '3', subject: 's9', room: 'Room 201' },
            { id: 't24', class_id: '1', day: 'Tuesday', period: '2', teacher: '3', subject: 's9', room: 'Room 201' },
            { id: 't25', class_id: '2', day: 'Tuesday', period: '3', teacher: '3', subject: 's8', room: 'Room 203' },
            { id: 't26', class_id: '1', day: 'Tuesday', period: '5', teacher: '3', subject: 's10', room: 'Lab 2' },
            { id: 't27', class_id: '2', day: 'Wednesday', period: '2', teacher: '3', subject: 's8', room: 'Room 203' },
            { id: 't28', class_id: '2', day: 'Wednesday', period: '4', teacher: '3', subject: 's7', room: 'Room 203' },
            { id: 't29', class_id: '1', day: 'Wednesday', period: '5', teacher: '3', subject: 's10', room: 'Lab 2' },
            { id: 't30', class_id: '2', day: 'Thursday', period: '1', teacher: '3', subject: 's7', room: 'Room 203' },
            { id: 't31', class_id: '1', day: 'Thursday', period: '3', teacher: '3', subject: 's9', room: 'Room 201' },
            { id: 't32', class_id: '2', day: 'Thursday', period: '4', teacher: '3', subject: 's8', room: 'Room 203' },
            { id: 't33', class_id: '1', day: 'Friday', period: '1', teacher: '3', subject: 's9', room: 'Room 201' },
            { id: 't34', class_id: '2', day: 'Friday', period: '3', teacher: '3', subject: 's7', room: 'Room 203' },
            { id: 't35', class_id: '1', day: 'Friday', period: '5', teacher: '3', subject: 's10', room: 'Lab 2' },

            // Bidura V M (id '4')
            { id: 't36', class_id: '1', day: 'Monday', period: '1', teacher: '4', subject: 's11', room: 'Room 201' },
            { id: 't37', class_id: '3', day: 'Monday', period: '2', teacher: '4', subject: 's12', room: 'Room 301' },
            { id: 't38', class_id: '2', day: 'Monday', period: '5', teacher: '4', subject: 's13', room: 'Room 203' },
            { id: 't39', class_id: '2', day: 'Tuesday', period: '1', teacher: '4', subject: 's14', room: 'Room 203' },
            { id: 't40', class_id: '2', day: 'Tuesday', period: '2', teacher: '4', subject: 's13', room: 'Room 203' },
            { id: 't41', class_id: '1', day: 'Tuesday', period: '4', teacher: '4', subject: 's11', room: 'Room 201' },
            { id: 't42', class_id: '3', day: 'Tuesday', period: '5', teacher: '4', subject: 's12', room: 'Room 301' },
            { id: 't43', class_id: '3', day: 'Wednesday', period: '1', teacher: '4', subject: 's12', room: 'Room 301' },
            { id: 't44', class_id: '1', day: 'Wednesday', period: '4', teacher: '4', subject: 's11', room: 'Room 201' },
            { id: 't45', class_id: '3', day: 'Thursday', period: '1', teacher: '4', subject: 's12', room: 'Room 301' },
            { id: 't46', class_id: '1', day: 'Thursday', period: '4', teacher: '4', subject: 's11', room: 'Room 201' },
            { id: 't47', class_id: '2', day: 'Friday', period: '1', teacher: '4', subject: 's13', room: 'Room 203' },
            { id: 't48', class_id: '3', day: 'Friday', period: '2', teacher: '4', subject: 's12', room: 'Room 301' },
            { id: 't49', class_id: '2', day: 'Friday', period: '4', teacher: '4', subject: 's13', room: 'Room 203' },

            // Sikha O S (id '5')
            { id: 't50', class_id: '3', day: 'Monday', period: '3', teacher: '5', subject: 's15', room: 'Room 301' },
            { id: 't51', class_id: '4', day: 'Monday', period: '4', teacher: '5', subject: 's16', room: 'Room 302' },
            { id: 't52', class_id: '4', day: 'Tuesday', period: '1', teacher: '5', subject: 's16', room: 'Room 302' },
            { id: 't53', class_id: '3', day: 'Tuesday', period: '3', teacher: '5', subject: 's15', room: 'Room 301' },
            { id: 't54', class_id: '3', day: 'Tuesday', period: '5', teacher: '5', subject: 's17', room: 'Room 301' },
            { id: 't55', class_id: '3', day: 'Wednesday', period: '1', teacher: '5', subject: 's17', room: 'Room 301' },
            { id: 't56', class_id: '4', day: 'Wednesday', period: '3', teacher: '5', subject: 's16', room: 'Room 302' },
            { id: 't57', class_id: '3', day: 'Wednesday', period: '5', teacher: '5', subject: 's15', room: 'Room 301' },
            { id: 't58', class_id: '3', day: 'Thursday', period: '1', teacher: '5', subject: 's15', room: 'Room 301' },
            { id: 't59', class_id: '3', day: 'Thursday', period: '4', teacher: '5', subject: 's17', room: 'Room 301' },
            { id: 't60', class_id: '3', day: 'Friday', period: '3', teacher: '5', subject: 's15', room: 'Room 301' },
            { id: 't61', class_id: '3', day: 'Friday', period: '5', teacher: '5', subject: 's17', room: 'Room 301' }
        ],
        notifications: [
            { id: 'n1', title: 'Welcome to CAS Kodungallur', message: 'Welcome to the new academic session 2026-2027. Wishing all students a productive semester ahead!', type: 'info', department: 'All', timestamp: Date.now() - 86400000, read: [] },
            { id: 'n2', title: 'Internal Exam Schedule Released', message: 'First internal examination will be conducted from July 28 to August 1. Please check the timetable for your respective departments.', type: 'warning', department: 'All', timestamp: Date.now() - 43200000, read: [] },
            { id: 'n3', title: 'BCA Lab Session Update', message: 'Computer Networks Lab sessions will be held in Lab 1. All BCA students must bring their lab records.', type: 'info', department: 'BCA', timestamp: Date.now() - 7200000, read: [] }
        ]
    };

    localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(demoData));
    return demoData;
}

// Get demo database
function getDemoDatabase() {
    const data = localStorage.getItem(DEMO_DATA_KEY);
    return data ? JSON.parse(data) : initializeDemoDatabase();
}

// Save demo database
function saveDemoDatabase(data) {
    localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

// Demo API functions
const DemoAPI = {
    // Teachers
    getTeachers: async () => {
        if (window.APIClient) {
            try {
                return await window.APIClient.getTeachers();
            } catch (e) {
                console.warn("APIClient.getTeachers failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        return db.teachers;
    },
    
    addTeacher: async (teacher) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.createTeacher(teacher);
            } catch (e) {
                console.warn("APIClient.createTeacher failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        teacher.id = Date.now().toString();
        db.teachers.push(teacher);
        saveDemoDatabase(db);
        return teacher;
    },

    updateTeacher: async (id, teacher) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.updateTeacher(id, teacher);
            } catch (e) {
                console.warn("APIClient.updateTeacher failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        const index = db.teachers.findIndex(t => t.id === id);
        if (index !== -1) {
            db.teachers[index] = { ...db.teachers[index], ...teacher };
            saveDemoDatabase(db);
            return db.teachers[index];
        }
        return null;
    },

    deleteTeacher: async (id) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.deleteTeacher(id);
            } catch (e) {
                console.warn("APIClient.deleteTeacher failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        db.teachers = db.teachers.filter(t => t.id !== id);
        saveDemoDatabase(db);
        return true;
    },

    // Subjects
    getSubjects: async () => {
        if (window.APIClient) {
            try {
                const subjects = await window.APIClient.getSubjects();
                return subjects.map(s => ({
                    ...s,
                    teacher: s.teacher_id
                }));
            } catch (e) {
                console.warn("APIClient.getSubjects failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        return db.subjects;
    },

    addSubject: async (subject) => {
        if (window.APIClient) {
            try {
                const data = {
                    ...subject,
                    teacher_id: subject.teacher
                };
                return await window.APIClient.createSubject(data);
            } catch (e) {
                console.warn("APIClient.createSubject failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        subject.id = Date.now().toString();
        db.subjects.push(subject);
        saveDemoDatabase(db);
        return subject;
    },

    updateSubject: async (id, subject) => {
        if (window.APIClient) {
            try {
                const data = {
                    ...subject,
                    teacher_id: subject.teacher
                };
                return await window.APIClient.updateSubject(id, data);
            } catch (e) {
                console.warn("APIClient.updateSubject failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        const index = db.subjects.findIndex(s => s.id === id);
        if (index !== -1) {
            db.subjects[index] = { ...db.subjects[index], ...subject };
            saveDemoDatabase(db);
            return db.subjects[index];
        }
        return null;
    },

    deleteSubject: async (id) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.deleteSubject(id);
            } catch (e) {
                console.warn("APIClient.deleteSubject failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        db.subjects = db.subjects.filter(s => s.id !== id);
        saveDemoDatabase(db);
        return true;
    },

    // Classes
    getClasses: async () => {
        if (window.APIClient) {
            try {
                return await window.APIClient.getClasses();
            } catch (e) {
                console.warn("APIClient.getClasses failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        return db.classes;
    },

    addClass: async (cls) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.createClass(cls);
            } catch (e) {
                console.warn("APIClient.createClass failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        cls.id = Date.now().toString();
        db.classes.push(cls);
        saveDemoDatabase(db);
        return cls;
    },

    updateClass: async (id, cls) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.updateClass(id, cls);
            } catch (e) {
                console.warn("APIClient.updateClass failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        const index = db.classes.findIndex(c => c.id === id);
        if (index !== -1) {
            db.classes[index] = { ...db.classes[index], ...cls };
            saveDemoDatabase(db);
            return db.classes[index];
        }
        return null;
    },

    deleteClass: async (id) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.deleteClass(id);
            } catch (e) {
                console.warn("APIClient.deleteClass failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        db.classes = db.classes.filter(c => c.id !== id);
        // Also remove timetable entries for this class
        db.timetable = db.timetable.filter(t => t.class_id !== id);
        saveDemoDatabase(db);
        return true;
    },

    // Timetable
    getTimetable: async (classId = null) => {
        if (window.APIClient) {
            try {
                const filters = classId ? { class_id: classId } : {};
                const list = await window.APIClient.getTimetable(filters);
                return list.map(slot => ({
                    ...slot,
                    teacher: slot.teacher || slot.teacher_id,
                    subject: slot.subject || slot.subject_id,
                    period: slot.period.toString()
                }));
            } catch (e) {
                console.warn("APIClient.getTimetable failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        if (classId) {
            return db.timetable.filter(t => t.class_id === classId);
        }
        return db.timetable;
    },

    saveTimetableSlot: async (slot) => {
        if (window.APIClient) {
            try {
                const periodInt = parseInt(slot.period);
                const get_time_for_period = (p) => {
                    const times = {
                        1: ['08:30', '09:30'],
                        2: ['09:30', '10:30'],
                        3: ['10:30', '11:25'],
                        4: ['11:40', '12:30'],
                        5: ['12:30', '13:30']
                    };
                    return times[p] || ['08:30', '09:30'];
                };
                const timeRange = get_time_for_period(periodInt);
                const data = {
                    class_id: slot.class_id,
                    day: slot.day,
                    period: periodInt,
                    teacher: slot.teacher,
                    teacher_id: slot.teacher,
                    subject: slot.subject,
                    subject_id: slot.subject,
                    start_time: timeRange[0],
                    end_time: timeRange[1],
                    type: 'Lecture'
                };
                if (slot.id && !slot.id.startsWith('temp_') && isNaN(slot.id)) {
                    return await window.APIClient.updateTimetableSlot(slot.id, data);
                } else {
                    return await window.APIClient.createTimetableSlot(data);
                }
            } catch (e) {
                console.warn("APIClient.saveTimetableSlot failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        slot.id = slot.id || Date.now().toString();
        
        // Check for duplicates
        const existingIndex = db.timetable.findIndex(t => 
            t.class_id === slot.class_id && 
            t.day === slot.day && 
            t.period === slot.period
        );
        
        if (existingIndex !== -1) {
            // Update existing
            db.timetable[existingIndex] = slot;
        } else {
            // Add new
            db.timetable.push(slot);
        }
        
        saveDemoDatabase(db);
        return slot;
    },

    deleteTimetableSlot: async (id) => {
        if (window.APIClient) {
            try {
                return await window.APIClient.deleteTimetableSlot(id);
            } catch (e) {
                console.warn("APIClient.deleteTimetableSlot failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        db.timetable = db.timetable.filter(t => t.id !== id);
        saveDemoDatabase(db);
        return true;
    },

    // Statistics
    getStatistics: async () => {
        if (window.APIClient) {
            try {
                const stats = await window.APIClient.getStatistics();
                if (stats && stats.totalTeachers !== undefined) {
                    return stats;
                }
            } catch (e) {
                console.warn("APIClient.getStatistics failed, calculating manually from API data:", e);
            }
            try {
                const teachers = await window.APIClient.getTeachers();
                const subjects = await window.APIClient.getSubjects();
                const classes = await window.APIClient.getClasses();
                const timetable = await window.APIClient.getTimetable();
                return {
                    totalTeachers: teachers.length,
                    totalSubjects: subjects.length,
                    totalClasses: classes.length,
                    totalTimetables: timetable.length
                };
            } catch (e) {
                console.warn("Manual API stats calculation failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        return {
            totalTeachers: db.teachers.length,
            totalSubjects: db.subjects.length,
            totalClasses: db.classes.length,
            totalTimetables: db.timetable.length
        };
    },

    // Check conflicts
    checkTeacherConflict: async (teacherId, day, period) => {
        if (window.APIClient) {
            try {
                const conflict = await window.APIClient.checkConflicts({
                    teacher: teacherId,
                    day: day,
                    period: parseInt(period)
                });
                return conflict.has_conflict;
            } catch (e) {
                console.warn("APIClient.checkConflicts failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        return db.timetable.some(t => 
            t.teacher === teacherId && 
            t.day === day && 
            t.period === period
        );
    },

    // Get teacher workload
    getTeacherWorkload: async () => {
        if (window.APIClient) {
            try {
                return await window.APIClient.getWorkloadReport();
            } catch (e) {
                console.warn("APIClient.getWorkloadReport failed, calculating manually from API:", e);
            }
            try {
                const teachers = await window.APIClient.getTeachers();
                const timetable = await window.APIClient.getTimetable();
                const workload = {};
                teachers.forEach(teacher => {
                    const teacherTimetable = timetable.filter(t => t.teacher_id === teacher.id);
                    const uniqueSubjects = [...new Set(teacherTimetable.map(t => t.subject_id))];
                    const uniqueClasses = [...new Set(teacherTimetable.map(t => t.class_id))];
                    workload[teacher.id] = {
                        teacher: teacher.name,
                        subjects: uniqueSubjects.length,
                        classes: uniqueClasses.length,
                        totalHours: teacherTimetable.length
                    };
                });
                return workload;
            } catch (e) {
                console.warn("Manual API workload failed, falling back to Demo Database:", e);
            }
        }
        const db = getDemoDatabase();
        const workload = {};
        
        db.teachers.forEach(teacher => {
            const teacherTimetable = db.timetable.filter(t => t.teacher === teacher.id);
            const uniqueSubjects = [...new Set(teacherTimetable.map(t => t.subject))];
            const uniqueClasses = [...new Set(teacherTimetable.map(t => t.class_id))];
            
            workload[teacher.id] = {
                teacher: teacher.name,
                subjects: uniqueSubjects.length,
                classes: uniqueClasses.length,
                totalHours: teacherTimetable.length
            };
        });
        
        return workload;
    },

    // Notifications
    getNotifications: async (department = null) => {
        const db = getDemoDatabase();
        if (!db.notifications) db.notifications = [];
        if (department && department !== 'All') {
            return db.notifications.filter(n => n.department === 'All' || n.department === department).sort((a, b) => b.timestamp - a.timestamp);
        }
        return [...db.notifications].sort((a, b) => b.timestamp - a.timestamp);
    },

    addNotification: async (notification) => {
        const db = getDemoDatabase();
        if (!db.notifications) db.notifications = [];
        notification.id = 'n_' + Date.now().toString();
        notification.timestamp = Date.now();
        notification.read = [];
        db.notifications.push(notification);
        saveDemoDatabase(db);
        return notification;
    },

    deleteNotification: async (id) => {
        const db = getDemoDatabase();
        if (!db.notifications) return true;
        db.notifications = db.notifications.filter(n => n.id !== id);
        saveDemoDatabase(db);
        return true;
    },

    markNotificationRead: async (notifId, studentId = 'student_default') => {
        const db = getDemoDatabase();
        if (!db.notifications) return;
        const notif = db.notifications.find(n => n.id === notifId);
        if (notif && !notif.read.includes(studentId)) {
            notif.read.push(studentId);
            saveDemoDatabase(db);
        }
        return notif;
    },

    markAllNotificationsRead: async (studentId = 'student_default') => {
        const db = getDemoDatabase();
        if (!db.notifications) return;
        db.notifications.forEach(n => {
            if (!n.read.includes(studentId)) {
                n.read.push(studentId);
            }
        });
        saveDemoDatabase(db);
        return true;
    },

    getUnreadCount: async (studentId = 'student_default') => {
        const db = getDemoDatabase();
        if (!db.notifications) return 0;
        return db.notifications.filter(n => !n.read.includes(studentId)).length;
    }
};

window.DemoAPI = DemoAPI;
