# Feature: Position Grid

## User story

As a player, I want to see emoji objects placed in a grid and then remember where each one was, so that I can train my spatial memory.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Position Grid from the home screen
2. Player sees a Start button and the current level
3. Player taps Start — countdown: "Ready... 3, 2, 1"
4. A grid appears with emoji objects placed in some cells; other cells are empty
5. After the preview duration, all cells go blank
6. Player is shown the same grid (all empty) and a sidebar of the objects they saw
7. Player drags (or taps) each object from the sidebar and taps the cell where they think it was
8. Player taps Submit when all objects are placed (or partially placed)
9. Result: correct placements highlighted green, wrong ones red, missed ones shown in their correct position in grey
10. Score = number of correctly placed objects; round survives only if all correct
11. Game over when player gets fewer than half correct
12. Game over screen: total score, best score, Replay button

## Acceptance criteria

- [ ] Grid displayed as a square grid; all cells empty during recall phase
- [ ] Emoji objects shown in the correct cells during preview
- [ ] Preview duration based on object count
- [ ] After preview, grid clears; object sidebar appears showing all objects that were placed
- [ ] Player places objects by: tap object in sidebar → tap cell in grid (two-tap interaction)
- [ ] Selected object is highlighted in the sidebar
- [ ] Tapping an already-placed cell with a new object replaces the existing placement
- [ ] Tapping a cell with the same object removes it
- [ ] Submit button evaluates placements — partial submission allowed
- [ ] Correct placements: green cell highlight
- [ ] Wrong placements: red cell, correct position shown in grey
- [ ] Round score = correctly placed objects out of total objects
- [ ] Game over when round score < 50% of total objects
- [ ] Total score accumulates rounds; best score stored locally
- [ ] Works on mobile (360px) and desktop

## Difficulty progression

| Level | Grid | Objects            | Preview time |
| ----- | ---- | ------------------ | ------------ |
| 1     | 3×3  | 3                  | 4s           |
| 2     | 3×3  | 4                  | 4s           |
| 3     | 3×3  | 5                  | 4s           |
| 4     | 4×4  | 5                  | 4s           |
| 5     | 4×4  | 7                  | 4s           |
| 6     | 4×4  | 9                  | 3.5s         |
| 7     | 5×5  | 10                 | 3.5s         |
| 8+    | 5×5  | min(3 + level, 14) | 3s           |

## Scoring

```
round score = correctly placed objects
total score += round score
game over when round score < ceil(total objects / 2)
best score = highest total score in a full game
```

## Object pool

Same pool as Object Disappears (30+ emoji). Objects in a round are drawn without repeats.

## UX notes

- Tap-to-place interaction (two steps: select from sidebar, tap cell)
  - First tap: highlights selected object in sidebar
  - Second tap: places it in the cell
  - Tapping sidebar again deselects
- Placed objects shown directly in the cell (large emoji)
- Sidebar: scrollable column of unplaced objects on the right
- On mobile: sidebar may be shown as a horizontal scroll row below the grid
- Preview phase: objects shown with a subtle pulsing glow to signal "memorize this"
- Reveal phase: smooth fade out of all objects

## Technical notes

- Logic in `positionGrid.logic.ts`: `generatePlacement`, `checkPlacements`, `getDifficulty`, `calculateScore`, `isGameOver`
- Types in `positionGrid.types.ts`: `GridCell`, `PlacedObject`, `GameStatus`, `PositionGridState`
- Grid stored as `cells: (ObjectItem | null)[]` — flat array, index = `row * cols + col`
- Unit tests: placement generation (no duplicate positions), placement checking (full match, partial, zero), game-over detection
- `generatePlacement` accepts injectable `rng` for deterministic tests

## Interaction note

Two-tap placement is simpler than drag-and-drop and works reliably on both mobile and desktop. Implement tap-to-place first. Add drag-and-drop only as a follow-up if the interaction feels clunky.

## Out of scope

- Drag-and-drop (implement tap-to-place first)
- Rotating or resizing objects
- Hint system
- Cloud leaderboard
