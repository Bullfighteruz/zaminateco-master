# 🎬 Video Optimization - Manual Installation Guide

## ⚠️ Automatic Installation Failed

The automatic ffmpeg installation failed due to permission issues. Here are alternative solutions:

---

## ✅ **Solution 1: Manual ffmpeg Installation (Recommended)**

### **Windows - Download Directly:**

1. **Download ffmpeg:**
   - Visit: https://www.gyan.dev/ffmpeg/builds/
   - Download: `ffmpeg-release-essentials.zip`
   - Extract to: `C:\ffmpeg`

2. **Add to PATH:**
   - Open "Environment Variables" (search in Windows)
   - Edit "Path" variable
   - Add: `C:\ffmpeg\bin`
   - Click OK

3. **Verify:**
   ```powershell
   ffmpeg -version
   ```

4. **Run optimization:**
   ```bash
   node scripts/optimize-video.js
   ```

---

## ✅ **Solution 2: Use Online Video Optimizer**

If you can't install ffmpeg, use an online service:

1. **Visit:** https://www.freeconvert.com/video-compressor
2. **Upload:** `public/images/intro.mp4`
3. **Settings:**
   - Quality: Medium
   - Resolution: 1920x1080 (desktop) or 1280x720 (mobile)
4. **Download optimized file**
5. **Rename and place:**
   - Desktop: `public/videos/intro-optimized.mp4`
   - Mobile: `public/videos/intro-mobile.mp4`

---

## ✅ **Solution 3: Use Cloudflare Stream (Advanced)**

For automatic optimization and CDN:

1. Sign up at: https://www.cloudflare.com/products/cloudflare-stream/
2. Upload video
3. Get embed code
4. Replace video component

**Cost:** $1 per 1,000 views

---

## 📋 **Quick Manual Optimization Steps**

If you have ffmpeg installed manually:

```bash
# 1. Create videos directory
mkdir public\videos

# 2. Optimize for desktop (WebM - best compression)
ffmpeg -i public\images\intro.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 64k -movflags +faststart public\videos\intro.webm

# 3. Optimize for desktop (MP4 fallback)
ffmpeg -i public\images\intro.mp4 -c:v libx264 -preset slow -crf 28 -vf "scale=1920:1080" -movflags +faststart -c:a aac -b:a 64k public\videos\intro-optimized.mp4

# 4. Optimize for mobile (smaller file)
ffmpeg -i public\images\intro.mp4 -c:v libx264 -preset slow -crf 32 -vf "scale=1280:720" -movflags +faststart -c:a aac -b:a 48k public\videos\intro-mobile.mp4

# 5. Extract poster frame
ffmpeg -i public\images\intro.mp4 -ss 00:00:01 -vframes 1 -q:v 2 public\videos\intro-poster.jpg
```

---

## 🎯 **Expected Results**

After optimization:
- `intro.webm`: ~1.5 MB (from 32 MB) ✅
- `intro-optimized.mp4`: ~2.5 MB (from 32 MB) ✅
- `intro-mobile.mp4`: ~800 KB (from 32 MB) ✅
- `intro-poster.jpg`: ~100 KB ✅

**Total reduction: 90%+ smaller files!**

---

## ✅ **After Optimization**

Your component already uses these paths! Just:
1. Deploy optimized files
2. Netlify/Vercel CDN will serve them
3. Video loads in 1-2 seconds instead of 30-60 seconds!

---

**Need help?** Let me know which solution you prefer!

