# Mobile & Web Testing Protocol

Every feature must be mechanically verified at multiple viewports before PR. "It should work" is not acceptable — run the tests, capture the screenshots, check the checklist.

---

## 1. Viewport matrix

Every Playwright E2E test must run at all four viewports:

| Name | Width | Height | Represents |
|---|---|---|---|
| `mobile-sm` | 320px | 568px | Small Android / iPhone SE |
| `mobile-lg` | 390px | 844px | iPhone 14 |
| `tablet` | 768px | 1024px | iPad portrait |
| `desktop` | 1280px | 800px | Laptop |

Configure this in `playwright.config.ts` — see section 3.

---

## 2. What Playwright must cover for every new game

### Happy path (required)

1. Navigate to the game from the home screen
2. Start the game
3. Complete one round correctly
4. Verify score increases
5. Complete a second round
6. Trigger game over (intentionally wrong answer or timeout)
7. Verify game over screen shows score and best score
8. Tap Replay — verify game resets

This test must pass at **all four viewports**.

### Viewport-specific assertions

At `mobile-sm` (320px), additionally assert:

- No horizontal scrollbar (`document.body.scrollWidth <= 320`)
- All buttons visible without scrolling
- Score display visible
- Input fields (if any) not covered by keyboard — use `visualViewport` height check

At `desktop` (1280px), additionally assert:

- Game content is centered and not stretched beyond `max-width: 480px`
- No layout elements are misaligned

---

## 3. Playwright configuration

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-sm',
      use: { ...devices['Galaxy S5'] },   // 360×640
    },
    {
      name: 'mobile-lg',
      use: { ...devices['iPhone 14'] },   // 390×844
    },
    {
      name: 'tablet',
      use: { ...devices['iPad'] },        // 768×1024
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 4. E2E test file structure

```
e2e/
  [game-name].spec.ts     ← one file per game
  helpers/
    game.ts               ← shared selectors and interactions
```

Example for Card Flip:

```ts
// e2e/card-flip.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Card Flip — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/card-flip');
  });

  test('completes a round and shows score', async ({ page }) => {
    // Start game
    await page.getByRole('button', { name: 'Start' }).click();

    // Flip cards until a pair is found
    const cards = page.locator('[data-testid="card"]');
    await cards.nth(0).click();
    await cards.nth(1).click();
    // Playwright will retry assertions — if no match, click more pairs

    // Assert game is ongoing
    await expect(page.getByTestId('move-counter')).toBeVisible();

    // Assert no horizontal overflow at current viewport
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
```

---

## 5. Shared test selectors rule

Use `data-testid` attributes on key elements — never CSS selectors or text content that can change:

```tsx
<div data-testid="score-display">{score}</div>
<button data-testid="start-button">Start</button>
<div data-testid="card" data-card-id={card.id}>...</div>
<div data-testid="game-over-screen">...</div>
```

Map of required `data-testid` values for every game:

| Element | `data-testid` |
|---|---|
| Score display | `score-display` |
| Best score display | `best-score-display` |
| Start / Replay button | `start-button` |
| Game over screen | `game-over-screen` |
| Round indicator | `round-indicator` (if shown) |

---

## 6. No-horizontal-scroll assertion

Add this as a utility function in `e2e/helpers/viewport.ts`:

```ts
import { Page, expect } from '@playwright/test';

export async function assertNoHorizontalScroll(page: Page) {
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()!.width;
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
}
```

Call it in every test after significant interactions.

---

## 7. Screenshot snapshots (CI)

In CI, Playwright captures screenshots on failure. For new games, also capture baseline screenshots at all four viewports manually and commit them to `e2e/screenshots/`:

```bash
npx playwright test --update-snapshots
```

This gives you visual regression protection — future changes that break layout will fail the snapshot diff.

---

## 8. Capacitor verification (before PR if native files changed)

If any of these changed, run the Capacitor sync check before PR:

- `capacitor.config.ts`
- `src/services/` files that use Capacitor plugins
- Any `@capacitor/*` imports

Steps:

```bash
npm run build
npx cap sync

# Android: open in Android Studio and do a quick run on emulator
npx cap open android

# iOS: open in Xcode and do a quick run on simulator (Mac only)
npx cap open ios
```

For PRs that only change game logic or UI with no native plugin usage, Capacitor sync is not required but still recommended before shipping.

---

## 9. Manual testing checklist

Run this yourself on a real device or browser devtools before merging any game feature:

```
Chrome devtools — Device toolbar

[ ] Toggle device toolbar (Cmd+Shift+M)
[ ] Set to "iPhone SE" (375×667) — check layout
[ ] Set to "Galaxy S20" (360×800) — check layout
[ ] Set to "iPad Air" (820×1180) — check layout
[ ] Responsive mode at 320px — nothing overflows
[ ] Responsive mode at 1440px — content centered, not stretched

Touch simulation

[ ] All buttons respond to tap (not just hover)
[ ] No accidental double-tap zoom (set touch-action or font-size ≥ 16px on inputs)
[ ] No 300ms tap delay

Keyboard navigation (desktop)

[ ] Tab through all interactive elements in logical order
[ ] Focus ring visible on all focused elements
[ ] Enter/Space activates buttons

Safari (if available)

[ ] Run on Safari — check for CSS gaps (Safari has different flexbox behavior)
[ ] Check that `dvh` units work (use `min-height: 100dvh` not `100vh` to handle iOS toolbar)
```

---

## 10. CI viewport testing

Add this to `.github/workflows/ci.yml` after the build step:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: E2E tests (all viewports)
  run: npm run test:e2e
```

This ensures every PR is tested at all four viewports in CI before you can merge.
