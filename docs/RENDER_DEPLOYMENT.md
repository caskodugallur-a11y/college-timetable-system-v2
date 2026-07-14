# Render Deployment Guide - Backend API

## 🚀 Deploy Flask Backend to Render

### Prerequisites

- Render account (free tier available)
- GitHub account with project repository
- Git installed locally

---

## Step 1: Prepare Backend for Production

1. **Update `requirements.txt`** (already done):
   ```
   Flask==2.3.0
   Flask-CORS==4.0.0
   python-dotenv==1.0.0
   gunicorn==21.2.0
   firebase-admin==6.2.0
   ```

2. **Create `Procfile`** in backend directory:
   ```
   web: gunicorn main:app
   ```

3. **Create `.env` file** (keep locally, don't commit):
   ```
   FLASK_ENV=production
   SECRET_KEY=your-production-secret-key
   PORT=10000
   ```

4. **Update `main.py`** for production:
   ```python
   if __name__ == '__main__':
       debug = os.getenv('FLASK_ENV') == 'development'
       port = int(os.getenv('PORT', 5000))
       
       if os.getenv('FLASK_ENV') == 'production':
           from waitress import serve
           serve(app, host='0.0.0.0', port=port)
       else:
           app.run(host='0.0.0.0', port=port, debug=debug)
   ```

---

## Step 2: Push to GitHub

1. Ensure backend is in a GitHub repository:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend: Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/timetable-api.git
   git push -u origin main
   ```

---

## Step 3: Deploy to Render

1. **Login to Render Dashboard**
   - Go to [https://dashboard.render.com](https://dashboard.render.com)
   - Sign in or create account

2. **Create New Service**
   - Click "New +" in top menu
   - Select "Web Service"

3. **Connect GitHub**
   - Click "Connect account"
   - Authorize Render to access your GitHub
   - Select your backend repository

4. **Configure Service**
   - **Name**: `timetable-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app`
   - **Branch**: `main`

5. **Set Environment Variables**
   - Click "Advanced"
   - Add environment variables:
     ```
     FLASK_ENV = production
     SECRET_KEY = your-secret-key-at-least-32-chars
     PORT = 10000
     DATABASE_URL = (if using database)
     ```

6. **Select Plan**
   - Choose "Free" tier (suitable for learning/demo)
   - Or "Paid" for production with guarantees

7. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your API will be available at: `https://timetable-api-xxxx.onrender.com`

---

## Step 4: Test Backend Deployment

1. **Test Health Check**
   ```bash
   curl https://timetable-api-xxxx.onrender.com/api/health
   ```

   Expected response:
   ```json
   {
       "status": "healthy",
       "message": "Timetable Management System API"
   }
   ```

2. **Test Login Endpoint**
   ```bash
   curl -X POST https://timetable-api-xxxx.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

---

## Step 5: Connect Frontend to Backend

1. **Update frontend API configuration**:
   ```javascript
   // In frontend/assets/js/firebase-config.js
   const API_BASE_URL = 'https://timetable-api-xxxx.onrender.com/api';
   ```

2. **Redeploy frontend** on Cloudflare Pages

---

## Step 6: Configure CORS

Update backend CORS settings to accept requests from Cloudflare Pages:

In `app/__init__.py`:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://your-project.pages.dev",
            "http://localhost:3000",
            "http://localhost:8080"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## Step 7: Set Up Automatic Deployments

1. **Every push to main branch triggers redeploy**
   - Render monitors your GitHub repository
   - Automatically deploys new commits
   - No manual action needed

2. **View deployment logs**
   - In Render dashboard
   - Click your service
   - Go to "Logs" tab

---

## Database Configuration (Optional)

To use a real database instead of JSON file:

1. **Create PostgreSQL database**:
   - In Render dashboard
   - Click "New +"
   - Select "PostgreSQL"
   - Note the connection string

2. **Update requirements.txt**:
   ```
   SQLAlchemy==2.0.0
   psycopg2-binary==2.9.0
   ```

3. **Set DATABASE_URL environment variable** in Render

---

## Scaling & Performance

### Free Tier Limitations:
- Service spins down after 15 minutes of inactivity
- Limited resources
- Suitable for development/demo

### Upgrade to Paid:
- Always-on instances
- Better performance
- Custom domains
- Priority support

---

## Troubleshooting

### Service Won't Start

1. Check logs in Render dashboard:
   ```
   Logs → View deployment logs
   ```

2. Common issues:
   - Missing `Procfile`
   - Wrong start command
   - Missing dependencies in `requirements.txt`

### CORS Errors

1. Check browser console for CORS error messages
2. Verify backend CORS configuration
3. Ensure frontend URL is in allowed origins

### API Timeouts

1. Free tier services spin down after 15 minutes
2. Upgrade to paid plan for consistent performance
3. Implement healthcheck endpoint

---

## Production Checklist

- ✅ `Procfile` created
- ✅ `requirements.txt` updated
- ✅ Environment variables configured
- ✅ CORS properly configured
- ✅ API endpoints tested
- ✅ Logs monitored
- ✅ Backend URL updated in frontend
- ✅ SSL/TLS enabled (automatic)

---

## Cost

- **Render Free Tier**: FREE (with limitations)
- **Render Paid**: $7/month for always-on service
- **PostgreSQL Database**: $15/month and up

---

## Useful Commands

```bash
# View live logs
render logs timetable-api

# Check service status
curl https://timetable-api-xxxx.onrender.com/api/health

# Restart service
# Use Render dashboard or redeploy

# Manual redeploy
git push origin main  # Render auto-deploys on push
```

---

## Documentation

- [Render Documentation](https://render.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/deploying/)
- [Gunicorn Documentation](https://gunicorn.org/)

---

## Support

For issues:
1. Check Render dashboard logs
2. Review Flask error messages
3. Verify environment variables
4. Contact Render support
