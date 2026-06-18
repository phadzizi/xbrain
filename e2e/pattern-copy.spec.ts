import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

// Level 1: 3s countdown + 3s preview = 6s before copy phase.
// Allow generous budget for CPU-saturated parallel runs.
const COPY_TIMEOUT = 15_000;
// Countdown arrives within ~1s of start; preview within 4s.
const PREVIEW_TIMEOUT = 10_000;

test.describe('Pattern Copy — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/pattern-copy');
  });

  test('shows idle screen with start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('shows countdown after start', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('countdown')).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await assertNoHorizontalScroll(page);
  });

  test('shows preview grid', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'preview',
      { timeout: PREVIEW_TIMEOUT }
    );
    await expect(page.getByTestId('pattern-grid')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('transitions to copy phase with grid, palette and submit', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute('data-status', 'copy', {
      timeout: COPY_TIMEOUT,
    });
    await expect(page.getByTestId('pattern-grid')).toBeVisible();
    await expect(page.locator('[data-testid="color-swatch"]').first()).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('can paint a cell with the selected color', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute('data-status', 'copy', {
      timeout: COPY_TIMEOUT,
    });

    // Select the first palette color and click the first cell
    await page.locator('[data-testid="color-swatch"]').first().click();
    await page.locator('[data-testid="grid-cell"][data-index="0"]').click();

    await expect(page.locator('[data-testid="grid-cell"][data-index="0"]')).not.toHaveAttribute(
      'data-color',
      'null'
    );
    await assertNoHorizontalScroll(page);
  });

  test('correct pattern submit advances to level 2', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute('data-status', 'copy', {
      timeout: COPY_TIMEOUT,
    });

    // Read the correct pattern from the hidden game-info element
    const patternRaw = await page.getAttribute('[data-testid="game-info"]', 'data-pattern');
    const pattern = patternRaw!.split(',');

    // Replay the pattern: select each required color then click the cell
    for (let i = 0; i < pattern.length; i++) {
      const color = pattern[i];
      if (color === 'null') continue;
      await page.locator(`[data-testid="color-swatch"][data-color="${color}"]`).click();
      await page.locator(`[data-testid="grid-cell"][data-index="${i}"]`).click();
    }

    await page.getByTestId('submit-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'correct',
      { timeout: 3000 }
    );
    // Level indicator should reach 2 after the correct-flash delay + countdown
    await expect(page.getByTestId('level-indicator')).toContainText('2', {
      timeout: COPY_TIMEOUT,
    });
    await assertNoHorizontalScroll(page);
  });

  test('wrong answer shows correct pattern and triggers game-over', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute('data-status', 'copy', {
      timeout: COPY_TIMEOUT,
    });

    // Submit empty grid — always wrong since the pattern has colored cells
    await page.getByTestId('submit-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'wrong',
      { timeout: 3000 }
    );
    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 5000 });
    await assertNoHorizontalScroll(page);
  });

  test('replay resets the game to level 1', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute('data-status', 'copy', {
      timeout: COPY_TIMEOUT,
    });

    // Force game over
    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 5000 });

    // Replay
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('game-over-screen')).not.toBeVisible();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'countdown',
      { timeout: 3000 }
    );
    await assertNoHorizontalScroll(page);
  });

  test('no horizontal scroll at any point', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await assertNoHorizontalScroll(page);

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute('data-status', 'copy', {
      timeout: COPY_TIMEOUT,
    });
    await assertNoHorizontalScroll(page);
  });
});
