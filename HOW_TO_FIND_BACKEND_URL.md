# How to Find Your Backend URL

## Important: Netlify Doesn't Deploy Backends!

**Netlify only hosts your frontend (React app).** Your backend (NestJS + PostgreSQL) needs to be deployed separately on platforms like:
- Railway
- Render
- Heroku
- AWS
- Google Cloud

## Step 1: Check If You Have a Backend Deployed

### Check Railway
1. Go to: https://railway.app
2. Sign in with your GitHub account
3. Look for any projects named "zaminat" or "zaminateco"
4. If you find one:
   - Click on the project
   - Look for a service (usually shows "Web Service" or "Backend")
   - Click on it
   - You'll see a URL like: `https://your-app.up.railway.app`
   - **Your backend URL**: `https://your-app.up.railway.app/api/v1`

### Check Render
1. Go to: https://render.com
2. Sign in with your GitHub account
3. Look for any services named "zaminat" or "zaminateco"
4. If you find one:
   - Click on the service
   - Look for "URL" or "Live URL"
   - You'll see a URL like: `https://your-app.onrender.com`
   - **Your backend URL**: `https://your-app.onrender.com/api/v1`

### Check Heroku
1. Go to: https://dashboard.heroku.com
2. Sign in with your account
3. Look for any apps named "zaminat" or "zaminateco"
4. If you find one:
   - Click on the app
   - Click "Settings" tab
   - Look for "Domains" section
   - You'll see a URL like: `https://your-app.herokuapp.com`
   - **Your backend URL**: `https://your-app.herokuapp.com/api/v1`

### Check Your GitHub Repository
1. Go to: https://github.com/Bullfighteruz/zaminateco-master
2. Check if there are any deployment badges or links in the README
3. Look for any environment variable files that might contain backend URLs

## Step 2: If You DON'T Have a Backend Deployed

You need to deploy your backend first. Here's the easiest way:

### Deploy to Railway (Recommended - Free & Easy)

1. **Go to Railway**: https://railway.app
2. **Sign up/Login**: Use your GitHub account
3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `zaminateco-master`
4. **Configure Backend**:
   - Railway will detect your backend folder
   - If not, go to project settings → "Root Directory" → Set to: `backend`
5. **Add PostgreSQL Database**:
   - In your Railway project, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` environment variable
6. **Add Environment Variables**:
   - Go to your backend service → "Variables" tab
   - Add these variables:
     ```
     DATABASE_URL=<automatically set by Railway>
     JWT_SECRET=your-random-secret-key-here
     JWT_REFRESH_SECRET=your-random-refresh-secret-here
     NODE_ENV=production
     PORT=3000
     ```
7. **Get Your Backend URL**:
   - After deployment, Railway will show you a URL
   - It will look like: `https://your-app-name.up.railway.app`
   - **Your backend URL for Netlify**: `https://your-app-name.up.railway.app/api/v1`

### Deploy to Render (Alternative - Free Tier Available)

1. **Go to Render**: https://render.com
2. **Sign up/Login**: Use your GitHub account
3. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set "Root Directory" to: `backend`
   - Set "Build Command": `npm install && npm run build`
   - Set "Start Command": `npm run start:prod`
4. **Add PostgreSQL Database**:
   - Click "New" → "PostgreSQL"
   - Copy the "Internal Database URL"
5. **Add Environment Variables**:
   - Go to your service → "Environment" tab
   - Add:
     ```
     DATABASE_URL=<from PostgreSQL service>
     JWT_SECRET=your-random-secret-key
     JWT_REFRESH_SECRET=your-random-refresh-secret
     NODE_ENV=production
     PORT=3000
     ```
6. **Get Your Backend URL**:
   - After deployment, Render will show you a URL
   - It will look like: `https://your-app-name.onrender.com`
   - **Your backend URL for Netlify**: `https://your-app-name.onrender.com/api/v1`

## Step 3: Test Your Backend URL

Once you have your backend URL, test it:

1. Open your browser
2. Go to: `https://your-backend-url.com/api/v1/health` (or `/api/docs` for API documentation)
3. If you see a response, your backend is working!

## Step 4: Use the URL in Netlify

Once you have your backend URL:

1. Go to Netlify: https://app.netlify.com
2. Select your site: "zaminat-eco"
3. Go to: **Site settings** → **Environment variables**
4. Add or update:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com/api/v1` (replace with your actual URL)
5. Redeploy your site

## Quick Checklist

- [ ] Checked Railway for existing backend
- [ ] Checked Render for existing backend
- [ ] Checked Heroku for existing backend
- [ ] If no backend found, deployed to Railway/Render
- [ ] Got backend URL (format: `https://your-app.platform.com/api/v1`)
- [ ] Tested backend URL in browser
- [ ] Added `VITE_API_URL` to Netlify
- [ ] Redeployed Netlify site

## Common Backend URL Formats

- **Railway**: `https://your-app.up.railway.app/api/v1`
- **Render**: `https://your-app.onrender.com/api/v1`
- **Heroku**: `https://your-app.herokuapp.com/api/v1`
- **Custom Domain**: `https://api.zaminat.eco/api/v1`

## Need Help?

If you can't find your backend URL:
1. Check your email for deployment notifications from Railway/Render/Heroku
2. Check your GitHub repository for any deployment configuration files
3. If you haven't deployed yet, follow the Railway deployment steps above (it's free and takes ~10 minutes)

