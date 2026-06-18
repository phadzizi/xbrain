import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

// Level 1: 3s countdown + 6s preview = 9s before recall phase.
// Allow generous budget for CPU-saturated parallel runs.
const RECALL_TIMEOUT = 20_000;
// Preview arrives after the 3s countdown — extend for parallel-run CI headroom.
const PREVIEW_TIMEOUT = 10_000;

test.describe('Word Recall — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/word-recall');
  });

  test('shows idle screen with start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('starts game and shows countdown then preview', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('countdown')).toBeVisible({ timeout: PREVIEW_TIMEOUT });
    await assertNoHorizontalScroll(page);
  });

  test('shows word list during preview phase', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'preview',
      { timeout: PREVIEW_TIMEOUT }
    );

    await expect(page.getByTestId('word-list')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('transitions to recall phase with input and timer', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    await expect(page.getByTestId('word-input')).toBeVisible();
    await expect(page.getByTestId('add-button')).toBeVisible();
    await expect(page.getByTestId('done-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('can add a word during recall and it appears as a chip', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    const wordsAttr = await page.getAttribute('[data-testid="game-info"]', 'data-words');
    const firstWord = wordsAttr!.split(',')[0];

    await page.getByTestId('word-input').fill(firstWord);
    await page.getByTestId('add-button').click();

    await expect(page.getByTestId('recalled-chip').first()).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('correct word shows green on results screen', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    const wordsAttr = await page.getAttribute('[data-testid="game-info"]', 'data-words');
    const firstWord = wordsAttr!.split(',')[0];

    await page.getByTestId('word-input').fill(firstWord);
    await page.getByTestId('add-button').click();
    await page.getByTestId('done-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'results',
      { timeout: 3000 }
    );

    await expect(page.getByTestId('correct-chip').first()).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('correct answer advances to level 2', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    const wordsAttr = await page.getAttribute('[data-testid="game-info"]', 'data-words');
    const firstWord = wordsAttr!.split(',')[0];

    await page.getByTestId('word-input').fill(firstWord);
    await page.getByTestId('add-button').click();
    await page.getByTestId('done-button').click();

    await expect(page.getByTestId('next-round-button')).toBeVisible({ timeout: 3000 });
    await page.getByTestId('next-round-button').click();

    await expect(page.getByTestId('level-indicator')).toContainText('2', {
      timeout: RECALL_TIMEOUT,
    });
    await assertNoHorizontalScroll(page);
  });

  test('done without words triggers game-over flow', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    // Submit nothing — round score = 0 → game over
    await page.getByTestId('done-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'results',
      { timeout: 3000 }
    );

    // No "Next Round" when score is 0
    await expect(page.getByTestId('next-round-button')).not.toBeVisible();

    await page.getByTestId('quit-button').click();
    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('score-display')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('replay resets the game', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'recall',
      { timeout: RECALL_TIMEOUT }
    );

    await page.getByTestId('done-button').click();
    await expect(page.getByTestId('quit-button')).toBeVisible({ timeout: 3000 });
    await page.getByTestId('quit-button').click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 3000 });

    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('game-over-screen')).not.toBeVisible();
    await expect(page.getByTestId('level-indicator')).toContainText('1');
    await assertNoHorizontalScroll(page);
  });

  test('no horizontal scroll after starting game', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await assertNoHorizontalScroll(page);
  });
});
