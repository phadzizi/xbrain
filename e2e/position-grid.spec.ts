import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

// Level 1: 3s countdown + 4s preview = 7s before recall phase.
// Allow generous budget for CPU-saturated parallel runs.
const RECALL_TIMEOUT = 15_000;
// Countdown arrives within ~1s; preview within ~4s.
const PREVIEW_TIMEOUT = 10_000;

test.describe('Position Grid — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/position-grid');
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

  test('shows preview grid with objects', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'preview',
      { timeout: PREVIEW_TIMEOUT }
    );
    await expect(page.getByTestId('position-grid')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('transitions to recall phase with grid and sidebar', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );
    await expect(page.getByTestId('position-grid')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-object"]').first()).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('can select an object and place it on the grid', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    // Select the first sidebar object
    const firstObj = page.locator('[data-testid="sidebar-object"]').first();
    const objId = await firstObj.getAttribute('data-object-id');
    await firstObj.click();

    // Place it in cell 0
    await page.locator('[data-testid="grid-cell"][data-index="0"]').click();

    await expect(page.locator('[data-testid="grid-cell"][data-index="0"]')).toHaveAttribute(
      'data-placed-object',
      objId!
    );
    await assertNoHorizontalScroll(page);
  });

  test('correct placements advance to next round', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    // Read correct placements from the hidden game-info element
    const placementsRaw = await page.getAttribute('[data-testid="game-info"]', 'data-placements');
    const placements = placementsRaw!
      .split(',')
      .map((s) => s.split(':'))
      .map(([objectId, cellIndex]) => ({ objectId, cellIndex: Number(cellIndex) }));

    // Replay each placement: select object from sidebar, click the correct cell
    for (const { objectId, cellIndex } of placements) {
      await page.locator(`[data-testid="sidebar-object"][data-object-id="${objectId}"]`).click();
      await page.locator(`[data-testid="grid-cell"][data-index="${cellIndex}"]`).click();
    }

    await page.getByTestId('submit-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'results',
      { timeout: 3000 }
    );
    await expect(page.getByTestId('results-summary')).toBeVisible();
    await expect(page.getByTestId('next-round-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('poor placement (0 correct) triggers game over', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    // Submit without placing anything — 0 / 3 → game over
    await page.getByTestId('submit-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'results',
      { timeout: 3000 }
    );
    await expect(page.getByTestId('quit-button')).toContainText('See Final Score');
    await assertNoHorizontalScroll(page);
  });

  test('see final score button goes to game over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    await page.getByTestId('submit-button').click();
    await expect(page.getByTestId('quit-button')).toContainText('See Final Score', {
      timeout: 3000,
    });
    await page.getByTestId('quit-button').click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 3000 });
    await assertNoHorizontalScroll(page);
  });

  test('play again resets game to level 1', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    // Force game over
    await page.getByTestId('submit-button').click();
    await page.getByTestId('quit-button').click();
    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 3000 });

    // Play again
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

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );
    await assertNoHorizontalScroll(page);
  });
});
