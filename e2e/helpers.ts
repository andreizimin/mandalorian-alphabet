import { expect, type Page, type TestInfo } from '@playwright/test';

export const isPhone = (info: TestInfo) => info.project.name === 'iphone';

/**
 * Opens the app fresh and dismisses the welcome card. The real feedback domain is
 * never reached, so no test can file a real ticket: by default it is blocked, and
 * `feedbackWidget` serves a stand-in script in place of widget.js.
 */
export async function start(page: Page, { feedbackWidget }: { feedbackWidget?: string } = {}) {
  await page.route('https://feedback.andreizimin.com/**', (route) =>
    feedbackWidget && route.request().url().endsWith('/widget.js')
      ? route.fulfill({ contentType: 'text/javascript', body: feedbackWidget })
      : route.abort(),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Start reading' }).click();
  await expect(page.locator('.page-area p').first()).toBeVisible();
}

/** Opens the phone menu sheet when the control lives there. */
export async function reach(page: Page, info: TestInfo) {
  if (isPhone(info)) await page.getByRole('button', { name: 'Menu' }).click();
}

export async function learn(page: Page, count: number) {
  await expect(page.locator('.font-status')).toHaveCount(0);
  for (let i = 0; i < count; i++) {
    await page.getByRole('button', { name: 'Next letter' }).click();
    await page.getByRole('button', { name: 'Got it' }).click();
  }
}

export const pageText = (page: Page) => page.locator('.page-area .passage-page').innerText();

export async function firstWord(page: Page) {
  return (await pageText(page)).trim().split(/\s+/)[0];
}

/** A horizontal drag across the middle of the page, using pointer events like a finger. */
export async function swipe(page: Page, dx: number) {
  const box = (await page.locator('.page-area').boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 6 });
  await page.mouse.up();
}
