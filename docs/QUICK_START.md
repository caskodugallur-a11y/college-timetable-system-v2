# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Run Locally (Easiest)

#### 1. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Option A: Using Python (easiest)
python -m http.server 8000

# Option B: Using Node.js
npx http-server

# Option C: Using VS Code Live Server extension
# Open index.html and click "Go Live"
```
✅ Frontend available at: `http://localhost:8000`

#### 2. Backend Setup (Optional)
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python main.py
```
✅ Backend available at: `http://localhost:5000`

### Option 2: Deploy to Cloud (Production Ready)

#### Frontend → Cloudflare Pages
1. Push code to GitHub
2. Connect repo to Cloudflare Pages
3. Done! Auto-deploys on every push

**Time to deploy**: ~2 minutes
**Cost**: FREE

#### Backend → Render
1. Push backend to GitHub
2. Connect repo to Render
3. Add environment variables
4. Done! Auto-deploys on every push

**Time to deploy**: ~5 minutes
**Cost**: FREE (with limitations)

#### Database → Firebase
1. Create Firebase project
2. Set up Firestore database
3. Configure security rules
4. Update connection strings
5. Done!

**Time to deploy**: ~10 minutes
**Cost**: FREE (Spark plan)

---

## 📊 Demo Credentials

**Login Page**: Click "Admin Login" on home page

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Security**: Change these immediately in production!

---

## 🎯 Key Features to Try

### Admin Dashboard
1. Login with demo credentials
2. View statistics
3. Add a teacher
4. Create a subject
5. Create a timetable slot
6. Export as PDF

### Student View
1. Click "Student View" on home page
2. Select department: **BCA**
3. Select class: **III BCA**
4. View timetable
5. Download as PDF

---

## 🔧 Troubleshooting

### Frontend Not Loading
```bash
# Make sure you're in frontend directory
cd frontend

# Check if server is running on correct port
python -m http.server 8000

# Then visit: http://localhost:8000
```

### Backend Not Responding
```bash
# Check if you're in backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Start Flask server
python main.py

# Should see: "Running on http://127.0.0.1:5000"
```

### Can't Connect Frontend to Backend
1. Ensure backend is running on `http://localhost:5000`
2. Check browser console for CORS errors
3. Verify API URLs in `firebase-config.js`

---

## 📁 Project Structure Overview

```
COLLEGE PROJECT/
├── frontend/                 # Website files
│   ├── index.html           # Home page
│   ├── pages/               # Dashboard, Login, Student view
│   ├── assets/              # CSS, JS, Images
│   └── README.md
│
├── backend/                 # API server
│   ├── app/                 # Application code
│   ├── main.py              # Start Flask here
│   ├── requirements.txt      # Python packages
│   └── Procfile             # Render deployment
│
└── docs/                    # Documentation
    ├── README.md            # Full documentation
    ├── CLOUDFLARE_DEPLOYMENT.md
    ├── RENDER_DEPLOYMENT.md
    └── FIREBASE_SETUP.md
```

---

## ✅ Features Included

### Admin Panel
- ✅ Teacher management (Add/Edit/Delete)
- ✅ Subject management
- ✅ Class management
- ✅ Timetable creation with drag-and-drop
- ✅ Automatic conflict detection
- ✅ PDF export
- ✅ Excel export
- ✅ Workload tracking
- ✅ Reports generation

### Student Portal
- ✅ View timetable (no login needed)
- ✅ Download as PDF
- ✅ Faculty directory
- ✅ Responsive design

### Technical Features
- ✅ Modern, responsive UI
- ✅ Mobile-friendly
- ✅ Real-time data updates
- ✅ Input validation
- ✅ CORS enabled
- ✅ Production-ready code

---

## 🌐 Access Points

### Local Development
```
Frontend: http://localhost:8000
Backend:  http://localhost:5000
```

### After Cloudflare Deployment
```
Frontend: https://your-project.pages.dev
Backend:  https://your-api.onrender.com
```

---

## 📱 Test on Mobile

### Local Testing
```bash
# Get your computer's IP address
ipconfig getifaddr en0  # macOS
ipconfig  # Windows (look for IPv4 Address)
hostname -I  # Linux

# Access from mobile on same network
http://<YOUR_IP>:8000
```

### After Deployment
Simply access the Cloudflare Pages URL from any device!

---

## 🚀 Next Steps

1. ✅ **Run locally** - Test all features
2. ✅ **Create GitHub repos** - For deployment
3. ✅ **Deploy frontend** - Cloudflare Pages
4. ✅ **Deploy backend** - Render
5. ✅ **Set up database** - Firebase (optional)
6. ✅ **Test in production** - Everything works!

---

## 📚 Full Documentation

For detailed information:
- [Complete README](README.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Cloudflare Guide](CLOUDFLARE_DEPLOYMENT.md)
- [Render Guide](RENDER_DEPLOYMENT.md)
- [Firebase Guide](FIREBASE_SETUP.md)

---

## 💡 Tips & Tricks

### Reload After Editing
- Frontend: Refresh browser (Ctrl+R or Cmd+R)
- Backend: Server auto-reloads (with `debug=True`)

### Debug Mode
- Open browser DevTools (F12)
- Check Network tab for API calls
- Check Console for JavaScript errors

### Data Persistence
- Local: Data stored in JSON file
- Firebase: Data synced in real-time
- Render: Free tier may sleep after 15 min (upgrade for always-on)

---

## 🆘 Get Help

1. Check error messages in browser console
2. Review deployment logs in Cloudflare/Render
3. Verify all environment variables are set
4. Re-read relevant deployment guide
5. Check documentation files in `docs/` folder

---

## 🎓 Learning Resources

- HTML/CSS: [MDN Web Docs](https://developer.mozilla.org/)
- JavaScript: [JavaScript.info](https://javascript.info/)
- Flask: [Flask Documentation](https://flask.palletsprojects.com/)
- Firebase: [Firebase Docs](https://firebase.google.com/docs)

---

**Ready to go?** Start with **Option 1: Run Locally** to see it working in seconds! 🚀
