# Firebase Firestore Integration Guide

Complete setup and usage guide for Firebase Firestore with Flask backend.

## Overview

This guide explains how to set up and use Firebase Firestore with your Flask timetable management system. The integration uses the **Firebase Admin SDK** for secure server-side operations.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Python 3.8+
- Firebase Admin SDK installed: `firebase-admin==6.2.0`
- Service Account Key JSON file from Firebase

---

## Step 1: Download Firebase Service Account Key

### Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file downloads automatically

### Place the Key File

Save the downloaded file as `serviceAccountKey.json` in the backend root directory:

```
backend/
├── serviceAccountKey.json    ← Place downloaded file here
├── main.py
├── requirements.txt
└── app/
```

**⚠️ IMPORTANT: Never commit this file to Git!**

Add to `.gitignore`:
```
serviceAccountKey.json
.env
```

---

## Step 2: Environment Configuration

### Create .env File

Copy the example file:
```bash
cp backend/.env.example backend/.env
```

### Configure .env

Edit `backend/.env`:
```env
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key-change-in-production

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json

# Logging
LOG_LEVEL=INFO
```

---

## Step 3: Firestore Collections Structure

### Database Schema

Your Firestore database will have 4 main collections:

#### **1. teachers** Collection
```json
{
  "id": "auto-generated",
  "name": "Dr. John Smith",
  "email": "john@college.edu",
  "department": "BCA",
  "status": "Active",
  "phone": "9876543210",
  "created_at": "2024-06-18T10:00:00",
  "updated_at": "2024-06-18T10:00:00"
}
```

#### **2. subjects** Collection
```json
{
  "id": "auto-generated",
  "name": "Data Structures",
  "code": "CS101",
  "department": "BCA",
  "semester": 3,
  "teacher_id": "teacher_doc_id",
  "hours_per_week": 4,
  "credits": 3,
  "description": "Fundamentals of data structures",
  "created_at": "2024-06-18T10:00:00",
  "updated_at": "2024-06-18T10:00:00"
}
```

#### **3. classes** Collection
```json
{
  "id": "auto-generated",
  "name": "BCA-3A",
  "code": "BCA3A",
  "department": "BCA",
  "semester": 3,
  "strength": 60,
  "batch_year": 2023,
  "created_at": "2024-06-18T10:00:00",
  "updated_at": "2024-06-18T10:00:00"
}
```

#### **4. timetable** Collection
```json
{
  "id": "auto-generated",
  "class_id": "class_doc_id",
  "teacher_id": "teacher_doc_id",
  "subject_id": "subject_doc_id",
  "day": "Monday",
  "period": 1,
  "start_time": "09:00 AM",
  "end_time": "10:00 AM",
  "room": "Lab-101",
  "type": "Theory",
  "created_at": "2024-06-18T10:00:00",
  "updated_at": "2024-06-18T10:00:00"
}
```

---

## Step 4: Set Up Firestore Security Rules (Optional)

Add these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development: Allow all (not recommended for production)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Production: Authenticate first
    // match /{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

---

## Step 5: Create Composite Indexes (Recommended)

For better query performance, create these indexes in Firebase Console:

**Path:** Firestore Database → Indexes → Create Index

### Index 1: Timetable by Day & Period
- Collection: `timetable`
- Fields: 
  - `day` (Ascending)
  - `period` (Ascending)

### Index 2: Timetable by Teacher & Day & Period
- Collection: `timetable`
- Fields:
  - `teacher_id` (Ascending)
  - `day` (Ascending)
  - `period` (Ascending)

### Index 3: Subjects by Department & Semester
- Collection: `subjects`
- Fields:
  - `department` (Ascending)
  - `semester` (Ascending)

### Index 4: Teachers by Department
- Collection: `teachers`
- Fields:
  - `department` (Ascending)

---

## Step 6: Complete API Reference

### Teachers Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers` | Get all teachers |
| GET | `/api/teachers?department=BCA` | Get teachers by department |
| GET | `/api/teachers/<id>` | Get specific teacher |
| GET | `/api/teachers/<id>/workload` | Get teacher's workload |
| POST | `/api/teachers` | Create new teacher |
| PUT | `/api/teachers/<id>` | Update teacher |
| DELETE | `/api/teachers/<id>` | Delete teacher |

**Example: Create Teacher**
```bash
curl -X POST http://localhost:5000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john@college.edu",
    "department": "BCA",
    "status": "Active",
    "phone": "9876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "id": "doc_id_xyz",
  "message": "Teacher created successfully"
}
```

---

