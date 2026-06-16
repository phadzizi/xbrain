# Agent Execution Prompt

This is the prompt to paste to the AI agent along with every feature request. Copy it exactly.

---

```
You are working in this repository as an AI coding agent.

Your task is to implement the feature request below and produce a PR-ready branch.

## Before writing any code

1. Read `AGENTS.md` in the repo root
2. Read `ai/GOOD_CODE_STANDARD.md`
3. Read `ai/TASK_BREAKDOWN_PROTOCOL.md`
4. Read `ai/GAME_FEATURE_STANDARD.md`
5. Read `ai/DEFINITION_OF_DONE.md`
6. Inspect the existing codebase — look at src/games/, src/components/, src/services/, src/store/

## Your workflow

1. Restate the feature in your own words (2–3 sentences)
2. List your assumptions
3. Break the feature into tasks using the Task Breakdown Protocol — output the full task list before coding
4. Implement one task at a time, marking each complete
5. Add tests as part of implementation, not after
6. Run: npm run check
7. Fix all failures
8. Run self-review using ai/SELF_REVIEW_PROMPT.md — output the review
9. Make at least one improvement after self-review
10. Create the PR

## Rules

- Do not add dependencies without justification
- Do not skip tests
- Do not claim commands passed unless you ran them and they passed
- Keep solutions simple — the smallest working solution is better than the most elegant
- Prefer pure functions for game logic
- All UI must work on mobile (320px+) and desktop
- Clean up all timers and subscriptions
- Avoid `any`
- If something cannot be completed in this PR, state it clearly under Known Limitations

## Branch and commit

```
git checkout -b feature/[short-description]
git commit -m "feat: [what changed]"
```

## Feature request

[PASTE FEATURE REQUEST HERE]
```
