# 🚀 Google Play & App Store Release Checklist

Your app is localized in 15+ languages and configured for offline PWA mode. Follow these steps to complete the publishing process.

## 1. Graphic Assets Requirements
You must prepare the following assets. Use the prompts below or wait for the AI generation to reset.

### 🎨 Required Graphics
- **App Icon**: 512x512 pixels, PNG (transparent), less than 1MB.
- **Feature Graphic**: 1024x500 pixels, PNG or JPEG.
- **Phone Screenshots**: At least 4 screenshots. Suggested views:
  1. **Dashboard**: "Monitor your vitals and progress."
  2. **Conversations**: "Interface with the AI Elder."
  3. **Flashcards**: "Reinforce your linguistic sub-routines."
  4. **Vault View**: "Expand your learning facility."

## 2. Store Listing Info (EN/RU)
*Already prepared in `STORE_LISTING.md`.* 
- **App Name**: Vault-Tec Language Survival (28 chars)
- **Short Description**: Master languages in the wasteland with AI mentors and survival mechanics. (80 chars)

## 3. Technical Requirements (Google Play)
1. **Privacy Policy**: You must host a privacy policy URL. You can use a simple GitHub Gist if needed.
2. **Data Safety**:
   - **Data Collection**: Microphone (for Voice Practice), Device ID (for Firebase Auth/Analytics).
   - **Data Usage**: App functionality, personalization.
   - **Security**: Data is encrypted in transit.
3. **App Content**: Ensure you mark the app as "Education" and target appropriate age groups (12+ recommended due to wasteland theme).

## 4. Deployment Steps
1. **Build the App**: Run `npm run build` to generate the `/dist` folder.
2. **Host the Build**: Upload the `/dist` folder to your production hosting (Vercel, Netlify, or Firebase Hosting).
3. **PWA to APK**: Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) or [PWA2APK](https://www.pwabuilder.com/) to convert your URL into an Android App Bundle (.aab).
4. **Console Upload**: Upload the .aab to the Google Play Console for review.

## 5. Localization Audit
- ✅ **UI Elements**: Fully translated in 15 languages.
- ✅ **AI Responses**: Gemini automatically handles the target language selected by the user.
- ✅ **Dynamic Content**: Course names and tips are fully localized.

## 6. Known Deployment Errors to Avoid
- **Mixed Content**: Ensure all links use `https`. (Checked: All external resources use https).
- **Service Worker Scope**: Ensure `sw.ts` is served from the root. (Checked: Vite setup handles this correctly).
- **Touch Targets**: Ensure buttons are at least 44x44px. (Checked: Using Tailwind `p-4` and `h-12` patterns).
