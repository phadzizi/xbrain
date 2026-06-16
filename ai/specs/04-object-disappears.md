# Feature: Object Disappears

## User story

As a player, I want to briefly see a group of emoji objects and then identify which one disappeared, so that I can train my visual attention and recall.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Object Disappears from the home screen
2. Player sees a Start button and the current level
3. Player taps Start
4. A set of emoji objects appear on screen for a preview duration
5. Objects disappear — one is now missing
6. Player is shown a row of answer options (all original objects in shuffled order)
7. Player taps the object they think disappeared
   - Correct → brief green feedback, score increases, next round
   - Wrong → brief red feedback showing which was correct, then game over
8. Game over screen: score (rounds survived), best score, Replay button

## Acceptance criteria

- [ ] Objects displayed in a wrap grid during preview
- [ ] Preview duration: 3 seconds at level 1, reduces with level
- [ ] After preview, one random object is removed from the grid — remaining objects stay visible
- [ ] Answer options show all original objects in shuffled order
- [ ] Player taps one option to submit answer
- [ ] Correct: flash green on chosen option, short delay, then next round
- [ ] Wrong: flash red on chosen option, highlight correct one in green, then game over
- [ ] Score = rounds survived
- [ ] Best score stored locally
- [ ] Object count starts at 5 (level 1), increases with level (capped at 12)
- [ ] Preview duration decreases with level (min 1.5 seconds)
- [ ] Sound on correct/wrong (toggleable)
- [ ] Works on mobile (360px) and desktop

## Difficulty progression

| Level | Object count       | Preview time                 |
| ----- | ------------------ | ---------------------------- |
| 1     | 5                  | 3.0s                         |
| 2     | 6                  | 2.8s                         |
| 3     | 7                  | 2.5s                         |
| 4     | 8                  | 2.2s                         |
| 5     | 9                  | 2.0s                         |
| 6     | 10                 | 1.8s                         |
| 7+    | min(5 + level, 12) | max(3.0 - level × 0.2, 1.5)s |

## Scoring

```
score = rounds completed
bonus = +5 per round after round 5
```

## Object pool

Use emoji. Minimum 30 distinct objects in the pool so repeats within a single game are rare.

Example pool (at least these):
🍎 🍊 🍋 🍇 🍓 🍉 🥝 🌽 🥕 🧅
🚗 🚕 🚙 🚌 🚎 🚓 🚑 🚒 🛻 🚐
🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯
🎸 🎹 🎺 🎻 🥁 🪗 🎷 🪘 🎵 🎶

## UX notes

- Objects: large emoji, min 48px, displayed in a centered flex-wrap grid
- Answer options: displayed as a row of large tappable emoji buttons
- On correct: brief scale-up animation on the chosen option
- On wrong: chosen option shakes + turns red, correct option turns green
- "Remember these!" text shown during preview
- "Which one disappeared?" text shown during answer phase

## Technical notes

- Logic in `objectDisappears.logic.ts`: `generateRound`, `checkAnswer`, `getDifficulty`, `calculateScore`
- Types in `objectDisappears.types.ts`: `ObjectItem`, `GameStatus`, `ObjectDisappearsRound`, `ObjectDisappearsState`
- Unit tests: round generation (missing item not in visible items, options include missing item), answer checking, difficulty calculation
- `generateRound` accepts injectable `rng` function for deterministic tests
- Object pool defined as a constant array in the logic file

## Out of scope

- Custom object packs
- Two objects disappearing at once (follow-up feature)
- Time limit per answer (follow-up feature)
- Cloud leaderboard
