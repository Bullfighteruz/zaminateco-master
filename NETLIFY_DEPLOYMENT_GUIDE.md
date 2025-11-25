# Netlify Deployment Guide - Fixing Backend Connection Issues

## Problem Summary

Your website is deployed on Netlify, but the name/surname functionality and other features aren't working because:

1. **Netlify is a static site host** - It can only serve your frontend React app
2. **Your backend (NestJS + PostgreSQL) needs separate hosting** - Netlify cannot run your backend
3. **Missing Environment Variable** - The frontend doesn't know where your backend API is located

## Current Setup

- **Frontend**: React app using Vite (deployed on Netlify) ✅
- **Backend**: NestJS API with PostgreSQL (needs separate hosting) ❌
- **Name/Surname Storage**: Uses `localStorage` (works offline) ✅
- **API Client**: Tries to connect to backend for authentication and data sync

## Solution Options

### Option 1: Deploy Backend Separately (Recommended)

**Step 1: Deploy Backend to a Hosting Service**

Choose one of these platforms:

#### A. Railway (Easiest - Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `backend`
6. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```
7. Railway will automatically deploy and give you a URL like: `https://your-app.railway.app`

#### B. Render
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

#### C. Heroku
1. Go to [heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repo
4. Set buildpack to Node.js
5. Add environment variables
6. Deploy

**Step 2: Configure Netlify Environment Variables**

1. Go to your Netlify dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api/v1` (or your backend URL)
4. Save and redeploy your site

**Step 3: Update netlify.toml (Optional)**

The `netlify.toml` file is already configured correctly. No changes needed.

### Option 2: Make App Fully Offline (localStorage Only)

If you don't want to deploy a backend, you can make the app work entirely with localStorage:

**Pros:**
- No backend needed
- Works immediately on Netlify
- Simpler setup

**Cons:**
- No user authentication
- No data sync across devices
- No server-side features

**Implementation:**
The app already has fallback mechanisms, but you may need to disable backend calls entirely.

### Option 3: Use Netlify Functions (Not Recommended)

Netlify Functions are serverless functions, not suitable for a full NestJS backend. This would require rewriting your backend.

## Quick Fix for Name/Surname Issue

The name/surname functionality **should work** even without a backend because it uses `localStorage`. If it's not working, check:

1. **Browser Console Errors**: Open browser DevTools (F12) and check for errors
2. **localStorage Access**: Make sure your browser allows localStorage
3. **Welcome Modal**: The welcome modal saves name to localStorage - make sure it's not being blocked

## Testing Your Setup

1. **Check Environment Variable**:
   - In Netlify, go to **Deploys** → Click on a deploy → **View deploy log**
   - Check if `VITE_API_URL` is being used

2. **Test Backend Connection**:
   - Open browser console on your live site
   - Type: `console.log(import.meta.env.VITE_API_URL)`
   - Should show your backend URL (not `undefined`)

3. **Test localStorage**:
   - Open browser console
   - Type: `localStorage.getItem('zaminat_user_name')`
   - Should show your saved name data

## Current API Client Configuration

The API client in `src/lib/api-client.ts` uses:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

This means:
- If `VITE_API_URL` is set → uses that URL
- If not set → defaults to `localhost:3000` (won't work on Netlify)

## Recommended Next Steps

1. **Deploy backend to Railway** (easiest option)
2. **Set `VITE_API_URL` in Netlify** environment variables
3. **Redeploy Netlify site** to pick up the new environment variable
4. **Test the connection** using browser console

## Troubleshooting

### Issue: "Failed to fetch" errors
- **Cause**: Backend not deployed or wrong URL
- **Fix**: Deploy backend and set correct `VITE_API_URL`

### Issue: CORS errors
- **Cause**: Backend not allowing requests from your Netlify domain
- **Fix**: Update backend CORS settings to include your Netlify domain

### Issue: Name not saving
- **Cause**: localStorage blocked or JavaScript error
- **Fix**: Check browser console for errors, ensure localStorage is enabled

### Issue: Environment variable not working
- **Cause**: Variable name must start with `VITE_` for Vite to expose it
- **Fix**: Make sure variable is named `VITE_API_URL` (not `API_URL`)

## Database Setup

Your backend needs a PostgreSQL database. Options:

1. **Railway PostgreSQL** (easiest - comes with Railway deployment)
2. **Supabase** (free tier available)
3. **Neon** (free tier available)
4. **AWS RDS** (paid)

## Summary

**The main issue**: Your backend isn't deployed, so API calls fail. The name/surname feature uses localStorage and should work, but if there are any backend calls involved, they'll fail.

**The solution**: Deploy your backend to Railway/Render/Heroku, then set `VITE_API_URL` in Netlify environment variables.

