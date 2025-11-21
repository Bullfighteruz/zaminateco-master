# Product Image Generator Script

## Overview

This script automatically scans all product folders in `public/images/` and generates the `src/lib/productImages.ts` file with all available images. This ensures that **ALL images** from each product folder are automatically included in the product detail pages.

## Usage

### Manual Run
```bash
npm run generate:images
```

or

```bash
node scripts/generate-product-images.js
```

### Automatic Run
The script runs automatically before each build:
```bash
npm run build
```

## How It Works

1. **Auto-Discovery**: The script automatically discovers all folders in `public/images/` that contain `-page` in their name (e.g., `EPDM-free-Tiles-page`, `eco-bench-page`)

2. **Image Scanning**: For each folder, it scans for all image files with extensions:
   - `.jpg`
   - `.jpeg`
   - `.png`
   - `.webp`
   - `.gif`

3. **File Generation**: Creates `src/lib/productImages.ts` with:
   - All images sorted alphabetically
   - Proper TypeScript types
   - Helper function `getProductImages(folderName)`

## Adding New Products

1. Create a new folder in `public/images/` with the pattern `{product-name}-page`
2. Add your product images to that folder
3. Run `npm run generate:images`
4. The new images will be automatically included!

## Example

If you have a folder structure like:
```
public/images/
  ├── EPDM-free-Tiles-page/
  │   ├── EPDM-free Tiles.jpg
  │   ├── sbr-tile-2.jpeg
  │   └── sbr-tile-collage.jpg
  └── eco-bench-page/
      ├── Eco Bench.jpg
      └── eco-bench-single.jpg
```

The script will generate:
```typescript
export const PRODUCT_IMAGES: Record<string, string[]> = {
  'EPDM-free-Tiles-page': [
    '/images/EPDM-free-Tiles-page/EPDM-free Tiles.jpg',
    '/images/EPDM-free-Tiles-page/sbr-tile-2.jpeg',
    '/images/EPDM-free-Tiles-page/sbr-tile-collage.jpg',
  ],
  'eco-bench-page': [
    '/images/eco-bench-page/Eco Bench.jpg',
    '/images/eco-bench-page/eco-bench-single.jpg',
  ],
};
```

## Notes

- **File names with spaces**: The script preserves actual filenames (including spaces). Modern browsers handle spaces in URLs automatically.
- **Auto-generated**: The `productImages.ts` file is auto-generated. Do not edit it manually - your changes will be overwritten.
- **Build integration**: The script runs automatically before builds to ensure images are always up-to-date.

