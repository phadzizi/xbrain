# Feature: Number Sequence Recall

## User story

As a player, I want to see a sequence of numbers briefly and then type it back from memory, so that I can improve my short-term numeric memory.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Number Sequence from the home screen
2. Player sees a Start button and the current level
3. Player taps Start
4. Numbers appear on screen one at a time, or as a full sequence, for a set duration
5. Numbers disappear — player sees an empty input field
6. Player types the sequence from memory and taps Submit
   - Correct → score increases, next round starts (longer sequence)
   - Wrong → brief feedback showing correct answer, then game over screen
7. Game over screen: score (rounds survived), best score, Replay button

## Acceptance criteria

- [ ] Numbers are displayed large and clearly for the preview duration
- [ ] Preview duration is based on sequence length (1 second per digit, minimum 2 seconds)
- [ ] After preview, numbers are hidden and an input field appears
- [ ] Player types the sequence using the device keyboard (numeric input)
- [ ] Submit button or pressing Enter submits the answer
- [ ] Correct answer: show green feedback, advance to next round
- [ ] Wrong answer: show correct sequence briefly (1.5 seconds), then game over
- [ ] Sequence starts at 3 digits (level 1)
- [ ] Each correct round adds 1 digit to the sequence
- [ ] Score = number of rounds completed
- [ ] Best score stored locally
- [ ] Works on mobile (keyboard should not cover the number display)
- [ ] Works on desktop

## Difficulty progression

| Level | Digits | Preview time |
|---|---|---|
| 1 | 3 | 3s |
| 2 | 4 | 4s |
| 3 | 5 | 5s |
| 4 | 6 | 5s |
| 5 | 7 | 5s |
| 6+ | level + 2 | capped at 5s |

## Scoring

```
score = rounds completed
bonus = +3 per round after round 8
```

## Display modes

Two display options — implement option A first:

**A. Full sequence at once** (simpler)
Show the full number sequence at once for the preview duration, then hide it.
Example: `4 9 2 7` shown for 4 seconds.

**B. One digit at a time** (harder, add as a toggle later)
Flash each digit individually for 800ms with a gap between them.

## UX notes

- Number display: very large font (min 48px), centered, one line if possible
- Input: numeric keyboard type (`inputMode="numeric"`) so mobile shows number pad
- Digits separated by spaces in display for readability: `4 9 2 7`
- Player input compared without spaces: strip spaces before comparing
- Countdown shown before preview starts: "Ready... 3, 2, 1"
- Wrong answer: input turns red briefly, then shows correct answer in green

## Technical notes

- Logic in `numberSequence.logic.ts`: `generateSequence`, `checkAnswer`, `getPreviewDuration`, `calculateScore`
- Types in `numberSequence.types.ts`: `GameStatus`, `NumberSequenceState`
- Unit tests: sequence generation (correct length, digits 1–9), answer checking (with/without spaces), preview duration calculation
- `checkAnswer` strips whitespace and compares strings
- No floats — use single digits 1–9 only (avoids ambiguity)

## Out of scope

- Decimal numbers
- Negative numbers
- Letter sequences (separate game)
- Cloud leaderboard
