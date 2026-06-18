import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

// Round 1: 3 digits, 3s preview + 3s countdown = 6s minimum before input mode.
// Set a generous budget for CPU-saturated parallel runs.
const INPUT_TIMEOUT = 20_000;

test.describe('Number Sequence — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/number-sequence');
  });

  test('shows idle screen with start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('starts game and shows countdown then preview', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('countdown')).toBeVisible({ timeout: 3000 });
    await assertNoHorizontalScroll(page);
  });

  test('transitions to input mode after countdown and preview', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'input',
      { timeout: INPUT_TIMEOUT }
    );

    await expect(page.getByTestId('sequence-input')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('correct answer advances to round 2', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'input',
      { timeout: INPUT_TIMEOUT }
    );

    const seqAttr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const digits = seqAttr!.split(',');

    await page.getByTestId('sequence-input').fill(digits.join(''));
    await page.getByTestId('submit-button').click();

    // Round indicator should eventually show 2
    await expect(page.getByTestId('round-indicator')).toContainText('2', { timeout: 5000 });
    await assertNoHorizontalScroll(page);
  });

  test('wrong answer triggers game-over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'input',
      { timeout: INPUT_TIMEOUT }
    );

    const seqAttr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const digits = seqAttr!.split(',');

    // Build a definitely-wrong answer by reversing (or using all 1s if sequence has length 1)
    const wrongAnswer = digits.length > 1 ? digits.slice().reverse().join('') : '999';
    // Make sure it's actually wrong
    const correctAnswer = digits.join('');
    const finalWrong = wrongAnswer === correctAnswer ? '11111111' : wrongAnswer;

    await page.getByTestId('sequence-input').fill(finalWrong);
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('feedback-wrong')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('score-display')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('replay resets the game', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'input',
      { timeout: INPUT_TIMEOUT }
    );

    const seqAttr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const digits = seqAttr!.split(',');
    const correctAnswer = digits.join('');
    const wrongAnswer = correctAnswer === '11111111' ? '22222222' : '11111111';

    await page.getByTestId('sequence-input').fill(wrongAnswer);
    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('game-over-screen')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('game-over-screen')).not.toBeVisible();
    await expect(page.getByTestId('round-indicator')).toContainText('1');
    await assertNoHorizontalScroll(page);
  });

  test('enter key submits the answer', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.locator('[data-testid="game-info"]')).toHaveAttribute(
      'data-status',
      'input',
      { timeout: INPUT_TIMEOUT }
    );

    const seqAttr = await page.getAttribute('[data-testid="game-info"]', 'data-sequence');
    const digits = seqAttr!.split(',');

    await page.getByTestId('sequence-input').fill(digits.join(''));
    await page.getByTestId('sequence-input').press('Enter');

    await expect(page.getByTestId('feedback-correct')).toBeVisible({ timeout: 3000 });
    await assertNoHorizontalScroll(page);
  });

  test('no horizontal scroll after starting game', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await assertNoHorizontalScroll(page);
  });
});
