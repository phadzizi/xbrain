import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

// Level 1 preview = 3000ms. Allow generous budget for CPU-saturated parallel runs.
const GUESSING_TIMEOUT = 12_000;

test.describe('Object Disappears — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/object-disappears');
  });

  test('shows idle screen with start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('starts game and shows preview phase with objects', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'preview',
      { timeout: 3000 }
    );

    await expect(page.getByTestId('objects-grid')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('transitions to guessing mode after preview', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'guessing',
      { timeout: GUESSING_TIMEOUT }
    );

    await expect(page.getByTestId('objects-grid')).toBeVisible();
    await expect(page.getByTestId('options-row')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('correct answer advances to level 2', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'guessing',
      { timeout: GUESSING_TIMEOUT }
    );

    const missingId = await page.getAttribute('[data-testid="game-info"]', 'data-missing-item');

    await page.locator(`[data-option-id="${missingId}"]`).click();

    await expect(page.getByTestId('level-indicator')).toContainText('2', { timeout: 5000 });
    await assertNoHorizontalScroll(page);
  });

  test('wrong answer triggers game-over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'guessing',
      { timeout: GUESSING_TIMEOUT }
    );

    const missingId = await page.getAttribute('[data-testid="game-info"]', 'data-missing-item');

    // Click the first option that is NOT the missing item
    const wrongButton = page
      .locator('[data-testid="option-button"]')
      .filter({ hasNot: page.locator(`[data-option-id="${missingId}"]`) })
      .first();

    await wrongButton.click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('score-display')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('replay resets the game', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'guessing',
      { timeout: GUESSING_TIMEOUT }
    );

    const missingId = await page.getAttribute('[data-testid="game-info"]', 'data-missing-item');

    const wrongButton = page
      .locator('[data-testid="option-button"]')
      .filter({ hasNot: page.locator(`[data-option-id="${missingId}"]`) })
      .first();

    await wrongButton.click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('game-over-screen')).not.toBeVisible();
    await expect(page.getByTestId('level-indicator')).toContainText('1');
    await assertNoHorizontalScroll(page);
  });

  test('options not shown during preview phase', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'preview',
      { timeout: 3000 }
    );

    await expect(page.getByTestId('options-row')).not.toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('no horizontal scroll after starting game', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await assertNoHorizontalScroll(page);
  });
});