### Subjects Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects |
| GET | `/api/subjects?department=BCA&semester=3` | Get filtered subjects |
| GET | `/api/subjects/<id>` | Get specific subject |
| POST | `/api/subjects` | Create new subject |
| PUT | `/api/subjects/<id>` | Update subject |
| DELETE | `/api/subjects/<id>` | Delete subject |

**Example: Create Subject**
```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Structures",
    "code": "CS101",
    "department": "BCA",
    "semester": 3,
    "teacher_id": "teacher_doc_id",
    "hours_per_week": 4,
    "credits": 3,
    "description": "Fundamentals of data structures"
  }'
```

---

### Classes Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | Get all classes |
| GET | `/api/classes?department=BCA&semester=3` | Get filtered classes |
| GET | `/api/classes/<id>` | Get specific class |
| POST | `/api/classes` | Create new class |
| PUT | `/api/classes/<id>` | Update class |
| DELETE | `/api/classes/<id>` | Delete class |

**Example: Create Class**
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BCA-3A",
    "code": "BCA3A",
    "department": "BCA",
    "semester": 3,
    "strength": 60,
    "batch_year": 2023
  }'
```

---

### Timetable Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timetable` | Get all timetable slots |
| GET | `/api/timetable?class_id=xyz` | Get class timetable |
| GET | `/api/timetable?teacher_id=xyz` | Get teacher timetable |
| GET | `/api/timetable/<id>` | Get specific slot |
| POST | `/api/timetable` | Create new slot |
| PUT | `/api/timetable/<id>` | Update slot |
| DELETE | `/api/timetable/<id>` | Delete slot |

**Example: Create Timetable Slot**
```bash
curl -X POST http://localhost:5000/api/timetable \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": "class_doc_id",
    "teacher_id": "teacher_doc_id",
    "subject_id": "subject_doc_id",
    "day": "Monday",
    "period": 1,
    "start_time": "09:00 AM",
    "end_time": "10:00 AM",
    "room": "Lab-101",
    "type": "Theory"
  }'
```

---

## Step 7: Python Integration Examples

### Using FirebaseService

```python
from app.services.firebase_service import FirebaseService

firebase = FirebaseService()

# ===== CRUD Operations =====
# Get all documents
teachers = firebase.get_collection('teachers')

# Get specific document
teacher = firebase.get_document('teachers', 'doc_id')

# Add new document
doc_id = firebase.add_document('teachers', {
    'name': 'Dr. John Smith',
    'department': 'BCA',
    'status': 'Active'
})

# Update document
firebase.update_document('teachers', doc_id, {'status': 'Inactive'})

# Delete document
firebase.delete_document('teachers', doc_id)

# Query with filter
bca_teachers = firebase.query_collection('teachers', 'department', 'BCA')

# ===== Specialized Methods =====
# Teacher operations
teachers = firebase.get_teachers(department='BCA', status='Active')
workload = firebase.get_teacher_workload('teacher_id')

# Subject operations
subjects = firebase.get_subjects(department='BCA', semester=3)

# Class operations
classes = firebase.get_classes(department='BCA')

# Timetable operations
class_timetable = firebase.get_class_timetable('class_id')
teacher_timetable = firebase.get_teacher_timetable('teacher_id')

# Conflict detection
has_conflict = firebase.check_teacher_conflict('teacher_id', 'Monday', 1)
room_busy = firebase.check_room_conflict('Lab-101', 'Monday', 1)

# Get statistics
stats = firebase.get_statistics()
```

### Using Requests Library

```python
import requests

BASE_URL = "http://localhost:5000/api"

# Create teacher
response = requests.post(
    f"{BASE_URL}/teachers",
    json={
        "name": "Dr. John Smith",
        "email": "john@college.edu",
        "department": "BCA",
        "status": "Active"
    }
)
teacher_id = response.json()['id']

# Get teacher workload
response = requests.get(f"{BASE_URL}/teachers/{teacher_id}/workload")
workload = response.json()

# Update teacher
requests.put(
    f"{BASE_URL}/teachers/{teacher_id}",
    json={"status": "Inactive"}
)

# Delete teacher
requests.delete(f"{BASE_URL}/teachers/{teacher_id}")
```

---

## Step 8: Testing

### Start the Application

```bash
cd backend
python main.py
```

