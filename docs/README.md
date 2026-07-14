# Timetable Management System - Project Documentation

## 📚 Project Overview

The Timetable Management System is a complete web-based solution for college schedule management. It provides:

- **Admin Dashboard**: Full control over teachers, subjects, classes, and timetables
- **Student Portal**: Read-only access to view timetables
- **Conflict Detection**: Automatic detection of teacher scheduling conflicts
- **Export Features**: PDF and Excel export capabilities
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

---

## 🏗️ Project Structure

```
COLLEGE PROJECT/
│
├── frontend/
│   ├── index.html                 # Landing page
│   ├── pages/
│   │   ├── login.html             # Admin login
│   │   ├── dashboard.html         # Admin dashboard
│   │   └── student-view.html      # Student timetable view
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css          # Complete styling
│   │   ├── js/
│   │   │   ├── firebase-config.js # Firebase & demo API
│   │   │   ├── dashboard.js       # Dashboard logic
│   │   │   ├── auth.js            # Authentication
│   │   │   └── student-view.js    # Student view logic
│   │   └── images/                # Images and assets
│   └── package.json               # Frontend dependencies
│
├── backend/
│   ├── app/
│   │   ├── __init__.py            # Flask app factory
│   │   ├── config.py              # Configuration
│   │   ├── routes/
│   │   │   ├── __init__.py        # Blueprint registration
│   │   │   ├── auth.py            # Authentication routes
│   │   │   ├── teachers.py        # Teacher CRUD
│   │   │   ├── subjects.py        # Subject CRUD
│   │   │   ├── classes.py         # Class CRUD
│   │   │   ├── timetable.py       # Timetable routes
│   │   │   └── reports.py         # Report generation
│   │   ├── services/
│   │   │   ├── firebase_service.py    # Firebase integration
│   │   │   └── conflict_detector.py   # Conflict detection
│   │   └── utils/
│   │       ├── validators.py      # Input validation
│   │       └── helpers.py         # Helper functions
│   ├── main.py                    # Flask app entry point
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment template
│   └── Procfile                   # Render deployment
│
└── docs/
    ├── DEPLOYMENT.md              # Deployment guides
    ├── FIREBASE_SETUP.md          # Firebase setup
    ├── API_DOCUMENTATION.md       # API endpoints
    └── USER_GUIDE.md              # User guide

```

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js 14+ (for frontend development)
- Python 3.8+ (for backend)
- Git
- Firebase account (for production)

### Setup Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Open `index.html` in a web browser (or use a local server):
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

3. Frontend will be available at `http://localhost:8000`

### Setup Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

5. Run the Flask application:
```bash
python main.py
```

6. Backend API will be available at `http://localhost:5000`

---

## 🔐 Default Credentials

For demo purposes, the system comes with default admin credentials:

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials immediately in production!

---

## 📱 Features

### Admin Features

1. **Dashboard**
   - View statistics (total teachers, subjects, classes, timetables)
   - See teacher workload summary
   - Quick action buttons

2. **Teacher Management**
   - Add, edit, and delete teachers
   - Assign multiple subjects
   - Set active/inactive status
   - Search functionality

3. **Subject Management**
   - Create subjects with codes
   - Assign to departments and semesters
   - Link to teachers
   - Set credit hours

4. **Class Management**
   - Create classes (e.g., "III BCA")
   - Organize by department and semester
   - Manage unlimited classes

5. **Timetable Management**
   - Create timetable with drag-and-drop interface
   - 7 periods × 5 days per week
   - Automatic conflict detection
   - Edit any slot at any time

6. **Reports & Export**
   - Export timetables as PDF
   - Export timetables as Excel
   - Generate teacher workload reports
   - Check for scheduling conflicts

### Student Features

1. **View Timetable**
   - Select department and class
   - View read-only timetable
   - No login required

2. **Download PDF**
   - Download personal timetable as PDF
   - Print-friendly format

