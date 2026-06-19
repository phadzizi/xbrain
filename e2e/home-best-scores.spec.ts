import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

function seedScore(gameId: string, score: number) {
  return () => {
    localStorage.setItem(
      `xbrain:best:${gameId}`,
      JSON.stringify({ gameId, score, achievedAt: '2026-01-01T00:00:00.000Z' })
    );
  };
}

test.describe('Home — best scores', () => {
  test('shows best score badge when score exists', async ({ page }) => {
    await page.addInitScript(seedScore('card-flip', 42));
    await page.goto('/');
    const badge = page.getByTestId('best-score-card-flip');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Best: 42');
    await assertNoHorizontalScroll(page);
  });

  test('hides badge when no score exists', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await expect(page.getByTestId('best-score-card-flip')).not.toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('shows badges for multiple games simultaneously', async ({ page }) => {
    await page.addInitScript(() => {
      const entries: [string, number][] = [
        ['card-flip', 10],
        ['simon-says', 20],
        ['word-recall', 30],
      ];
      entries.forEach(([id, score]) => {
        localStorage.setItem(
          `xbrain:best:${id}`,
          JSON.stringify({ gameId: id, score, achievedAt: '2026-01-01T00:00:00.000Z' })
        );
      });
    });
    await page.goto('/');
    await expect(page.getByTestId('best-score-card-flip')).toHaveText('Best: 10');
    await expect(page.getByTestId('best-score-simon-says')).toHaveText('Best: 20');
    await expect(page.getByTestId('best-score-word-recall')).toHaveText('Best: 30');
    await assertNoHorizontalScroll(page);
  });

  test('shows all 7 badges when all games have scores', async ({ page }) => {
    await page.addInitScript(() => {
      const ids = [
        'card-flip',
        'simon-says',
        'number-sequence',
        'object-disappears',
        'word-recall',
        'pattern-copy',
        'position-grid',
      ];
      ids.forEach((id, i) => {
        localStorage.setItem(
          `xbrain:best:${id}`,
          JSON.stringify({ gameId: id, score: (i + 1) * 5, achievedAt: '2026-01-01T00:00:00.000Z' })
        );
      });
    });
    await page.goto('/');
    await expect(page.getByTestId('best-score-card-flip')).toBeVisible();
    await expect(page.getByTestId('best-score-position-grid')).toBeVisible();
    await expect(page.locator('[data-testid^="best-score-"]')).toHaveCount(7);
    await assertNoHorizontalScroll(page);
  });
});