Server runs at `http://localhost:5000`

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "healthy",
  "message": "Timetable Management System API"
}
```

### Test with Postman

1. Import all endpoints into Postman
2. Use the examples above to test CRUD operations
3. Verify responses in Firestore Console

---

## Step 9: Troubleshooting

### Issue: "Failed to initialize Firebase"
**Cause:** Service account key not found
**Solution:** 
- Verify `serviceAccountKey.json` exists in backend root
- Check `.env` file has correct path

### Issue: "FIREBASE_SERVICE_ACCOUNT_KEY not set"
**Cause:** Environment variable missing
**Solution:** Check `.env` file exists and contains the variable

### Issue: "Permission denied" errors
**Cause:** Firestore security rules too restrictive
**Solution:** 
- Go to Firebase Console → Firestore → Rules
- Update rules to allow access

### Issue: Query returns empty results
**Cause:** Collection doesn't exist yet
**Solution:** 
- Create first document manually in Firebase Console
- Or use API to create first document

### Issue: Composite indexes not working
**Cause:** Index not created
**Solution:** 
- Go to Firebase Console → Firestore → Indexes
- Create recommended indexes (Step 5)

---

## File Structure

```
backend/
├── main.py
├── Procfile
├── requirements.txt
├── .env                             ← Your config
├── .env.example                     ← Template
├── serviceAccountKey.json           ← Downloaded from Firebase (in .gitignore!)
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── teachers.py              ← Teachers CRUD
│   │   ├── subjects.py              ← Subjects CRUD
│   │   ├── classes.py               ← Classes CRUD
│   │   ├── timetable.py             ← Timetable CRUD
│   │   └── reports.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── firebase_service.py      ← ⭐ Main Firebase service
│   │   └── conflict_detector.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── helpers.py
│       └── validators.py
│
└── docs/
    ├── FIREBASE_SETUP.md            ← This file
    ├── README.md
    └── QUICK_START.md
```

---

## Security Checklist

- ✅ Service account key not in version control (.gitignore)
- ✅ Environment variables in .env file (not .gitignore'd accidentally)
- ✅ Firestore security rules configured appropriately
- ✅ CORS settings restricted to trusted origins (in production)
- ✅ Input validation on all API endpoints
- ✅ No sensitive data in logs
- ✅ HTTPS enforced in production

---

## Performance Tips

1. **Use Indexes** - Create composite indexes for common queries
2. **Batch Operations** - Use batch writes for multiple documents
3. **Cache Results** - Consider caching frequently accessed data
4. **Limit Fields** - Retrieve only needed fields using projections
5. **Pagination** - Implement pagination for large result sets

---

## Next Steps

1. ✅ Download service account key
2. ✅ Place it in backend root directory
3. ✅ Configure .env file
4. ✅ Create Firestore collections
5. ✅ Set security rules
6. ✅ Create recommended indexes
7. ✅ Start Flask application
8. ✅ Test all endpoints
9. ✅ Deploy to production

---

## Related Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Last Updated:** June 2024  
**Version:** 1.0
   ├── teachers (collection)
   ├── subjects (collection)
   ├── classes (collection)
   └── timetable (collection)
   ```

   To create collections manually:
   - Click "Start collection"
   - Enter collection name: `teachers`
   - Add a document with field: `name` = "Ajikumar V P"
   - Repeat for other collections

---

## Step 3: Get Firebase Credentials

1. **Access Project Settings**
   - Click the gear icon (⚙️) at top left
   - Select "Project Settings"

2. **Get Web Configuration**
   - Go to "Your apps" section
   - Click on your web app (if not created, click "Add App")
   - Copy the configuration object

3. **Web App Config Example**
   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSyD...",
       authDomain: "timetable-management.firebaseapp.com",
       projectId: "timetable-management",
       storageBucket: "timetable-management.appspot.com",
       messagingSenderId: "123456789...",
       appId: "1:123456789:web:abcd..."
   };
   ```

---

## Step 4: Initialize Firebase in Frontend

Update `frontend/assets/js/firebase-config.js`:

```javascript
// Replace demo config with your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## Step 5: Set Up Firestore Security Rules

1. **Go to Firestore Rules**
   - In Firebase console
   - Firestore Database → Rules tab

