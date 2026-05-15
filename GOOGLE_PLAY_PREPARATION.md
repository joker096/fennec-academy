# Google Play Store Preparation Guide

Ваше приложение использует проект My First Project со следующими параметрами:
Project ID: automatic-bond-435807-k8
Database ID: ai-studio-41f83a98-db85-470a-a35a-75bdfb22e7b9
Вы можете управлять данными в консоли Firebase по этой ссылке:


Следующий шаг:
1. Идите в Google Play Console (https://play.google.com/console)
2. Создайте приложение "Fennec"
3. Загрузите app-release.aab
4. Заполните Store Listing (тексты в STORE_LISTING.md)
5. Добавьте скриншоты из screenshots/
6. Загрузите иконку и баннер из assets/
7. Privacy Policy URL: https://gist.githubusercontent.com/joker096/ced5a26a777bbbdf1f8bfdf70751b3f0/raw/privacy.html
8. Data Safety → RECORD_AUDIO


❌ Вам нужно создать вручную:
1. App Icon (512x512 PNG) - можно использовать /public/logo.svg как базу
2. Feature Graphic (1024x500 PNG) - баннер для Play Store
📋 Следующий шаг в Google Play Console:
1. Создайте приложение → выберите "Fennec"
2. Загрузите AAB: google-play\app-release.aab
3. Заполните Store Listing: тексты готовы в STORE_LISTING.md
4. Добавьте скриншоты: папка screenshots → Android-Phone (5 шт), Tablet (2 шт)
5. App Icon + Feature Graphic: загрузите созданные PNG
6. Privacy Policy: захостите privacy.html (GitHub Pages/Netlify) и укажите URL
7. Data Safety: укажите RECORD_AUDIO для голосовой практики
Keystore для подписи сохранён: android\fennec-release-key.jks
(пароль: fennec123)

This document outlines the required assets and information for deploying **Vault-Tec Language Survival** to the Google Play Store.

## 1. Store Listing Information

*   **App Name**: Vault-Tec Language Survival (Max 50 characters)
*   **Short Description**: Master languages in the post-apocalyptic wasteland with AI mentors and survival stats. (Max 80 characters)
*   **Full Description**: 
    Master languages in the wasteland! Vault-Tec Language Survival combines gamified language learning with a high-stakes survival simulation.
    
    Features:
    - **AI-Powered Guidance**: The Overseer provides personalized feedback and analyzes your progress.
    - **Interactive Narratives**: Engage in branching stories where your language choices impact the outcome.
    - **S.P.E.C.I.A.L. Attributes**: Your stats influence your learning speed, luck, and communication skills.
    - **Video Lessons**: Curated YouTube integration for immersive learning by topic and difficulty.
    - **SRS Algorithms**: Refined Spaced Repetition for long-term retention.
    - **Vault Building**: Unlock and upgrade facilities to aid your studies.
    
    Survive the apocalypse by mastering new tongues. Start your training today!

## 2. Graphic Assets

You will need to provide these files in the Google Play Console:

| Asset | Requirements | Recommendations |
| :--- | :--- | :--- |
| **App Icon** | 512 x 512, 32-bit PNG, Max 1024 KB | Use a clear Vault-Boy inspired or Cog-shield icon. |
| **Feature Graphic** | 1024 x 500, JPEG or 24-bit PNG | Showcase the wasteland setting with a prominent app title. |
| **Phone Screenshots** | At least 4 (Max 8), Min 320px | 1. Dashboard showing stats; 2. Lesson interface; 3. Character customization; 4. Video Lessons grid. |
| **Tablet Screenshots** | 7" and 10" (at least 1 each) | Show the expanded layout on larger screens. |

## 3. Localization Strategy

The app currently supports:
- **English (en)**
- **Russian (ru)**
- **Spanish (es)**
- **French (fr)**
- **German (de)**
- **Italian (it)**
- **Japanese (ja)**
- **Portuguese (pt)**
- **Korean (ko)**

**Note**: Ensure that the Store Listing (Name/Description) is also translated in the Play Console for each of these languages to maximize reach.

## 4. Privacy Policy

Google Play requires a public link to a privacy policy. You should host a basic privacy policy that states:
- No data is shared with third parties (except Firebase for core functionality).
- Data collected: email (for auth), progress (for game).
- You can use a service like Iubenda or a simple static GitHub Page.

## 5. Technical Readiness

- **Target API Level**: Ensure the build targets Android 14 (API level 34) or higher.
- **Microphone Permission**: The app uses the microphone for speech recognition. Ensure the "Data Safety" section in Play Console explains how this is used (local processing/AI analysis).
- **Offline Support**: The app includes a "Download Data" feature for offline study, which is a big plus for store rankings.
