# xbrain

A cross-platform memory games app built with React, TypeScript, Ionic, and Capacitor. One codebase — web, Android, and iOS.

## Games

| Game                                                  | Memory Skill                 |
| ----------------------------------------------------- | ---------------------------- |
| [Card Flip](ai/specs/01-card-flip.md)                 | Visual recall, concentration |
| [Simon Says](ai/specs/02-simon-says.md)               | Pattern & sequence memory    |
| [Number Sequence](ai/specs/03-number-sequence.md)     | Short-term numeric memory    |
| [Object Disappears](ai/specs/04-object-disappears.md) | Visual attention             |
| [Word Recall](ai/specs/05-word-recall.md)             | Verbal memory                |
| [Pattern Copy](ai/specs/06-pattern-copy.md)           | Visual pattern memory        |
| [Position Grid](ai/specs/07-position-grid.md)         | Spatial memory               |

## Stack

| Layer          | Choice                                               |
| -------------- | ---------------------------------------------------- |
| UI framework   | React 18 + TypeScript                                |
| Mobile wrapper | Capacitor 6                                          |
| Mobile UI      | Ionic React 8                                        |
| Build tool     | Vite 5                                               |
| State          | Zustand                                              |
| Animations     | Framer Motion                                        |
| Sound          | Web Audio API                                        |
| Unit tests     | Vitest + React Testing Library                       |
| E2E tests      | Playwright                                           |
| Lint           | ESLint + `@typescript-eslint/no-explicit-any: error` |
| Format         | Prettier                                             |

## Running the app

### Web

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Android

**Prerequisites:** Android Studio installed, physical device or emulator with USB debugging enabled.

```bash
# Install dependencies
npm install

# Build web app and sync to Android
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio: wait for Gradle sync, select your device from the toolbar, click **Run** (▶).

**First time only — generate app icons and splash:**
```bash
npm run cap:assets
npx cap sync android
```

**Troubleshooting:**
- Device not detected → enable USB debugging: Settings → Developer options → USB debugging
- Samsung devices → Settings → Security and privacy → Auto Blocker → Off
- Verify detection: run `adb devices` in a terminal — should show your device as `device` (not `unauthorized`)

### iOS

**Prerequisites:** Mac with Xcode 15+, Apple Developer account (free or paid).

```bash
# Install dependencies
npm install

# Build web app and sync to iOS
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode: select your target device or simulator from the scheme toolbar, click **Run** (▶).

On a physical device for the first time: go to **Settings → General → VPN & Device Management** on the device and trust your developer certificate.

**First time only — generate app icons and splash:**
```bash
npm run cap:assets
npx cap sync ios
```

## Quality gates

```bash
npm run check        # format + lint + typecheck + test + build
npm run test:watch   # tests in watch mode during development
npm run test:e2e     # Playwright end-to-end tests
```

## AI delivery framework

This project uses an AI feature delivery framework. Every feature is built by an agent following strict standards.

| File                                                             | Purpose                               |
| ---------------------------------------------------------------- | ------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                                         | Agent workflow and rules              |
| [`ai/GOOD_CODE_STANDARD.md`](ai/GOOD_CODE_STANDARD.md)           | What "good code" means here           |
| [`ai/TASK_BREAKDOWN_PROTOCOL.md`](ai/TASK_BREAKDOWN_PROTOCOL.md) | How to break features into tasks      |
| [`ai/GAME_FEATURE_STANDARD.md`](ai/GAME_FEATURE_STANDARD.md)     | Architecture rules for every game     |
| [`ai/DEFINITION_OF_DONE.md`](ai/DEFINITION_OF_DONE.md)           | Checklist before any PR               |
| [`ai/SELF_REVIEW_PROMPT.md`](ai/SELF_REVIEW_PROMPT.md)           | Agent self-review protocol            |
| [`ai/AGENT_EXECUTION_PROMPT.md`](ai/AGENT_EXECUTION_PROMPT.md)   | Prompt template to kick off a feature |
| [`ai/specs/`](ai/specs/)                                         | Per-game feature specifications       |

### Requesting a feature

1. Pick a spec from `ai/specs/` or copy `ai/FEATURE_PROMPT_TEMPLATE.md`
2. Paste `ai/AGENT_EXECUTION_PROMPT.md` + the spec into the agent
3. Agent plans → implements → tests → self-reviews → opens PR
4. You review and merge

## Contact

info@xquiz.co.za
