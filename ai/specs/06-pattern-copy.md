# Feature: Pattern Copy

## User story

As a player, I want to see a colored pattern briefly and then recreate it from memory, so that I can train my visual pattern memory.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Pattern Copy from the home screen
2. Player sees a Start button and the current level
3. Player taps Start — countdown: "Ready... 3, 2, 1"
4. A grid of colored cells appears for a preview duration
5. Grid turns blank (all cells grey/empty)
6. Player taps cells to recreate the pattern using a color palette
7. Player taps Submit when done
   - Correct → score increases, next round with more cells or colors
   - Wrong → correct pattern flashes briefly, then game over screen
8. Game over screen: score, best score, Replay button

## Acceptance criteria

- [ ] Grid displayed as a square grid of colored cells during preview
- [ ] Preview duration is 2 seconds at level 1
- [ ] After preview, all cells reset to empty/grey state
- [ ] A color palette is shown below the grid (same colors used in the pattern)
- [ ] Player selects a color from the palette, then taps a cell to paint it
- [ ] Currently selected color is visually highlighted in the palette
- [ ] Submit button compares player's grid against the original pattern
- [ ] Correct: flash green border on grid, brief delay, next round
- [ ] Wrong: show correct pattern overlaid briefly, then game over
- [ ] Score = rounds completed
- [ ] Best score stored locally
- [ ] Grid grows and more colors are added as level increases
- [ ] Works on mobile (360px) and desktop

## Difficulty progression

| Level | Grid size | Colored cells | Colors in palette | Preview time |
|---|---|---|---|---|
| 1 | 3×3 | 4 | 2 | 3s |
| 2 | 3×3 | 5 | 3 | 3s |
| 3 | 4×4 | 7 | 3 | 3s |
| 4 | 4×4 | 9 | 4 | 2.5s |
| 5 | 4×4 | 11 | 4 | 2s |
| 6 | 5×5 | 13 | 4 | 2s |
| 7+ | 5×5 | 15+ | 5 | 2s |

## Scoring

```
score = rounds completed
bonus = +3 per round after round 5
```

## Color palette

Use these 5 colors (named and clearly distinguishable):

- 🔴 Red `#EF4444`
- 🔵 Blue `#3B82F6`
- 🟢 Green `#22C55E`
- 🟡 Yellow `#EAB308`
- 🟣 Purple `#A855F7`

Level 1–2 use 2 colors. Level 3–5 use 3–4. Level 6+ uses all 5.

## UX notes

- Grid cells: square, minimum 56×56px on mobile
- Empty cell: light grey background with subtle border
- Colored cell: filled with the color, no border
- Selected palette color: ring/border highlight around swatch
- Tapping a colored cell with a different active color repaints it
- Tapping a colored cell with the same active color clears it (toggle)
- Wrong answer: correct pattern shown as a semi-transparent overlay for 1.5 seconds

## Technical notes

- Logic in `patternCopy.logic.ts`: `generatePattern`, `checkPattern`, `getDifficulty`, `calculateScore`
- Types in `patternCopy.types.ts`: `Cell`, `CellColor`, `GameStatus`, `PatternCopyState`
- Grid stored as a flat array: `cells: CellColor[]` where index = `row * cols + col`
- Unit tests: pattern generation (correct cell count, valid colors), pattern checking (exact match, partial match), difficulty calculation
- `generatePattern` accepts injectable `rng` for deterministic tests

## Out of scope

- Custom color themes
- Non-square grids (e.g. hexagonal)
- Time limit during the copy phase
- Cloud leaderboard
