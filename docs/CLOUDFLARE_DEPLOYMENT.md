# Cloudflare Pages Deployment Guide

## 📦 Deploy Frontend to Cloudflare Pages

### Prerequisites

- Cloudflare account (free tier available)
- GitHub account with the project repository
- Git installed locally

---

## Step 1: Prepare Your Frontend

1. Remove server-specific configurations:
   - Ensure all files are static (HTML, CSS, JS)
   - No Node.js or Python server required

2. Update API URLs in frontend JavaScript:
   ```javascript
   // In frontend/assets/js/firebase-config.js or dashboard.js
   const API_BASE_URL = 'https://your-backend-api.onrender.com/api';
   ```

3. Create `_redirects` file in frontend directory:
   ```
   /index.html 200
   /pages/* /pages/index.html 200
   ```

---

## Step 2: Push to GitHub

1. Initialize Git (if not already done):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/timetable-system.git
   git push -u origin main
   ```

---

## Step 3: Deploy to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - Sign in with your account

2. **Create Pages Project**
   - Click "Pages" in the left sidebar
   - Click "Create a project"
   - Select "Connect to Git"

3. **Authorize GitHub**
   - Click "Authorize Cloudflare"
   - Select your repository containing the frontend
   - Allow Cloudflare access

4. **Configure Build Settings**
   - Project name: `timetable-system`
   - Production branch: `main`
   - Build command: (leave empty - no build needed for static site)
   - Build output directory: `.` or `frontend`

5. **Environment Variables** (if needed)
   ```
   API_URL = https://your-backend-api.onrender.com/api
   ```

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete
   - Your frontend will be live at: `https://your-project-name.pages.dev`

---

## Step 4: Configure Custom Domain (Optional)

1. In Cloudflare Pages dashboard:
   - Click on your project
   - Go to "Settings"
   - Click "Domains"

2. Add custom domain:
   - Enter your domain name
   - Update DNS records if prompted
   - Cloudflare will provide DNS records to add

---

## Step 5: Update Frontend Configuration

1. Update API URLs to use your Render backend:
   ```javascript
   // In firebase-config.js or dashboard.js
   const API_BASE_URL = 'https://your-backend-api.onrender.com/api';
   ```

2. Commit and push changes:
   ```bash
   git add .
   git commit -m "Update API endpoint"
   git push origin main
   ```

3. Cloudflare will automatically redeploy

---

## Continuous Deployment

Every time you push to the main branch:
1. Cloudflare automatically detects changes
2. Rebuilds the project
3. Deploys to production

---

## Troubleshooting

### Pages Not Showing

1. Check build logs:
   - In Cloudflare dashboard, click project
   - Go to "Deployments"
   - Click on the deployment to see logs

2. Verify directory structure:
   - Ensure HTML files are in correct location
   - Check for typos in file paths

### API Calls Not Working

1. Check CORS headers:
   - Backend must allow requests from your Cloudflare domain
   - Update backend CORS settings

2. Verify API URL:
   - Ensure API_BASE_URL is correct
   - Check network tab in browser dev tools

---

## Production Checklist

- ✅ All API endpoints updated to Render URL
- ✅ Environment variables configured
- ✅ Custom domain configured (optional)
- ✅ SSL/TLS enabled (automatic)
- ✅ Build logs reviewed
- ✅ Functionality tested

---

## Cost

- **Cloudflare Pages**: FREE
- **Custom domain**: FREE if managed by Cloudflare
- **Additional features**: Paid options available

---

## Support

For more information, visit:
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Support](https://support.cloudflare.com/)
