import { test, expect } from '@playwright/test';
import { assertNoHorizontalScroll } from './helpers/viewport';

test.describe('Settings — navigation from home', () => {
  test('settings button navigates to /settings', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('settings-button').click();
    await expect(page).toHaveURL('/settings');
    await assertNoHorizontalScroll(page);
  });
});

test.describe('Settings — happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('renders settings page with title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('sound toggle is visible with aria-pressed state', async ({ page }) => {
    const toggle = page.getByTestId('settings-sound-toggle');
    await expect(toggle).toBeVisible();
    const pressed = await toggle.getAttribute('aria-pressed');
    expect(['true', 'false']).toContain(pressed);
    await assertNoHorizontalScroll(page);
  });

  test('sound toggle flips state on click', async ({ page }) => {
    const toggle = page.getByTestId('settings-sound-toggle');
    const before = await toggle.getAttribute('aria-pressed');
    await toggle.click();
    const after = await toggle.getAttribute('aria-pressed');
    expect(after).not.toBe(before);
    await assertNoHorizontalScroll(page);
  });

  test('clear scores button shows inline confirmation', async ({ page }) => {
    await page.getByTestId('clear-scores-button').click();
    await expect(page.getByTestId('clear-scores-confirm')).toBeVisible();
    await expect(page.getByTestId('clear-scores-cancel')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('cancel dismisses confirmation and restores clear button', async ({ page }) => {
    await page.getByTestId('clear-scores-button').click();
    await page.getByTestId('clear-scores-cancel').click();
    await expect(page.getByTestId('clear-scores-button')).toBeVisible();
    await expect(page.getByTestId('clear-scores-confirm')).not.toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('confirm clears scores and shows feedback message', async ({ page }) => {
    await page.getByTestId('clear-scores-button').click();
    await page.getByTestId('clear-scores-confirm').click();
    await expect(page.getByTestId('scores-cleared-msg')).toBeVisible();
    await expect(page.getByTestId('clear-scores-button')).not.toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('privacy link navigates to /privacy', async ({ page }) => {
    await page.getByTestId('privacy-link').click();
    await expect(page).toHaveURL('/privacy');
    await assertNoHorizontalScroll(page);
  });

  test('back link returns to home', async ({ page }) => {
    await page.getByRole('link', { name: 'Go back' }).click();
    await expect(page).toHaveURL('/');
    await assertNoHorizontalScroll(page);
  });
});
