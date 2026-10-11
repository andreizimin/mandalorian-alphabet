import { expect, test } from '@playwright/test';
import { learn, start } from './helpers';

// Runs in Chromium only: Playwright's WebKit build does not run service workers.

async function goOffline(page: import('@playwright/test').Page) {
  await start(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await page.context().setOffline(true);
  await page.reload();
}

// @spec OFF-001
test('opens and shows the bundled passage with no network', async ({ page }) => {
  await goOffline(page);
  await expect(page.locator('.page-area p').first()).toContainText('Buck');
  await expect(page.locator('.font-status')).toHaveCount(0);
});

// @spec OFF-003
test('runs a whole quiz with no network', async ({ page }) => {
  await goOffline(page);
  await learn(page, 2);
  await page.getByRole('button', { name: 'Quiz', exact: true }).click();
  for (let i = 0; i < 10; i++) {
    await page.locator('.choice-grid .choice').first().click();
    await page.getByRole('button', { name: /^(Next|See results)$/ }).click();
  }
  await expect(page.getByText(/You got \d+ of 10/)).toBeVisible();
});

// @spec OFF-002, OFF-005
test('serves the manifest and icons the app links to', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: 'Learn Mandalorian', short_name: 'Mando', display: 'standalone' });
  for (const icon of manifest.icons) expect((await request.get(`/${icon.src}`)).ok()).toBe(true);
  expect((await request.get('/icons/apple-touch-icon.png')).ok()).toBe(true);
});
