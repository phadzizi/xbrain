# xbrain

A cross-platform memory games app built with React, TypeScript, Ionic, and Capacitor. One codebase — web, Android, and iOS.

## Games

| Game                                                  | Memory Skill                 | Status     |
| ----------------------------------------------------- | ---------------------------- | ---------- |
| [Card Flip](ai/specs/01-card-flip.md)                 | Visual recall, concentration | 🔲 planned |
| [Simon Says](ai/specs/02-simon-says.md)               | Pattern & sequence memory    | 🔲 planned |
| [Number Sequence](ai/specs/03-number-sequence.md)     | Short-term numeric memory    | 🔲 planned |
| [Object Disappears](ai/specs/04-object-disappears.md) | Visual attention             | 🔲 planned |
| [Word Recall](ai/specs/05-word-recall.md)             | Verbal memory                | 🔲 planned |
| [Pattern Copy](ai/specs/06-pattern-copy.md)           | Visual pattern memory        | 🔲 planned |
| [Position Grid](ai/specs/07-position-grid.md)         | Spatial memory               | 🔲 planned |

## Stack

| Layer          | Choice                                               |
| -------------- | ---------------------------------------------------- |
| UI framework   | React 18 + TypeScript                                |
| Mobile wrapper | Capacitor 6                                          |
| Mobile UI      | Ionic React 8                                        |
| Build tool     | Vite 5                                               |
| State          | Zustand                                              |
| Animations     | Framer Motion                                        |
| Sound          | Howler.js                                            |
| Unit tests     | Vitest + React Testing Library                       |
| E2E tests      | Playwright                                           |
| Lint           | ESLint + `@typescript-eslint/no-explicit-any: error` |
| Format         | Prettier                                             |
| CI             | GitHub Actions                                       |

## Getting started

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run check        # format + lint + typecheck + test + build
npm run test:watch   # tests in watch mode during development
```

## Building for mobile

```bash
npm run build
npx cap sync

# Android (requires Android Studio)
npx cap open android

# iOS (requires Mac + Xcode)
npx cap open ios
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
