# Backend Troubleshooting Guide

## Your Backend URL
- **Railway URL**: `zaminateco-master-production.up.railway.app`
- **Backend API URL**: `https://zaminateco-master-production.up.railway.app/api/v1`

## Step 1: Test Your Backend

### Test 1: Health Check
Open in your browser:
```
https://zaminateco-master-production.up.railway.app/api/v1/health
```

**Expected**: Should return a JSON response like `{"status": "ok"}` or similar

**If you get an error**: The backend might not be running or configured correctly

### Test 2: API Documentation
Open in your browser:
```
https://zaminateco-master-production.up.railway.app/api/docs
```

**Expected**: Should show Swagger API documentation

**If you get 404**: The backend might not have the docs endpoint enabled

### Test 3: Root Endpoint
Open in your browser:
```
https://zaminateco-master-production.up.railway.app
```

**Expected**: Should return something (even if it's an error, it means the server is running)

## Step 2: Check Railway Deployment

1. **Go to Railway**: https://railway.app
2. **Click on your service**: "zaminateco-master"
3. **Check the "Deployments" tab**:
   - Is the latest deployment successful? (Green checkmark)
   - Are there any errors in the logs?

4. **Check the "Logs" tab**:
   - Look for error messages
   - Check if the server started successfully
   - Look for: "Server running on port 3000" or similar

## Step 3: Check Environment Variables in Railway

1. **Go to your service** → **"Variables" tab**
2. **Check if these are set**:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Random secret key
   - `JWT_REFRESH_SECRET` - Random refresh secret
   - `NODE_ENV` - Should be `production`
   - `PORT` - Should be `3000` (or Railway will auto-assign)

3. **If DATABASE_URL is missing**:
   - Go to Railway project
   - Add a PostgreSQL database
   - Railway will automatically create `DATABASE_URL`

## Step 4: Check Backend Configuration

### Check if Backend is Running
In Railway logs, you should see:
```
🚀 Zaminat Backend API is running on: http://localhost:3000/api/v1
```

### Check CORS Settings
Your backend needs to allow requests from Netlify. Check `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://zaminat-eco.netlify.app',
    'https://zaminateco-master.netlify.app',
    // Add your Netlify URL here
  ],
  credentials: true,
});
```

## Step 5: Update Netlify Environment Variable

1. **Go to Netlify**: https://app.netlify.com
2. **Select your site**: "zaminat-eco"
3. **Go to**: Site settings → Environment variables
4. **Add or update**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://zaminateco-master-production.up.railway.app/api/v1`
5. **Redeploy** your Netlify site

## Step 6: Common Issues & Fixes

### Issue 1: Backend Returns 404
**Cause**: Backend might not be running or wrong path
**Fix**: 
- Check Railway logs
- Verify the service is deployed
- Check if `/api/v1` path is correct

### Issue 2: CORS Error
**Error**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
**Fix**: 
- Update CORS settings in `backend/src/main.ts`
- Add your Netlify URL to allowed origins
- Redeploy backend

### Issue 3: Database Connection Error
**Error**: "Can't reach database server"
**Fix**:
- Check `DATABASE_URL` in Railway variables
- Make sure PostgreSQL service is running
- Verify database credentials

### Issue 4: Backend Not Starting
**Error**: Service keeps restarting
**Fix**:
- Check Railway logs for errors
- Verify all environment variables are set
- Check if `package.json` has correct start script
- Verify `DATABASE_URL` is correct

### Issue 5: 502 Bad Gateway
**Error**: "502 Bad Gateway" when accessing backend
**Fix**:
- Backend might be crashing
- Check Railway logs
- Verify environment variables
- Check if database is accessible

## Step 7: Verify Everything Works

### Test Backend Directly
```bash
# Test health endpoint
curl https://zaminateco-master-production.up.railway.app/api/v1/health

# Test API docs
curl https://zaminateco-master-production.up.railway.app/api/docs
```

### Test from Frontend
1. Open your Netlify site: https://zaminat-eco.netlify.app/
2. Open browser console (F12)
3. Type:
```javascript
console.log(import.meta.env.VITE_API_URL)
```
4. Should show: `https://zaminateco-master-production.up.railway.app/api/v1`

### Test API Call
In browser console:
```javascript
fetch('https://zaminateco-master-production.up.railway.app/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Quick Checklist

- [ ] Backend URL is accessible (test in browser)
- [ ] Railway deployment is successful (green checkmark)
- [ ] Environment variables are set in Railway
- [ ] Database is connected (check logs)
- [ ] CORS is configured for Netlify URL
- [ ] `VITE_API_URL` is set in Netlify
- [ ] Netlify site is redeployed
- [ ] Browser console shows correct API URL

## Still Not Working?

1. **Check Railway Logs**:
   - Go to Railway → Your service → Logs tab
   - Look for error messages
   - Copy any errors and check what they mean

2. **Check Browser Console**:
   - Open your Netlify site
   - Press F12 → Console tab
   - Look for error messages
   - Check Network tab for failed requests

3. **Verify Backend is Actually Running**:
   - Test the health endpoint directly
   - If it doesn't work, the backend isn't running correctly

