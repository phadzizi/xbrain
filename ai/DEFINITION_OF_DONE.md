# Definition of Done

A feature is done only when every item below is checked. If any item is unchecked, the feature is not done — do not open the PR.

---

## Functionality

- [ ] Satisfies every acceptance criterion listed in the feature request
- [ ] Does not break any existing games, routes, or shared components
- [ ] Works on web (desktop and mobile viewport)
- [ ] Works on Android (manual or emulator check)
- [ ] Works on iOS (manual or simulator check, where available)

## Code quality

- [ ] Follows `/ai/GOOD_CODE_STANDARD.md`
- [ ] Follows `/ai/GAME_FEATURE_STANDARD.md` (for game features)
- [ ] Logic is separated from UI
- [ ] No `any` in TypeScript
- [ ] No unused imports or variables
- [ ] No dead code
- [ ] Timers, intervals, and subscriptions are cleaned up on unmount

## Checks

- [ ] `npm run format:check` passes
- [ ] `npm run lint` passes (zero warnings)
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds

## Tests

- [ ] Unit tests cover pure logic
- [ ] Edge cases are tested (empty input, max level, invalid answer)
- [ ] Component test covers main interaction (where practical)
- [ ] E2E happy-path test exists for new games and new screens

## PR

- [ ] Branch name follows convention (`feature/`, `fix/`, `chore/`)
- [ ] Commit message follows convention (`feat:`, `fix:`, `chore:`)
- [ ] PR title is clear and under 70 characters
- [ ] PR description is complete (summary, criteria, tests, commands run, limitations)
- [ ] Self-review was completed using `/ai/SELF_REVIEW_PROMPT.md`
- [ ] At least one improvement was made after self-review
