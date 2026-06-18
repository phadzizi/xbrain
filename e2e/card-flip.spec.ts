import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

test.describe('Card Flip — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/card-flip');
  });

  test('shows idle screen with start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('starts the game and renders card grid with HUD', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="card"]').first()).toBeVisible();
    await expect(page.getByTestId('move-counter')).toBeVisible();
    await expect(page.getByTestId('timer-display')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('level 1 grid has 6 cards', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="card"]')).toHaveCount(6);
  });

  test('completes the game and shows score on game-over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Read all card IDs from the DOM to find matching pairs without guessing
    const cardIds: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="card"]')).map(
        (el) => el.getAttribute('data-card-id') ?? ''
      )
    );

    // Group card IDs by pairId (the emoji prefix before "-0" / "-1")
    const pairMap = new Map<string, string[]>();
    for (const id of cardIds) {
      const pairId = id.slice(0, -2); // strip "-0" or "-1"
      const group = pairMap.get(pairId) ?? [];
      group.push(id);
      pairMap.set(pairId, group);
    }

    // Click each pair in sequence
    for (const [, ids] of pairMap) {
      await page.locator(`[data-card-id="${ids[0]}"]`).click();
      await page.locator(`[data-card-id="${ids[1]}"]`).click();
      // Wait for matched status before clicking the next pair
      await expect(page.locator(`[data-card-id="${ids[0]}"]`)).toHaveAttribute(
        'data-card-status',
        'matched'
      );
    }

    await expect(page.getByTestId('game-over-screen')).toBeVisible();
    await expect(page.getByTestId('score-display')).toBeVisible();
    await expect(page.getByTestId('best-score-display')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('replay resets the game', async ({ page }) => {
    await page.getByTestId('start-button').click();

    const cardIds: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid="card"]')).map(
        (el) => el.getAttribute('data-card-id') ?? ''
      )
    );

    const pairMap = new Map<string, string[]>();
    for (const id of cardIds) {
      const pairId = id.slice(0, -2);
      const group = pairMap.get(pairId) ?? [];
      group.push(id);
      pairMap.set(pairId, group);
    }

    for (const [, ids] of pairMap) {
      await page.locator(`[data-card-id="${ids[0]}"]`).click();
      await page.locator(`[data-card-id="${ids[1]}"]`).click();
      await page.waitForTimeout(150);
    }

    await expect(page.getByTestId('game-over-screen')).toBeVisible();

    await page.getByTestId('start-button').click(); // Replay

    await expect(page.getByTestId('game-over-screen')).not.toBeVisible();
    await expect(page.locator('[data-testid="card"]')).toHaveCount(6);
    await assertNoHorizontalScroll(page);
  });

  test('no horizontal scroll after starting game', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await assertNoHorizontalScroll(page);
  });
});
