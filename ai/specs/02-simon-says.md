# Feature: Simon Says

## User story

As a player, I want to watch a sequence of colored buttons light up and then repeat the sequence by tapping them, so that I can improve my pattern memory and concentration.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Simon Says from the home screen
2. Player sees 4 large colored buttons (red, blue, green, yellow) and a Start button
3. Player taps Start
4. App plays a sequence — each button lights up in turn with a sound
5. Sequence finishes — player's turn
6. Player taps the buttons in the same order
   - Correct tap → button lights up briefly, continue
   - Wrong tap → game over screen showing score and best score
7. If player completes the full sequence → score increases, next round starts with one more color added
8. Game over screen: score (rounds survived), best score, Replay button

## Acceptance criteria

- [ ] 4 colored buttons are displayed: red, blue, green, yellow
- [ ] Each button lights up (brighter/pulsed) when activated during playback or player tap
- [ ] Sequence starts at length 3
- [ ] Each correct round adds 1 more color to the sequence
- [ ] Buttons are disabled and not tappable during sequence playback
- [ ] Buttons become active after sequence finishes — visual indicator of whose turn it is
- [ ] Wrong tap immediately ends the round and shows game over screen
- [ ] Score = number of rounds completed
- [ ] Best score stored locally
- [ ] Each color has a distinct sound (toggleable)
- [ ] Playback speed increases at higher levels (interval between flashes shortens)
- [ ] Works on mobile (360px) and desktop

## Difficulty progression

| Level (rounds) | Sequence length | Playback interval |
| -------------- | --------------- | ----------------- |
| 1–5            | 3–7             | 800ms per color   |
| 6–10           | 8–12            | 650ms per color   |
| 11–15          | 13–17           | 500ms per color   |
| 16+            | 18+             | 400ms per color   |

## Scoring

```
score = rounds completed
bonus = +5 per round after round 10
```

## UX notes

- Buttons: large, rounded squares — at least 130×130px on mobile
- Active state: full brightness + slight scale-up
- Inactive state: desaturated (60% opacity)
- "Your turn" shown as text above buttons when player should tap
- "Watch..." shown during playback
- Game over: color flash on all buttons simultaneously before showing score screen

## Technical notes

- Logic in `simon.logic.ts`: `generateSequence`, `extendSequence`, `checkTap`, `getPlaybackInterval`, `calculateScore`
- Types in `simon.types.ts`: `SimonColor`, `GameStatus`, `SimonState`
- Unit tests: sequence generation, tap checking (correct and wrong), interval calculation by level
- Timer cleanup: all `setTimeout` calls must be cleared on unmount
- Do not use `setInterval` for playback — use `setTimeout` chain to sequence flashes with correct cleanup

## Out of scope

- More than 4 colors
- Custom color themes
- Two-player mode
- Cloud leaderboard
