# Spline Background Gradient Setup

Use these gradient settings in your Spline scene to match the website's background:

## Gradient Configuration

**Gradient Type:** Linear Gradient (Diagonal - Bottom Right)

**Direction:** 135 degrees (to bottom right)

**Color Stops:**

1. **Start Color (Top Left):**
   - Hex: `#16a34a`
   - RGB: `22, 163, 74`
   - HSL: `142°, 76%, 36%`
   - Tailwind: `green-600`

2. **Middle Color (Center):**
   - Hex: `#2563eb`
   - RGB: `37, 99, 235`
   - HSL: `217°, 91%, 53%`
   - Tailwind: `blue-600`

3. **End Color (Bottom Right):**
   - Hex: `#15803d`
   - RGB: `21, 128, 61`
   - HSL: `142°, 72%, 29%`
   - Tailwind: `green-700`

## Spline Implementation Steps:

1. In Spline, select your scene or environment
2. Go to the Material/Background settings
3. Set the background type to "Gradient"
4. Configure the gradient:
   - **Angle:** 135° (or -45° depending on Spline's coordinate system)
   - **Color 1:** `#16a34a` (green-600) at position 0%
   - **Color 2:** `#2563eb` (blue-600) at position 50%
   - **Color 3:** `#15803d` (green-700) at position 100%

## Alternative: CSS Gradient String

If Spline supports CSS gradient strings, use:
```css
linear-gradient(135deg, #16a34a 0%, #2563eb 50%, #15803d 100%)
```

## Notes:

- The gradient goes from **top-left to bottom-right** (135 degrees)
- The middle color (blue) creates a nice transition between the two greens
- Make sure the robot's background is set to **transparent** so the gradient shows through
- The website's main background uses a light pattern, so the gradient will appear on top of it


