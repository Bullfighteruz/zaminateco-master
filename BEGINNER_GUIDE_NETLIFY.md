# Complete Beginner Guide: Fix Your Netlify Website

## Your Website
- **Netlify Site**: https://zaminat-eco.netlify.app/
- **Netlify Dashboard**: https://app.netlify.com/projects/zaminat-eco

## The Problem
Your website is working, but some features (like saving name/surname to database) don't work because:
- The website can't find your backend server
- You need to tell Netlify where your backend is located

## Solution: Add Environment Variable (5 Minutes)

### Step 1: Open Netlify Dashboard
1. Go to: https://app.netlify.com
2. Sign in with your account
3. Click on your site: **"zaminat-eco"**

### Step 2: Go to Environment Variables
1. In the top menu, click **"Site settings"** (gear icon on the right)
2. Scroll down in the left sidebar
3. Click **"Environment variables"**

### Step 3: Add the Variable
You have 2 options:

#### **Option A: Import from File (Easiest)**

1. Click the **"Add a variable"** button (top right, teal color)
2. Click **"Import from a .env file"**
3. In the text area that appears, paste this:

```
VITE_API_URL=http://localhost:3000/api/v1
```

4. **Important**: If you have deployed your backend, replace `http://localhost:3000/api/v1` with your actual backend URL (see below)
5. Leave "Secret" checkbox **unchecked**
6. Keep "All scopes" selected
7. Keep "All deploy contexts" selected
8. Click **"Import variables"** button

#### **Option B: Add Manually**

1. Click the **"Add a variable"** button (top right, teal color)
2. Click **"Add a single variable"**
3. Fill in:
   - **Key**: `VITE_API_URL`
   - **Value**: `http://localhost:3000/api/v1` (or your backend URL)
4. Click **"Add variable"**

### Step 4: Redeploy Your Site
1. Go back to your site dashboard (click "zaminat-eco" in top left)
2. Click **"Deploys"** in the top menu
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait 2-3 minutes for deployment to finish

### Step 5: Test It Works
1. Visit your website: https://zaminat-eco.netlify.app/
2. Open browser console (Press F12, then click "Console" tab)
3. Type this and press Enter:
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
4. You should see: `http://localhost:3000/api/v1` (or your backend URL)

## What Backend URL Should I Use?

### If You Haven't Deployed Backend Yet:
Use this (for now):
```
VITE_API_URL=http://localhost:3000/api/v1
```
**Note**: Backend features won't work until you deploy your backend, but the name/surname feature will work with localStorage.

### If You Have Deployed Backend:

Replace with your actual backend URL. Examples:

**Railway:**
```
VITE_API_URL=https://your-app-name.up.railway.app/api/v1
```

**Render:**
```
VITE_API_URL=https://your-app-name.onrender.com/api/v1
```

**Heroku:**
```
VITE_API_URL=https://your-app-name.herokuapp.com/api/v1
```

## About Name/Surname Feature

**Good News**: The name/surname feature uses `localStorage` (browser storage) and **will work even without a backend**!

- ✅ Works immediately after adding the environment variable
- ✅ Saves to your browser (not a database)
- ✅ Works offline

The database is only needed for:
- User login/authentication
- Syncing data across devices
- Server-side features

## Quick Checklist

- [ ] Opened Netlify dashboard
- [ ] Went to Site settings → Environment variables
- [ ] Added `VITE_API_URL` variable
- [ ] Redeployed the site
- [ ] Tested in browser console

## Need to Deploy Your Backend?

If you want full functionality, you need to deploy your backend too:

### Railway (Easiest - Free):
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to: `backend`
6. Add `DATABASE_URL` environment variable
7. Copy the URL Railway gives you
8. Update `VITE_API_URL` in Netlify with that URL

## Troubleshooting

### Problem: Variable not showing up
- **Solution**: Make sure you redeployed after adding the variable

### Problem: Still getting errors
- **Solution**: Check browser console (F12) for specific error messages

### Problem: Can't find "Environment variables"
- **Solution**: Make sure you're in "Site settings", not the main dashboard

## Summary

1. Add `VITE_API_URL` environment variable in Netlify
2. Redeploy your site
3. Done! Your website will now know where to find the backend

Your site: https://zaminat-eco.netlify.app/

