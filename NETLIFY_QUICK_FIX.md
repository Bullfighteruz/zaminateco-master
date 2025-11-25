# Quick Fix for Netlify Deployment

## The Problem

Your website on Netlify can't connect to the backend because:
- Netlify only hosts static files (your React app)
- Your backend (NestJS + PostgreSQL) needs separate hosting
- The environment variable `VITE_API_URL` is not set in Netlify

## Quick Solution (3 Steps)

### Step 1: Deploy Your Backend

**Option A: Railway (Easiest - 5 minutes)**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. In project settings, set root directory to: `backend`
6. Add environment variable: `DATABASE_URL` (get from Railway's PostgreSQL service)
7. Railway will give you a URL like: `https://your-app.up.railway.app`

**Option B: Render (Free tier available)**
1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Set root directory: `backend`
5. Add environment variables
6. Deploy

### Step 2: Set Environment Variable in Netlify

**Option A: Import from .env file (Easiest)**

1. Open the file `netlify-env-template.env` in your project
2. Replace `https://your-backend-url.com/api/v1` with your actual backend URL
3. Save the file
4. Go to https://app.netlify.com
5. Select your site
6. Go to **Site settings** → **Environment variables**
7. Click **"Add a variable"** → **"Import from a .env file"**
8. Select the `netlify-env-template.env` file
9. Click **Import**

**Option B: Add manually**

1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable**
5. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api/v1` (replace with your actual backend URL)
6. Click **Save**

### Step 3: Redeploy

1. In Netlify, go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## Verify It Works

1. Open your website on Netlify
2. Open browser console (F12)
3. Type: `console.log(import.meta.env.VITE_API_URL)`
4. Should show your backend URL (not `undefined`)

## About Name/Surname Feature

The name/surname feature uses `localStorage` and **should work even without a backend**. If it's not working:

1. Check browser console for errors (F12)
2. Make sure localStorage is enabled in your browser
3. Try clearing browser cache and reloading

The welcome modal saves names to `localStorage`, not to a database. The database is only used if:
- User is logged in (authenticated)
- You want to sync data across devices

## If You Don't Want a Backend

If you want the app to work entirely offline with localStorage:

1. The app already has fallback mechanisms
2. Name/surname will work with localStorage
3. But features like authentication, voting, and data sync won't work

## Need Help?

Check the full guide: `NETLIFY_DEPLOYMENT_GUIDE.md`

