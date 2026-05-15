# Google Play Store Deployment Guide

To deploy **Fennec Academy** to Google Play, follow these steps:

## 1. Prerequisites
- **Google Play Console Account**: $25 one-time fee.
- **Capacitor Integration**: Since this is a React app, use [Capacitor](https://capacitorjs.com/) to wrap it for Android.
  ```bash
  npm install @capacitor/core @capacitor/cli @capacitor/android
  npx cap init
  npx cap add android
  ```

## 2. Prepare Assets
- **Large Icon**: 512x512 PNG, up to 1MB. Use the Fennec mascot.
- **Feature Graphic**: 1024x500 PNG. (The hero banner logic).
- **Screenshots**: At least 2 telephone screenshots (16:9 or 9:16). 
- **Privacy Policy**: Strictly required for Google Play. Host it on a static page.

## 3. Localization
The app is already localized in multiple languages (RU, EN, ES, etc.). 
In the Google Play Console under **Store Listing**, add these languages and copy the descriptions from `STORE_LISTING.md`.

## 4. Technical Requirements
- **Target SDK**: At least Level 34 (Android 14).
- **App Bundle**: Upload in `.aab` format instead of `.apk`.
- **Data Safety Section**: You must disclose that the app uses:
    - **Authentication**: Google Login (Firebase).
    - **Usage Info**: For progress tracking.

---

# Информация для Google Play (RU)

## Название
Fennec Academy: Изучение Языков

## Краткое описание
Осваивайте новые языки в интерактивной среде кампуса с ИИ-наставниками и игровым прогрессом.

## Полное описание
Добро пожаловать в **Fennec Academy** — инновационную платформу для изучения иностранных языков.

Наше приложение сочетает в себе проверенные методики интервального повторения (SRS) и увлекательный игровой процесс в стиле ретро-футуристического кампуса.

**Основные возможности:**
- **ИИ-Тьюторы**: Общайтесь с цифровыми деканами и профессорами для практики разговорной речи.
- **Интерактивные сценарии**: Принимайте участие в разветвленных диалогах, где ваш выбор влияет на исход.
- **Карты Навыков**: Улучшайте свои когнитивные способности, чтобы учиться быстрее и эффективнее.
- **Видеоуроки**: Смотрите отобранный образовательный контент прямо в приложении.
- **Полная персонализация**: Настройте своего студента, выбирайте аксессуары и развивайте атрибуты.

Начните свое лингвистическое путешествие сегодня и станьте лучшим студентом Fennec Academy!
