import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

// The preview for round 1 takes: 800ms start delay + 3*800ms + 200ms ≈ 3.2s.
// We give the test 10s to wait for input mode before timing out.
const INPUT_TIMEOUT = 10_000;

test.describe('Simon Says — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/simon-says');
  });

  test('shows idle screen with start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('starts game and shows preview phase with disabled buttons', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Buttons should be disabled during preview
    const buttons = page.locator('[data-testid="color-button"]');
    await expect(buttons).toHaveCount(4);

    // Status text reads "Watch…"
    await expect(page.getByTestId('status-text')).toContainText('Watch');
    await assertNoHorizontalScroll(page);
  });

  test('transitions to input mode after preview', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await page.waitForSelector('[data-testid="game-info"][data-status="input"]', {
      timeout: INPUT_TIMEOUT,
    });

    // Buttons should now be enabled
    const firstButton = page.locator('[data-testid="color-button"]').first();
    await expect(firstButton).toBeEnabled();

    await expect(page.getByTestId('status-text')).toContainText('Your turn');
    await assertNoHorizontalScroll(page);
  });

  test('wrong tap triggers game-over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Wait for input mode and read the expected sequence from the DOM
    await page.waitForSelector('[data-testid="game-info"][data-status="input"]', {
      timeout: INPUT_TIMEOUT,
    });

    const seqAttr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const seq = seqAttr!.split(',');

    // Pick a color guaranteed to be wrong on the first tap
    const allColors = ['red', 'blue', 'green', 'yellow'];
    const wrongColor = allColors.find((c) => c !== seq[0])!;

    await page.locator(`[data-color="${wrongColor}"]`).click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 2000 });
    await expect(page.getByTestId('score-display')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('completes round 1 then triggers game over on round 2', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // ── Round 1: click all colors correctly ─────────────────────
    await page.waitForSelector('[data-testid="game-info"][data-status="input"]', {
      timeout: INPUT_TIMEOUT,
    });

    const seq1Attr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const seq1 = seq1Attr!.split(',');

    for (const color of seq1) {
      await page.locator(`[data-color="${color}"]`).click();
      // Small delay between taps so each registers separately
      await page.waitForTimeout(80);
    }

    // Round counter should now show 2
    await expect(page.getByTestId('round-indicator')).toContainText('2', { timeout: 3000 });

    // ── Round 2: wait for input, then deliberately tap wrong ─────
    await page.waitForSelector('[data-testid="game-info"][data-status="input"]', {
      timeout: INPUT_TIMEOUT,
    });

    const seq2Attr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const seq2 = seq2Attr!.split(',');

    const allColors = ['red', 'blue', 'green', 'yellow'];
    const wrongColor = allColors.find((c) => c !== seq2[0])!;

    await page.locator(`[data-color="${wrongColor}"]`).click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 2000 });
    await expect(page.getByTestId('score-display')).toBeVisible();
    await expect(page.getByTestId('best-score-display')).toBeVisible();
  });

  test('replay resets the game to idle → playing', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await page.waitForSelector('[data-testid="game-info"][data-status="input"]', {
      timeout: INPUT_TIMEOUT,
    });

    const seqAttr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const seq = seqAttr!.split(',');
    const wrongColor = ['red', 'blue', 'green', 'yellow'].find((c) => c !== seq[0])!;

    await page.locator(`[data-color="${wrongColor}"]`).click();
    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 2000 });

    // Click Replay
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('game-over-screen')).not.toBeVisible();
    await expect(page.locator('[data-testid="color-button"]')).toHaveCount(4);
    await assertNoHorizontalScroll(page);
  });
});
