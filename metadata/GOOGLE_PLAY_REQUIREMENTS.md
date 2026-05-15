# Screenshot & Asset Generation Guide

This guide describes how to generate and prepare assets for Google Play and App Store for Fennec Academy.

## Required Assets

### 1. App Icon (Google Play)
- **Size:** 512x512 pixels
- **Format:** PNG (32-bit with alpha)
- **Requirements:** Square. Google Play handles rounding and shadows.

### 2. Feature Graphic
- **Size:** 1024x500 pixels
- **Format:** PNG or JPEG
- **Usage:** Main marketing banner in the store listing.

### 3. Screenshots (Phone & Tablet)
- **Phone (6.5 inch):** 1242x2688 pixels (or 1125x2436)
- **Tablet (10 inch):** 2048x2732 pixels (or 1668x2388)
- **Tablet (7 inch):** 1200x1920 pixels

## Automation Script

To automate screenshots, you can use a Puppeteer-based script. 

### Prerequisites:
```bash
npm install puppeteer --save-dev
```

### `scripts/generate_screenshots_node.js`:
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DEVICES = [
  { name: 'iPhone_13_Pro_Max', width: 428, height: 926, deviceScaleFactor: 3 },
  { name: 'iPad_Pro_12_9', width: 1024, height: 1366, deviceScaleFactor: 2 },
  { name: 'Android_Phone', width: 360, height: 800, deviceScaleFactor: 3 }
];

const PAGES = ['/', '/perks', '/encounters', '/hacking', '/stats'];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Replace with your local dev URL or deployed URL
  const baseUrl = 'http://localhost:3000';

  if (!fs.existsSync('metadata/screenshots')) {
    fs.mkdirSync('metadata/screenshots', { recursive: true });
  }

  for (const device of DEVICES) {
    await page.setViewport({ 
      width: device.width, 
      height: device.height, 
      deviceScaleFactor: device.deviceScaleFactor 
    });

    for (const pagePath of PAGES) {
      console.log(`📸 Taking screenshot for ${device.name} on ${pagePath}...`);
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle2' });
      
      const fileName = `${device.name}_${pagePath.replace('/', '') || 'dashboard'}.png`;
      await page.screenshot({ path: path.join('metadata/screenshots', fileName) });
    }
  }

  await browser.close();
  console.log('✅ All screenshots generated in metadata/screenshots/');
})();
```

## Privacy Policy
Google Play requires a public Privacy Policy URL.
- Recommended path: `/privacy`
- You can host it in your `public/` folder as `privacy.html`.

## Submission Steps
1. Run `npm run build`.
2. Generate screenshots using the script above.
3. Upload assets to Google Play Console / App Store Connect.
4. Provide the Privacy Policy link.
