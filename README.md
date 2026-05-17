# Fennec Academy — Language Survival Game

An immersive language learning web application set in a post-apocalyptic wasteland, built with React, TypeScript, Vite, and Capacitor for mobile deployment.

## Features

- **Gamified Language Learning** — Master vocabulary through interactive lessons with spaced repetition (SRS)
- **AI-Powered Mentors** — GPT-based grammar analysis, pronunciation feedback, contextual examples, and deep dives
- **Knowledge Graph** — Visualize your language mastery with an interactive D3.js force-directed graph
- **Virtual Keyboard** — Multilingual input support with 10+ keyboard layouts
- **Perk System** — Equip up to 3 perks per lesson from 20+ available
- **Daily Quests & Achievements** — Stay motivated with daily challenges and 20+ achievements
- **PWA Support** — Installable on mobile and desktop with offline capability
- **Multi-language UI** — Interface available in 9 languages
- **Character Customization** — Build your wasteland survivor avatar

## Tech Stack

- **React 19** + TypeScript
- **Vite 6** (build tool)
- **Tailwind CSS 4** + custom design tokens
- **Zustand** (state management)
- **Firebase** (authentication + Firestore + Storage)
- **Google GenAI** (Gemini for AI features)
- **D3.js** (knowledge graph visualization)
- **Framer Motion** (animations)
- **Vitest** (testing)
- **Capacitor 8** (native mobile deployment)

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore enabled
- Google GenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/joker096/fennec-academy.git
cd fennec-academy

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase and Gemini API keys

# Run development server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start dev server on :3000
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run test       # Run unit tests (Vitest)
npm run test:watch # Run tests in watch mode
npm run lint       # TypeScript type check
npm generate-icons # Generate PWA icons from SVG logo
```

## Project Structure

```
src/
├── App.tsx                    # Main application with routing
├── components/                
│   ├── dashboard/             # Dashboard page components
│   ├── lesson/                # Lesson page components
│   ├── KnowledgeGraphWrapper.tsx  # Lazy-loaded Knowledge Graph
│   ├── VirtualKeyboardWrapper.tsx  # Lazy-loaded Virtual Keyboard
│   ├── NavLink.tsx            # Reusable navigation link
│   └── ... (50+ components)
├── data/                      # Static data (words, courses, translations)
├── firebase.ts                # Firebase configuration
├── lib/                       # Utilities (i18n, errors)
├── services/                  # API services (Gemini, audio, SRS)
├── store/                     # Zustand global store
└── utils/                     # Pure utilities
    └── __tests__/            # Unit tests
```

## PWA Icons

The project includes auto-generated PWA icons in `/public/`:
- `pwa-192x192.png` — Standard icon
- `pwa-512x512.png` — Large icon
- `maskable-icon-512x512.png` — Android maskable icon

Regenerate with: `npm run generate-icons`

## License

This is a personal/educational project inspired by the Fallout universe. Not affiliated with Bethesda.