# Fennec Academy - Application Schema

## Project Structure

```
Fennec/
├── src/
│   ├── pages/                 # Main page components
│   │   ├── Lesson.tsx         # Lesson page (questions, quizzes)
│   │   ├── Flashcards.tsx     # Flashcard study page
│   │   ├── VocabularyBank.tsx # Vocabulary collection
│   │   ├── GrammarLab.tsx     # Grammar practice
│   │   ├── Conversation.tsx   # Conversation practice
│   │   ├── RepairTerminal.tsx # Terminal repair game
│   │   ├── AIChat.tsx         # AI assistant chat
│   │   ├── Library.tsx        # Content library
│   │   └── ...
│   │
│   ├── components/            # Reusable components
│   │   ├── VirtualKeyboard.tsx        # On-screen keyboard
│   │   ├── VirtualKeyboardWrapper.tsx # Wrapper (re-exports VirtualKeyboard)
│   │   ├── lesson/                     # Lesson-related components
│   │   │   ├── LessonHeader.tsx       # Header with exit button
│   │   │   ├── LessonFooter.tsx       # Footer with check button
│   │   │   ├── TypingInputField.tsx    # Input with virtual keyboard
│   │   │   ├── QuestionPrompt.tsx      # Question display
│   │   │   ├── OptionButtons.tsx       # MCQ options
│   │   │   └── ...
│   │   ├── dashboard/         # Dashboard components
│   │   ├── AdBanner.tsx       # Ad display
│   │   ├── PetDisplay.tsx     # Pet companion
│   │   ├── Tooltip.tsx        # Tooltip component
│   │   └── ...
│   │
│   ├── store/
│   │   └── useStore.ts        # Zustand state management
│   │
│   ├── data/
│   │   ├── gameData.ts        # Words, languages, courses
│   │   └── translations.ts    # UI translations (t)
│   │
│   ├── services/
│   │   ├── geminiService.ts   # AI features (hints, examples)
│   │   ├── audioService.ts    # Audio playback
│   │   └── srsService.ts     # Spaced repetition
│   │
│   ├── utils/
│   │   ├── audio.ts           # Audio utilities
│   │   └── speech.ts          # Speech recognition
│   │
│   └── lib/
│       ├── errors.ts          # Error handling
│       └── i18n.ts            # Internationalization
│
├── android/                   # Android native project
│   └── app/build/outputs/     # APK/AAB outputs
│
└── package.json              # Dependencies
```

## Key Files & Patterns

### VirtualKeyboard Imports
**Correct pattern:**
```tsx
import { VirtualKeyboard } from '../components/VirtualKeyboard';
```
- NOT: `import VirtualKeyboardWrapper from '../components/VirtualKeyboardWrapper'`
- NOT: `import { VR } from '../components/VirtualKeyboardWrapper'`

### Lesson Page Exit Button
- Location: `src/components/lesson/LessonHeader.tsx`
- Added button with `LogOut` icon from lucide-react
- Navigates to `/` on click

### State Management
- Zustand store in `src/store/useStore.ts`
- Hook: `useStore(state => state.selector)`

### Translations
- Access via `UI_TRANSLATIONS[uiLang]`
- Use `t.key` for translated strings

## Build Commands

```bash
npm run dev           # Development server (port 3000)
npm run build        # Production build
cd android; .\gradlew assembleRelease  # Build AAB/APK
```

## Common Issues & Fixes

1. **Illegal constructor** - Wrong import path for VirtualKeyboard
2. **Module not found** - Check case-sensitive paths
3. **Type errors** - Run `npm run lint`

## Build Outputs

```bash
# Build AAB (for Google Play)
cd android; .\gradlew assembleRelease
```

**Output files:**
- **AAB (Google Play):** `android/app/build/outputs/bundle/release/app-release.aab` (~20MB)
- **APK (Direct install):** `android/app/build/outputs/apk/release/app-release.apk` (~24MB)

## Dependencies (Key)
- React 19, Vite 6, Tailwind 4
- Capacitor 8 (mobile)
- Firebase, Zustand, Motion