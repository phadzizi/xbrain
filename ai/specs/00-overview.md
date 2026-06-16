# Game Specs Overview

Seven simple memory games, each targeting a different memory skill. All games share the same progression model: levels get harder, scores are stored locally, and every game works on web, Android, and iOS.

---

## Shared design principles

- **Emoji-first** — use emoji for objects, icons, and symbols; no image assets needed for MVP
- **One screen per game** — no multi-step flows; the game loop lives on one screen
- **Level = difficulty** — every game uses the same level model: level increases, game gets harder
- **Offline-first** — all scores and progress stored locally; no login required
- **Sound optional** — sound is off by default; player can toggle it on
- **Mobile-first layout** — designed for 360px screens, scales up to desktop

---

## Shared game loop

Every game follows this loop:

```
Idle → Preview/Show → Player Input → Feedback → Next Round / Game Over
```

---

## Shared scoring model

```
base points per level × correct answer × combo multiplier
```

- Combo increases each consecutive correct answer
- Combo resets on wrong answer
- Best score saved per game

---

## Game list

| # | Game | Memory type | Core mechanic | Start difficulty |
|---|---|---|---|---|
| 1 | [Card Flip](01-card-flip.md) | Visual recall | Find matching pairs | 3 pairs (6 cards) |
| 2 | [Simon Says](02-simon-says.md) | Sequence/pattern | Repeat a color sequence | 3 colors |
| 3 | [Number Sequence](03-number-sequence.md) | Short-term numeric | Type back a number sequence | 3 digits |
| 4 | [Object Disappears](04-object-disappears.md) | Visual attention | Spot the missing object | 5 objects |
| 5 | [Word Recall](05-word-recall.md) | Verbal | Recall as many words as possible | 4 words |
| 6 | [Pattern Copy](06-pattern-copy.md) | Visual pattern | Rebuild a color pattern | 4 cells |
| 7 | [Position Grid](07-position-grid.md) | Spatial | Remember item positions in a grid | 3×3 grid, 3 items |

---

## Build order recommendation

Build in this order — each one is more complex than the last, so you ramp up naturally:

1. **Card Flip** — simplest state machine, no timers, pure matching logic
2. **Simon Says** — adds timed sequences and disable-during-playback
3. **Object Disappears** — adds timed preview and option selection
4. **Number Sequence** — adds text input and sequence comparison
5. **Word Recall** — adds free-text input and partial matching
6. **Pattern Copy** — adds grid state and multi-cell comparison
7. **Position Grid** — hardest; combines grid, items, and spatial recall
