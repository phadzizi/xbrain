# Game Feature Standard

Every memory game must follow this structure without exception.

---

## Directory layout

```
src/games/[game-name]/
  [gameName].types.ts    ← types only, no logic
  [gameName].logic.ts    ← pure functions only, no React
  [gameName].test.ts     ← unit tests for logic
  [GameName]Game.tsx     ← React UI component
  index.ts               ← re-exports for clean imports
```

---

## Types file

Define all shapes used by the game. Minimum required:

```ts
// Status covers every possible game phase
export type GameStatus = 'idle' | 'preview' | 'guessing' | 'correct' | 'wrong' | 'complete';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ScoreResult = {
  points: number;
  combo: number;
  total: number;
};

// GameState is the single source of truth passed to the UI
export type GameState = {
  status: GameStatus;
  level: number;
  score: number;
  round: Round;        // replace Round with the game-specific round type
};
```

---

## Logic file

Contains only pure functions. Rules:

- No React imports
- No browser APIs (`document`, `window`, `localStorage`)
- No random behavior without injectable seed or factory (makes testing deterministic)
- Every function takes data in, returns data out — no side effects

Required functions for every game:

```ts
createInitialState(): GameState
generateRound(level: number, rng?: () => number): Round
checkAnswer(round: Round, answer: PlayerAnswer): boolean
calculateScore(level: number, isCorrect: boolean, combo: number): ScoreResult
getNextDifficulty(level: number): Difficulty
isGameOver(state: GameState): boolean
```

Example for Object Disappears:

```ts
import type { ObjectItem, ObjectDisappearsRound, ObjectDisappearsState } from './objectDisappears.types';

const ITEMS: ObjectItem[] = [
  { id: 'apple', label: '🍎' },
  { id: 'ball', label: '⚽' },
  // ...
];

export function createInitialState(): ObjectDisappearsState {
  return {
    status: 'idle',
    level: 1,
    score: 0,
    round: generateRound(1),
  };
}

export function generateRound(level: number, rng = Math.random): ObjectDisappearsRound {
  const count = Math.min(3 + level, 8);
  const shuffled = [...ITEMS].sort(() => rng() - 0.5).slice(0, count);
  const missingIndex = Math.floor(rng() * shuffled.length);
  const missingItem = shuffled[missingIndex];
  const visibleItems = shuffled.filter((_, i) => i !== missingIndex);
  const options = [...shuffled].sort(() => rng() - 0.5);
  return { visibleItems, missingItem, options };
}

export function checkAnswer(round: ObjectDisappearsRound, answerId: string): boolean {
  return round.missingItem.id === answerId;
}
```

---

## UI component

Responsibilities:

- Render game state as UI
- Call logic functions to derive next state
- Handle user events
- Show score, level, feedback
- Manage timers (and clean them up)
- Work on mobile and desktop

Must NOT contain:

- Scoring formulas
- Sequence generation algorithms
- Answer validation logic
- Difficulty calculations

These belong in the logic file.

---

## Tests file

Test the logic file, not the UI (unit tests). Minimum coverage:

```ts
describe('generateRound', () => {
  it('returns the correct number of items for the level', ...);
  it('missing item is not in visible items', ...);
  it('options include the missing item', ...);
});

describe('checkAnswer', () => {
  it('returns true for correct answer', ...);
  it('returns false for wrong answer', ...);
});

describe('calculateScore', () => {
  it('awards more points at higher levels', ...);
  it('awards bonus for combo', ...);
});
```

For deterministic tests, inject a fixed `rng`:

```ts
const fixedRng = () => 0.1; // always returns 0.1
const round = generateRound(1, fixedRng);
```

---

## Index file

```ts
export { default } from './[GameName]Game';
export * from './[gameName].types';
export * from './[gameName].logic';
```

---

## Storage

Use the shared storage service at `src/services/storage.ts`. Never call `localStorage` directly from a component or logic file.

Best score shape:

```ts
export type BestScore = {
  gameId: string;
  score: number;
  achievedAt: string; // ISO date string
};
```
