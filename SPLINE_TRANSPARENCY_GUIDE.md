# How to Make Spline Background Transparent

The white background you're seeing is coming from your Spline scene settings, not from the website code. Here's how to fix it:

## Steps to Enable Transparency in Spline:

### 1. Open Your Spline Scene
- Open your Spline project: `r4xbot-2nktQYWyjsecuJLGCyScQOuM`

### 2. Set Scene Background to Transparent
- Click on the **Scene** in the hierarchy (or press `Cmd/Ctrl + A` to select all, then deselect)
- In the **Properties Panel** on the right, look for **Background** settings
- Set the background color to **transparent** or remove it entirely
- Make sure there's no solid color background selected

### 3. Check Environment Settings
- Look for **Environment** settings in the scene properties
- If there's an environment, either:
  - Set it to transparent/disabled, OR
  - Remove the environment entirely

### 4. Check for Background Objects
- Make sure there are no background planes or objects in your scene
- Check the hierarchy for any objects that might be creating a white background

### 5. Export/Publish Settings
- When publishing or exporting, make sure transparency is enabled
- Some export formats might not support transparency - make sure you're using the web embed format

### 6. Test the Changes
- After making changes, republish your scene in Spline
- The iframe should now show your website's background through the transparent areas

## Alternative: Use Spline Viewer Component

If the iframe approach doesn't work, you can use Spline's viewer component (already added to your HTML):

1. Get your scene's `.splinecode` URL from Spline's publish/export settings
2. The component is already set up in the code - just update the URL if needed

## Current Code Status

✅ CSS transparency is properly configured
✅ Container has transparent background
✅ Iframe has transparent background styles
✅ All necessary CSS rules are in place

**The only thing left is to set the background to transparent in your Spline scene settings!**


