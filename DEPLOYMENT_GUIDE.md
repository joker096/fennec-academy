# Deployment and Store Assets Guide

This guide outlines the requirements and scripts for deploying the application and generating assets for Google Play and the App Store.

## 1. Store Requirements

### Google Play Store
- **App Icon:** 512x512 PNG (max 1MB).
- **Feature Graphic:** 1024x500 PNG.
- **Screenshots:**
  - Phone: At least 2, max 8. 1080x1920 or 1080x2400.
  - 7-inch tablet: At least 2. 1200x1920.
  - 10-inch tablet: At least 2. 1200x1920.

### Apple App Store
- **App Icon:** 1024x1024 PNG.
- **Screenshots:**
  - iPhone 6.7" (13 Pro Max): 1290x2796.
  - iPhone 6.5" (11 Pro Max): 1242x2688.
  - iPhone 5.5" (8 Plus): 1242x2208.
  - iPad Pro 12.9": 2048x2732.

---

## 2. Screenshot Generation Script

We recommend using **Playwright** to automate screenshot generation.

### Installation
```bash
npm install -D playwright
```

### Script (`scripts/generate-screenshots.js`)
```javascript
const { chromium } = require('playwright');
const path = require('path');

const SCREENS = [
  { name: 'dashboard', url: '/' },
  { name: 'flashcards', url: '/flashcards' },
  { name: 'perks', url: '/perks' },
  { name: 'quests', url: '/quests' }
];

const DEVICES = [
  { name: 'iPhone_13_Pro_Max', width: 428, height: 926, scale: 3 },
  { name: 'iPad_Pro_12_9', width: 1024, height: 1366, scale: 2 }
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Change to your local or deployed URL
  const baseUrl = 'http://localhost:3000';

  for (const device of DEVICES) {
    await page.setViewportSize({ width: device.width, height: device.height });
    
    for (const screen of SCREENS) {
      await page.goto(`${baseUrl}${screen.url}`);
      await page.waitForTimeout(2000); // Wait for animations
      
      const fileName = `${device.name}_${screen.name}.png`;
      const filePath = path.join(__dirname, '../assets/screenshots', fileName);
      
      await page.screenshot({ path: filePath });
      console.log(`Generated: ${fileName}`);
    }
  }

  await browser.close();
})();
```

---

## 3. Deployment Script

For deploying to Cloud Run (consistent with this environment):

### `scripts/deploy.sh`
```bash
#!/bin/bash

# Configuration
PROJECT_ID="your-project-id"
APP_NAME="fallout-language-learning"
REGION="us-central1"

# Build the app
npm run build

# Deploy to Google Cloud Run
gcloud run deploy $APP_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

## 5. Marketing Materials (Store Listing)

### English (EN)
- **Short Description (80 chars):** Survive the wasteland by learning languages. Next-gen RPG language trainer.
- **Long Description:** 
  Fennec Academy is not just a language app — it's a survival RPG. 
  Master a new language to unlock the terminal, craft gear, and influence the wasteland's factions.
  - **S.P.E.C.I.A.L. Progression:** Level up your attributes to gain unique bonuses.
  - **Perk Synergies:** Equip sets of perks to unlock hidden "Titan Grip" or "Nerd Rage!" powers.
  - **AI Guide:** Meet Fennec, your personal AI survival assistant who explains grammar and patterns.
  - **Hardcore Mode:** Manage Hunger, Thirst, and Health while you study.

### Russian (RU)
- **Краткое описание (80 симв.):** Выживите в пустошах, изучая языки. RPG-тренажер нового поколения.
- **Полное описание:**
  Fennec Academy — это не просто приложение для изучения языков, это выживание в мире постапокалипсиса.
  Изучайте слова, чтобы взламывать терминалы, создавать снаряжение и влиять на фракции.
  - **Система S.P.E.C.I.A.L.:** Развивайте атрибуты и получайте уникальные бонусы.
  - **Синергия Перков:** Собирайте наборы способностей, чтобы открыть «Хватку титана» или «Бешенство ботаника».
  - **ИИ-Наставник:** Познакомьтесь с Фенеком — вашим личным помощником, который объяснит любые правила.
  - **Режим выживания:** Следите за голодом, жаждой и здоровьем во время учебы.

---

## 6. Pro Tips for Store Submission

- **A/B Testing:**
  - **Variation A:** Clean UI screenshots.
  - **Variation B:** UI inside a "Pip-Boy" style frame. RPG players often prefer the immersive frame style, which can increase installs by 20-30%.
- **Privacy Policy:** Already generated at `/public/privacy.html`. Link it in the store console as `https://your-domain.com/privacy.html`.
- **Firebase:** If using the provided `deploy` script, ensure you have run `firebase init` and chosen your project.
