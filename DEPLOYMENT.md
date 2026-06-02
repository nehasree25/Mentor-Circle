# Mentor Circle Deployment Guide

This guide will walk you through deploying the Mentor Circle project to:
- **Backend**: Render (with SQLite)
- **Frontend**: Vercel

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Deployment to Render](#backend-deployment-to-render)
3. [Frontend Deployment to Vercel](#frontend-deployment-to-vercel)
4. [SQLite Limitations in Production](#sqlite-limitations-in-production)
5. [Common Deployment Errors & Debugging](#common-deployment-errors--debugging)
6. [Final Production Checklist](#final-production-checklist)

---

## Project Overview

### Technology Stack
- **Frontend**: React + Vite
- **Backend**: Django + Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: SQLite
- **Deployment**:
  - Frontend: Vercel
  - Backend: Render

---

## Backend Deployment to Render

### Prerequisites
1. A GitHub/GitLab account with your project repository
2. A Render account (https://render.com)

### Step 1: Push Your Code to GitHub
Make sure all your backend code is pushed to a GitHub repository.

### Step 2: Create a New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select your repository
4. Configure your web service:
   - **Name**: mentor-circle-backend (or your preferred name)
   - **Region**: Choose the one closest to you
   - **Branch**: main (or your default branch)
   - **Root Directory**: `backend` (IMPORTANT!)
   - **Runtime**: Python
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command**: `gunicorn backend.wsgi --log-file -` (or use the Procfile)
   - **Instance Type**: Free (for student projects)

### Step 3: Set Environment Variables
In the Render dashboard, go to your web service → **Environment** → **Add Environment Variable**.

Add these variables:
| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Generate a strong secret key | Use `python -c 'import secrets; print(secrets.token_urlsafe(50))'` to generate |
| `DEBUG` | `False` | Critical for production |
| `ALLOWED_HOSTS` | `.onrender.com` | Add your Render domain |
| `CORS_ALLOWED_ORIGINS` | Your Vercel URL (e.g., `https://mentor-circle.vercel.app`) | After frontend is deployed |
| `CSRF_TRUSTED_ORIGINS` | Same as `CORS_ALLOWED_ORIGINS` | |

**How to Generate a Strong SECRET_KEY:**
```bash
python -c 'import secrets; print(secrets.token_urlsafe(50))'
```

### Step 4: Deploy!
Click **"Create Web Service"** and wait for the deployment to complete.

### Step 5: Apply Database Migrations
After deployment, in Render:
1. Go to your web service → **Shell**
2. Run these commands:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Optional: Create admin user
   ```

---

## Frontend Deployment to Vercel

### Prerequisites
1. A GitHub/GitLab account with your project repository
2. A Vercel account (https://vercel.com)

### Step 1: Push Your Code to GitHub
Make sure all your frontend code is pushed to your repository.

### Step 2: Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure your project:
   - **Project Name**: mentor-circle-frontend
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (should be auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables
In the Vercel project settings → **Environment Variables**:
- Add: `VITE_API_URL` = Your Render backend URL (e.g., `https://mentor-circle-backend.onrender.com/api`)
  - **IMPORTANT**: Make sure to include the `/api` at the end!

### Step 4: Deploy!
Click **"Deploy"** and wait for the deployment to complete!

### Step 5: Update Backend CORS Settings
After your frontend is deployed and has a URL:
1. Go back to Render → your backend service → **Environment**
2. Update these variables with your new frontend URL:
   - `CORS_ALLOWED_ORIGINS`: `https://your-vercel-url.vercel.app`
   - `CSRF_TRUSTED_ORIGINS`: `https://your-vercel-url.vercel.app`
3. Redeploy your backend (trigger a manual deploy in Render)

---

## SQLite Limitations in Production

### Important Notes About SQLite on Render
While we're using SQLite for this student project, please be aware of these limitations:

1. **Ephemeral Storage**: Render's filesystem is ephemeral. This means:
   - Your SQLite database file (`db.sqlite3`) will be **deleted** every time your service restarts or redeploys
   - All data will be lost on each restart
   - **Workaround**: For a student project, this might be acceptable. For production, use PostgreSQL (Render offers free PostgreSQL databases)

2. **Concurrency**: SQLite doesn't handle high write concurrency well
3. **No Horizontal Scaling**: You can't scale to multiple instances with SQLite

### How to Keep SQLite Data (Temporary Fix)
For demonstration purposes:
- Avoid restarting your Render service unnecessarily
- Know that data will be lost on each deploy/restart

**Recommendation for Real Projects**: Switch to PostgreSQL! Render makes this very easy.

---

## Common Deployment Errors & Debugging

### Backend Errors

#### 1. "ModuleNotFoundError: No module named 'whitenoise'"
- **Fix**: Make sure `whitenoise` is in your `requirements.txt`

#### 2. "DisallowedHost at /"
- **Fix**: Add your Render domain to `ALLOWED_HOSTS` in environment variables

#### 3. CORS Errors: "Access-Control-Allow-Origin missing"
- **Fix**: Check `CORS_ALLOWED_ORIGINS` in backend environment variables

#### 4. Static Files Not Loading
- **Fix**: Make sure you ran `python manage.py collectstatic --noinput` during build

#### 5. Database Errors After Restart
- **Expected with SQLite**: Data is lost on restart. Consider PostgreSQL for persistent data.

### Frontend Errors

#### 1. "API requests failing"
- **Fix**: Check that `VITE_API_URL` in Vercel is correct and includes `/api`

#### 2. Page Not Found on Refresh (404)
- **Fix**: The `vercel.json` we created handles this with rewrites to `index.html`

---

## Final Production Checklist

Before going live, make sure you've completed:

- [ ] Backend deployed to Render
- [ ] All environment variables set in Render
- [ ] `DEBUG=False` in production
- [ ] Database migrations applied
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` set in Vercel
- [ ] CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS updated with frontend URL
- [ ] Both frontend and backend are accessible
- [ ] Tested login/signup flow
- [ ] Tested all major features
- [ ] **Important**: Understand SQLite limitations (data loss on restart)

---

## Need Help?
- Check Render docs: https://docs.render.com
- Check Vercel docs: https://vercel.com/docs
- Django deployment checklist: https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/
