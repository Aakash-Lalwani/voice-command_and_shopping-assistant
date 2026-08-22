# VoiceCart - Voice Command Shopping Assistant

A hands-free shopping list app that understands natural speech. Speak to add, remove, check off, update, and search for items — with smart suggestions powered by Gemini AI.

## Overview

VoiceCart turns your voice into a shopping list. Tap the microphone and speak naturally — the app parses your intent, categorizes items automatically, and syncs everything to the cloud via Firebase. Get smart suggestions based on your shopping history, seasonal produce, and AI-powered substitutes for any item. Search a 50-product catalog by voice with filters like "under 5 dollars" or brand names.

## Architecture

```
src/
├── components/          # UI components
│   ├── Header.tsx        # Top bar: dark mode, language, clear
│   ├── VoiceButton.tsx   # Pulsing mic button + live transcript
│   ├── ShoppingList.tsx  # Grouped, animated list with check/remove/qty
│   ├── SmartSuggestions.tsx  # 3-tab panel: For You / In Season / Substitutes
│   ├── SearchResults.tsx # Catalog search results with add-to-list
│   ├── Onboarding.tsx    # One-time intro overlay
│   ├── SetupScreen.tsx   # Missing env var screen
│   └── Toast.tsx         # Toast notification system
├── services/             # External integrations
│   ├── firebase.ts       # Auth + Firestore CRUD + realtime subscriptions
│   ├── voice.ts          # Web Speech API wrapper + speech synthesis
│   └── gemini.ts         # Gemini AI for substitute suggestions
├── utils/                # Pure logic
│   ├── nlp.ts            # Intent parser (add/remove/update/check/clear/search)
│   ├── categorize.ts     # Keyword-based auto-categorization
│   ├── numberWords.ts    # Word-to-number + unit extraction
│   ├── catalog.ts        # 50-product static catalog
│   └── seasonal.ts       # Month-based seasonal produce map
├── types/                # TypeScript type definitions
│   └── index.ts
└── App.tsx               # Main app: state, command dispatch, layout
```

**Tech stack:** React + Vite + TypeScript + Tailwind CSS, Firebase (Anonymous Auth + Cloud Firestore), Web Speech API, Google Gemini AI.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable **Authentication** → Sign-in method → **Anonymous**
   - Enable **Cloud Firestore** (start in test mode, then secure with rules)
   - Copy your web app config from Project Settings

3. **Get a Gemini API key:**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Create an API key

4. **Create a `.env` file** in the project root:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc123
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

5. **Run the dev server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for substitute suggestions |

## 10 Sample Voice Commands

1. "Add milk"
2. "I need 5 oranges"
3. "Buy two kg of rice"
4. "Remove eggs from my list"
5. "Mark milk as done"
6. "Update bananas to 6"
7. "Clear my list"
8. "Find me organic apples"
9. "Find toothpaste under 5 dollars"
10. "I want to buy 3 bottles of olive oil"

## Approach

VoiceCart is built around a voice-first interaction model where the microphone is the primary input. The architecture separates concerns into three layers: UI components in `/components`, external service integrations in `/services`, and pure logic in `/utils`. The NLP parser uses pattern matching to identify intents (add, remove, update, check, clear, search) and extracts item names, quantities (both digits and word-form numbers), and units from natural phrases. Items are auto-categorized via a keyword dictionary into nine categories and grouped visually. Firebase Anonymous Auth provides a seamless, passwordless identity, while Firestore stores lists under `users/{uid}/lists/default/items` with realtime `onSnapshot` subscriptions so changes sync instantly. Shopping history is tracked under `users/{uid}/history` to power the "For You" suggestions. The Gemini AI integration fetches three substitute suggestions as a JSON array whenever an item is added, displayed as tappable chips. The UI is mobile-first with a large pulsing microphone button, live transcript display, spoken confirmations via the Web Speech Synthesis API, toast notifications, smooth add/remove animations, dark mode, and a one-time onboarding overlay. A language selector switches between English and Hindi, changing the SpeechRecognition language. Error handling is comprehensive — missing env vars show a setup screen, Firestore errors surface as toasts, and voice errors are caught and displayed. The codebase uses TypeScript throughout with strict typing, no console.log statements, and clean component separation following the single responsibility principle.
