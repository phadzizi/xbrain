# Feature: Card Flip Memory

## User story

As a player, I want to flip cards and find matching pairs, so that I can train my visual memory and concentration.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Card Flip game from the home screen
2. Player sees a grid of face-down cards
3. Player taps a card — it flips face-up showing its emoji
4. Player taps a second card
   - If they match → both cards stay face-up (matched state)
   - If they don't match → both cards flip back face-down after a short delay
5. Player continues until all pairs are matched
6. Game over screen shows: time taken, number of moves, score, best score
7. Player can tap Replay to restart at the same level or advance to the next

## Acceptance criteria

- [ ] Cards are displayed in a grid (3×2 for level 1)
- [ ] Each card has a hidden face showing an emoji when flipped
- [ ] Player can only flip two cards at a time (input locked while two are face-up)
- [ ] Matched pairs stay face-up and are visually distinct (e.g. dimmed/highlighted)
- [ ] Non-matching pairs flip back after 1 second
- [ ] Flip animation plays when a card turns over
- [ ] Move counter increments each time the player flips a pair
- [ ] Timer counts up from 0:00
- [ ] All pairs matched → game over screen
- [ ] Score is calculated from time and move count (fewer moves + faster = higher score)
- [ ] Best score is stored locally and shown on game over screen
- [ ] Level increases grid size: L1=3×2, L2=4×3, L3=4×4, L4=5×4, L5=6×5
- [ ] Sound plays on flip, match, and game complete (toggleable)
- [ ] Works on mobile (360px) and desktop

## Difficulty progression

| Level | Grid | Pairs | Cards |
|---|---|---|---|
| 1 | 3×2 | 3 | 6 |
| 2 | 4×3 | 6 | 12 |
| 3 | 4×4 | 8 | 16 |
| 4 | 5×4 | 10 | 20 |
| 5 | 6×5 | 15 | 30 |

## Scoring

```
score = max(0, 1000 - (moves × 10) - (seconds × 2))
```

Minimum score for completing a level: 100 points.

## UX notes

- Use emoji as card faces — no image assets needed
- Card back: a simple `?` or pattern background
- Cards should be large enough to tap easily on mobile (min 60×60px)
- Non-matching pair flip-back delay: 900ms (long enough to see, short enough to feel snappy)
- Matched pairs: reduce opacity to 0.5 so grid feels less cluttered
- Game over screen: big score number, best score below it, two buttons — Replay and Next Level

## Technical notes

- Logic in `cardFlip.logic.ts`: `createDeck`, `checkMatch`, `calculateScore`, `getGridSize`
- Types in `cardFlip.types.ts`: `Card`, `CardStatus`, `GameState`, `GameStatus`
- Unit tests: deck generation (no duplicates), match checking, score calculation, grid sizing
- No backend — LocalStorage for best score only
- Use CSS 3D transform for flip animation (not Framer Motion — keep it lightweight)

## Out of scope

- Multiplayer
- Card themes (custom emoji packs)
- Undo move
- Hint system
- Cloud leaderboard