2. **Replace Default Rules**

   **For Development** (open access):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   **For Production** (secure):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Teachers - Admin only
       match /teachers/{document=**} {
         allow read, write: if request.auth.token.admin == true;
       }
       
       // Subjects - Admin only
       match /subjects/{document=**} {
         allow read, write: if request.auth.token.admin == true;
       }
       
       // Classes - Admin only
       match /classes/{document=**} {
         allow read, write: if request.auth.token.admin == true;
       }
       
       // Timetable - Read for all, write for admin
       match /timetable/{document=**} {
         allow read: if true;
         allow write: if request.auth.token.admin == true;
       }
     }
   }
   ```

3. **Publish Rules**
   - Click "Publish"

---

## Step 6: Set Up Firebase Authentication (Optional)

1. **Enable Authentication**
   - In Firebase console
   - Go to "Authentication"
   - Click "Get Started"
   - Enable "Email/Password" sign-in method

2. **Create Admin User**
   - Go to "Users" tab
   - Click "Create user"
   - Email: `admin@timetable.com`
   - Password: `admin123` (change in production)

3. **Set Custom Claims** (for admin verification)
   - Use Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase auth:import users.json --hash-algo=scrypt
   ```

---

## Step 7: Enable Backend Firebase Integration

1. **Download Service Account Key**
   - In Firebase console
   - Project Settings → Service Accounts tab
   - Click "Generate New Private Key"
   - Save as `backend/serviceAccountKey.json`

2. **⚠️ NEVER COMMIT THIS FILE**
   - Add to `.gitignore`:
   ```
   backend/serviceAccountKey.json
   backend/.env
   ```

3. **Initialize Firebase Admin SDK**
   ```python
   # In backend/app/services/firebase_service.py
   import firebase_admin
   from firebase_admin import credentials, firestore
   
   # Initialize Firebase
   cred = credentials.Certificate('path/to/serviceAccountKey.json')
   firebase_admin.initialize_app(cred)
   
   db = firestore.client()
   ```

---

## Step 8: Configure Environment Variables

**Backend `.env` file**:
```
FIREBASE_PROJECT_ID=timetable-management
FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_AUTH_DOMAIN=timetable-management.firebaseapp.com
FIREBASE_STORAGE_BUCKET=timetable-management.appspot.com
```

**Frontend environment** (in `firebase-config.js`):
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyD...",
    authDomain: "timetable-management.firebaseapp.com",
    projectId: "timetable-management",
    storageBucket: "timetable-management.appspot.com",
    messagingSenderId: "123456789...",
    appId: "1:123456789:web:abcd..."
};
```

---

## Step 9: Import Sample Data

You can import the demo data directly into Firestore:

1. **Via Firebase Console**
   - Firestore Database → Collections
   - Import JSON using the UI
   - Or manually create documents

2. **Via Firebase CLI**
   ```bash
   firebase firestore:import data-export.json
   ```

---

## Step 10: Test Integration

### Test Frontend Connection

```javascript
// In browser console
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();
const querySnapshot = await getDocs(collection(db, "teachers"));
console.log(querySnapshot); // Should show teachers data
```

### Test Backend Connection

```bash
# After backend configured
curl http://localhost:5000/api/teachers
# Should return list of teachers from Firestore
```

---

## Production Checklist

- ✅ Firebase project created
- ✅ Firestore database set up
- ✅ Collections created
- ✅ Security rules configured
- ✅ Service account key downloaded (not committed)
- ✅ Environment variables set
- ✅ Firebase SDK integrated
- ✅ Data imported
- ✅ Connections tested

---

## Firestore Pricing

### Free Tier (Spark Plan)
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- Good for learning/demo

### Paid Tier (Blaze Plan)
- Pay-as-you-go
- $0.06 per 100,000 reads
- $0.18 per 100,000 writes
- Good for production

---

## Common Issues & Solutions

### Connection Error
```
Error: Cannot access Firestore
```
- Check Firebase credentials
- Verify security rules allow your IP/domain
- Ensure Firestore database is enabled

### Permission Denied
```
Error: Missing or insufficient permissions
```
- Check security rules configuration
- Verify user is authenticated (if required)
- Check custom claims setup

### Data Not Appearing
- Verify data was imported correctly
- Check Firestore Collections tab in console
- Check for typos in collection/field names

---

## Useful Firebase Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# List projects
firebase projects:list

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Export data
firebase firestore:export ./backup

# Import data
firebase firestore:import ./backup
```

---

## Migration from Demo to Firebase

1. **Export demo data**
   ```javascript
   // From localStorage
   const demoData = JSON.parse(localStorage.getItem('timetable_system_demo_data'));
   console.log(JSON.stringify(demoData));
   ```

2. **Import to Firestore**
   - Copy data structure
   - Create collections in Firestore
   - Add documents with same data

3. **Update connection code**
   - Switch from localStorage to Firestore SDK
   - Update API endpoints

---

## Useful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## Support

For Firebase support:
- [Firebase Support](https://firebase.google.com/support)
- [Firebase Community](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Slack Community](https://firebase-community.slack.com)
