# Feature: Word Recall Challenge

## User story

As a player, I want to read a list of words briefly and then recall as many as I can, so that I can improve my verbal memory and word retention.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Screen flow

1. Player opens Word Recall from the home screen
2. Player sees a Start button and the current level
3. Player taps Start — countdown: "Ready... 3, 2, 1"
4. A list of words appears for a preview duration
5. Words disappear — player sees an empty text input
6. Player types words they remember, one at a time, pressing Enter or Add after each
7. Timer counts down (30 seconds)
8. Timer reaches zero or player taps Done
9. Results screen: words player got right (green), words they missed (grey), score, best score
10. Player can tap Next Round to continue or Quit to exit

## Acceptance criteria

- [ ] Words displayed clearly, one per line or in a centered list
- [ ] Preview duration depends on word count (1.5 seconds per word, minimum 3 seconds)
- [ ] After preview, words are hidden and input + timer appear
- [ ] Player can type and add words until the 30-second timer expires or they tap Done
- [ ] Word matching is case-insensitive and strips leading/trailing whitespace
- [ ] Each correctly recalled word = 1 point
- [ ] Score per round = correctly recalled words
- [ ] Total score accumulates across rounds until game over
- [ ] Game over when player scores 0 on a round (recalled no words)
- [ ] Results screen shows: recalled words highlighted green, missed words in grey
- [ ] Best score (highest total across a full game) stored locally
- [ ] Word count starts at 4 (level 1), increases by 1 per round (capped at 12)
- [ ] Works on mobile (keyboard open, input visible) and desktop

## Difficulty progression

| Level | Word count         | Preview time  |
| ----- | ------------------ | ------------- |
| 1     | 4                  | 6s            |
| 2     | 5                  | 7.5s          |
| 3     | 6                  | 9s            |
| 4     | 7                  | 10s           |
| 5     | 8                  | 10s           |
| 6+    | min(3 + level, 12) | capped at 10s |

## Scoring

```
round score = correctly recalled words
total score += round score each round
game over when round score = 0
best score = highest total score achieved
```

## Word pool

Simple, common English words. No compound words, no plurals, no jargon. Categories:

Animals: cat, dog, fish, bird, fox, lion, bear, wolf, duck, frog
Food: rice, bread, milk, cake, soup, corn, pear, plum, lime, fig
Colors: red, blue, green, pink, gold, grey, teal, rust, cyan, lime
Objects: book, lamp, door, chair, clock, phone, glass, brush, knife, spoon
Nature: tree, rain, snow, wind, fire, rock, sand, leaf, wave, moon
Actions: run, jump, read, swim, sing, draw, cook, fly, walk, dance

Minimum pool: 100 unique words. Words are drawn randomly each round without repeating within a single game session.

## UX notes

- Preview: large centered word list, one word per line, clean sans-serif font
- Recall phase: input at top of screen so keyboard doesn't cover added words
- Added words shown as chips/tags below the input
- Duplicate entries silently ignored
- Countdown timer shown as a progress bar (not a number) to reduce anxiety
- Results: two columns — "You got" (green chips) vs "You missed" (grey chips)
- Transition between rounds: brief flash of score gained before next preview

## Technical notes

- Logic in `wordRecall.logic.ts`: `drawWords`, `checkRecall`, `calculateRoundScore`, `isGameOver`
- Types in `wordRecall.types.ts`: `GameStatus`, `WordRecallState`, `RecallResult`
- Unit tests: word drawing (no repeats within session), case-insensitive matching, score calculation, game-over detection
- Word pool as a static constant in the logic file — no API calls
- Timer cleanup on unmount

## Out of scope

- Multiple languages
- Custom word lists
- Spelling correction / fuzzy matching
- Cloud leaderboard
