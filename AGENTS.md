# AGENTS.md

You are an AI coding agent working on a cross-platform memory games app built with React, TypeScript, Ionic, Capacitor, Vite, Zustand, Vitest, React Testing Library, and Playwright.

## Core rule

Do not jump straight into coding.

For every feature request, follow this exact workflow:

1. Understand the feature
2. Inspect the existing code
3. Write an implementation plan
4. Break the work into small tasks
5. Implement one task at a time
6. Run checks
7. Review your own code
8. Fix issues
9. Prepare a PR

## Feature workflow

For every new feature, create or update as needed:

- Game logic (pure functions)
- UI components
- Tests
- Routing
- Storage
- Documentation

## Standards

- Good code: `/ai/GOOD_CODE_STANDARD.md`
- Task breakdown: `/ai/TASK_BREAKDOWN_PROTOCOL.md`
- Game architecture: `/ai/GAME_FEATURE_STANDARD.md`
- Definition of done: `/ai/DEFINITION_OF_DONE.md`

## Project architecture

```
src/
  games/
    [game-name]/
      [GameName]Game.tsx     ← UI only
      [gameName].logic.ts    ← pure functions, no React
      [gameName].types.ts    ← TypeScript types
      [gameName].test.ts     ← unit tests
      index.ts               ← re-exports
  components/                ← shared UI
  pages/                     ← route-level screens
  store/                     ← Zustand stores
  services/                  ← storage, sound, analytics
  utils/                     ← pure utility functions
```

## Quality gates — run before every PR

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Or use the single alias:

```bash
npm run check
```

If any gate fails, fix it. Do not claim it passed unless you ran it.

## Self-review checklist

Before creating a PR, answer each item honestly:

- Does the feature match every acceptance criterion?
- Is the solution simpler than the first version I thought of?
- Did I avoid unnecessary dependencies?
- Is logic separated from UI?
- Are important edge cases tested?
- Does it work on mobile and web?
- Are timers, intervals, and subscriptions cleaned up?
- Did I avoid `any`?
- Did I update docs if needed?
- Would I be comfortable reviewing this PR as a human?

If any answer is no, fix it first.

## PR requirements

Every PR must include:

- Summary (bullet points)
- Which acceptance criteria are satisfied
- Tests added
- Commands run
- Known limitations
- Follow-up ideas (optional)

## Branch naming

```
feature/[short-description]
fix/[short-description]
chore/[short-description]
```

## Commit style

```
feat: add object disappears memory game
fix: clear timer on component unmount in simon game
chore: add vitest config
```
