# Fix: Backend Deployed but Website Not Working

## Your Setup
- **Backend URL**: `https://zaminateco-master-production.up.railway.app`
- **Backend API URL**: `https://zaminateco-master-production.up.railway.app/api/v1`
- **Netlify Site**: `https://zaminat-eco.netlify.app`

## Step 1: Test Your Backend (Do This First!)

Open these URLs in your browser to check if backend is working:

### Test 1: Health Check
```
https://zaminateco-master-production.up.railway.app/api/v1/health
```
**What to expect**: Should show a JSON response or at least not a 404 error

### Test 2: API Documentation
```
https://zaminateco-master-production.up.railway.app/api/docs
```
**What to expect**: Should show Swagger API documentation page

### Test 3: Root
```
https://zaminateco-master-production.up.railway.app
```
**What to expect**: Should return something (even an error means server is running)

**If all tests fail**: Your backend isn't running. Check Railway logs.

## Step 2: Fix CORS in Railway (IMPORTANT!)

Your backend needs to allow requests from Netlify. 

1. **Go to Railway**: https://railway.app
2. **Click on your service**: "zaminateco-master"
3. **Go to "Variables" tab**
4. **Add this environment variable**:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://zaminat-eco.netlify.app,http://localhost:5173`
   - (This allows both Netlify and local development)

5. **Redeploy** your Railway service (Railway will auto-redeploy when you add variables)

## Step 3: Check Railway Environment Variables

Make sure these are set in Railway:

1. **Go to Railway** → Your service → **"Variables" tab**
2. **Check these variables exist**:

```
DATABASE_URL=<should be set automatically by Railway PostgreSQL>
JWT_SECRET=<any random string, e.g., "your-secret-key-12345">
JWT_REFRESH_SECRET=<different random string>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://zaminat-eco.netlify.app,http://localhost:5173
```

3. **If any are missing**, add them

## Step 4: Check Railway Logs

1. **Go to Railway** → Your service → **"Logs" tab**
2. **Look for**:
   - ✅ `🚀 Zaminat Backend API is running on: http://localhost:3000/api/v1`
   - ✅ `📚 API Documentation: http://localhost:3000/api/docs`
   - ❌ Any error messages

3. **If you see errors**, copy them and check what's wrong

## Step 5: Set Environment Variable in Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Select your site**: "zaminat-eco"
3. **Go to**: **Site settings** → **Environment variables**
4. **Add or update**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://zaminateco-master-production.up.railway.app/api/v1`
5. **Click "Save"**

## Step 6: Redeploy Netlify

1. **In Netlify**, go to **"Deploys"** tab
2. **Click**: **"Trigger deploy"** → **"Deploy site"**
3. **Wait 2-3 minutes** for deployment to complete

## Step 7: Verify It Works

### Test 1: Check Environment Variable
1. Open your Netlify site: https://zaminat-eco.netlify.app/
2. Press **F12** (open browser console)
3. Type:
```javascript
console.log(import.meta.env.VITE_API_URL)
```
4. **Should show**: `https://zaminateco-master-production.up.railway.app/api/v1`

### Test 2: Test API Call
In browser console:
```javascript
fetch('https://zaminateco-master-production.up.railway.app/api/v1/health')
  .then(r => r.json())
  .then(data => console.log('Backend is working!', data))
  .catch(err => console.error('Backend error:', err))
```

### Test 3: Check Network Tab
1. Open your Netlify site
2. Press **F12** → **Network** tab
3. Refresh the page
4. Look for requests to `zaminateco-master-production.up.railway.app`
5. Check if they're successful (green) or failed (red)

## Common Issues & Quick Fixes

### Issue 1: "Failed to fetch" or CORS Error
**Fix**: Add `CORS_ORIGIN` in Railway (Step 2 above)

### Issue 2: 404 Not Found
**Fix**: 
- Check if backend is running (Step 1)
- Verify the URL is correct: `/api/v1` at the end

### Issue 3: 502 Bad Gateway
**Fix**: 
- Backend is crashing
- Check Railway logs
- Verify `DATABASE_URL` is set correctly

### Issue 4: Environment Variable Not Working
**Fix**: 
- Make sure variable name is exactly `VITE_API_URL` (case-sensitive)
- Redeploy Netlify after adding variable

## Quick Checklist

- [ ] Backend URL works in browser (test Step 1)
- [ ] `CORS_ORIGIN` is set in Railway
- [ ] All environment variables are set in Railway
- [ ] Railway logs show backend is running
- [ ] `VITE_API_URL` is set in Netlify
- [ ] Netlify site is redeployed
- [ ] Browser console shows correct API URL

## Still Not Working?

1. **Share the error message** from browser console (F12)
2. **Check Railway logs** for any errors
3. **Test the backend URL directly** in browser
4. **Verify** all environment variables are set correctly

