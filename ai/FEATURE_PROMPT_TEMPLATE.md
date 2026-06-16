# Feature Prompt Template

Use this template when requesting a new feature. The more complete this is, the better the PR output.

---

```
# Feature: [Short name]

## User story

As a [player/user], I want to [action], so that [benefit].

## Target platforms

- [ ] Web (desktop)
- [ ] Web (mobile)
- [ ] Android
- [ ] iOS

## Acceptance criteria

List concrete, testable criteria. Each one should be independently verifiable.

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## UX notes

Describe layout, interactions, and visual feedback. Include:

- Screen flow (what the player sees step by step)
- Feedback for correct/wrong answers
- Timer behavior if applicable
- Sound behavior
- Mobile-specific considerations

## Technical notes

- Game logic must be separated from UI
- List any new types needed
- List any shared services to use
- List any new dependencies (only if truly necessary)
- List tests required
- Mention anything that should NOT be in scope

## Out of scope

Explicitly list what this feature does not include to prevent scope creep.
```

---

## Example

```
# Feature: Add Object Disappears memory game

## User story

As a player, I want to briefly see a group of objects and then identify which one disappeared, so that I can train my visual memory.

## Target platforms

- [x] Web (desktop)
- [x] Web (mobile)
- [x] Android
- [x] iOS

## Acceptance criteria

- [ ] Player sees a set of objects for 3 seconds
- [ ] One object disappears
- [ ] Player must tap the missing object from a set of options
- [ ] Correct answer increases score and advances to next round
- [ ] Wrong answer shows feedback and ends the round
- [ ] Difficulty increases every 3 rounds (more objects, shorter preview)
- [ ] Best score is stored locally and shown on game over screen
- [ ] Sound can be toggled off
- [ ] Works on mobile and desktop

## UX notes

- Use emoji as objects (no image assets needed for MVP)
- Large touch targets for option buttons
- Short animation when object disappears (fade out)
- Show score throughout game
- Game over screen shows score and best score with a replay button

## Technical notes

- Logic in objectDisappears.logic.ts (pure functions only)
- Types in objectDisappears.types.ts
- Unit tests: round generation, answer checking, scoring, difficulty progression
- Use storage service for best score persistence
- No backend, no auth

## Out of scope

- Multiplayer
- Cloud leaderboard
- Custom object sets
- Accessibility audit (follow-up ticket)
```