3. **Faculty Directory**
   - View assigned teachers
   - See subject information

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify-token` - Verify token
- `POST /api/auth/logout` - Logout

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/<id>` - Get specific teacher
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/<id>` - Update teacher
- `DELETE /api/teachers/<id>` - Delete teacher

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/<id>` - Get specific subject
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/<id>` - Update subject
- `DELETE /api/subjects/<id>` - Delete subject

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/<id>` - Get specific class
- `POST /api/classes` - Create class
- `PUT /api/classes/<id>` - Update class
- `DELETE /api/classes/<id>` - Delete class

### Timetable
- `GET /api/timetable` - Get timetable slots
- `POST /api/timetable` - Create timetable slot
- `PUT /api/timetable/<id>` - Update timetable slot
- `DELETE /api/timetable/<id>` - Delete timetable slot
- `POST /api/timetable/check-conflicts` - Check for conflicts

### Reports
- `GET /api/reports/workload` - Get workload report
- `GET /api/reports/conflicts` - Get conflicts report
- `GET /api/reports/statistics` - Get statistics
- `GET /api/reports/timetable/pdf/<class_id>` - Export as PDF
- `GET /api/reports/timetable/excel/<class_id>` - Export as Excel

---

## 🎨 UI Design

### Color Scheme

- **Primary**: #2563EB (Blue)
- **Secondary**: #1E293B (Dark Blue-Gray)
- **Background**: #F8FAFC (Light Gray)
- **Success**: #10B981 (Green)
- **Danger**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)

### Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

---

## 📊 Demo Data

### Teachers (7)
- Ajikumar V P (BCA)
- Bidura V M (BCA)
- Reji S Das (BCom)
- Haifa P M (MCom)
- Fousia P Z (BCA)
- Sikha O S (BCom)
- Roshna K A (MCom)

### Classes (3)
- III BCA (Semester 3)
- V BCA (Semester 5)
- III BCom (Semester 3)

### Subjects (16)
- Data Structures and Algorithms
- Computer Networks
- Foundations of Artificial Intelligence
- Introduction to Data Science
- Website Designing Using CMS Lab
- Object Oriented Programming Java
- PHP Programming
- Data Analytics and Visualization
- Digital Electronics and Computer Architecture
- Cloud Computing
- Corporate Accounting
- Business Regulations
- English
- Kerala Knowledge System
- Emerging Trends in Computer Science
- Mastering Content Management Systems

---

## 🔒 Security Considerations

1. **Authentication**
   - Replace demo credentials with secure authentication
   - Use Firebase Authentication for production
   - Implement JWT tokens

2. **Input Validation**
   - All inputs are validated on both frontend and backend
   - SQL injection prevention
   - XSS protection

3. **CORS**
   - Configured for multiple origins
   - Can be restricted by environment

4. **Environment Variables**
   - Sensitive data stored in `.env`
   - Never commit `.env` to version control
   - Use strong SECRET_KEY in production

---

## 🚀 Deployment

See separate deployment guides:
- [Cloudflare Pages Deployment](CLOUDFLARE_DEPLOYMENT.md)
- [Render Backend Deployment](RENDER_DEPLOYMENT.md)
- [Firebase Setup Guide](FIREBASE_SETUP.md)

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Frontend not loading?**
A: Ensure you're running the frontend server on correct port (8000 by default)

**Q: Backend API not responding?**
A: Check if Flask server is running and CORS is enabled

**Q: Database not saving data?**
A: Ensure `demo_database.json` is in the backend directory with write permissions

**Q: Conflicts not detected?**
A: Run backend API from the correct directory with proper Python environment

---

## 📝 License

This project is created for educational purposes.

---

## 🎓 Project Features Checklist

- ✅ Modern, responsive UI
- ✅ Admin login system
- ✅ Teacher management (CRUD)
- ✅ Subject management (CRUD)
- ✅ Class management (CRUD)
- ✅ Timetable creation and editing
- ✅ Automatic conflict detection
- ✅ Teacher workload tracking
- ✅ PDF export
- ✅ Excel export
- ✅ Student timetable view
- ✅ Search functionality
- ✅ Mobile-friendly design
- ✅ Complete API backend
- ✅ Firebase integration ready
- ✅ Production-ready code

---

**Version**: 1.0.0
**Last Updated**: 2024
**Status**: Production Ready
