import { expect, type Page, type TestInfo } from '@playwright/test';
import callOfTheWild from '../src/content/bundled/call-of-the-wild.json' with { type: 'json' };

export const isPhone = (info: TestInfo) => info.project.name === 'iphone';

/**
 * Opens the app fresh and goes through the intro terminal. The real feedback
 * domain is never reached, so no test can file a real ticket: by default it is
 * blocked, and `feedbackWidget` serves a stand-in script in place of widget.js.
 * `url` opens another address than the test server's root.
 */
export async function start(page: Page, { feedbackWidget, url = '/' }: { feedbackWidget?: string; url?: string } = {}) {
  await page.route('https://feedback.andreizimin.com/**', (route) =>
    feedbackWidget && new URL(route.request().url()).pathname === '/widget.js'
      ? route.fulfill({ contentType: 'text/javascript', body: feedbackWidget })
      : route.abort(),
  );
  await page.goto(url);
  await passIntro(page);
  await expect(page.locator('.page-area p').first()).toBeVisible();
}

/** Taps through the intro terminal's paragraphs (INTRO-005, INTRO-009) and taps Let's go (INTRO-004). */
export async function passIntro(page: Page) {
  const letsGo = page.getByRole('button', { name: "Let's go" });
  await expect(page.locator('.terminal')).toBeVisible();
  for (let i = 0; i < 20 && !(await letsGo.isVisible()); i++) {
    await page.locator('.terminal').click({ position: { x: 12, y: 12 } });
  }
  await letsGo.click();
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

/**
 * The word at the learner's saved position in the first bundled passage. Pages
 * can be re-cut in place (a hint appearing shrinks the reading area), so the
 * first word on screen is not always the saved position; this is.
 */
export async function savedWord(page: Page) {
  const position = await page.evaluate(() => {
    const content = JSON.parse(localStorage.getItem('script-ramp:v1:content') ?? '{}');
    return content.positions?.['call-of-the-wild'] ?? { paragraph: 0, word: 0 };
  });
  return callOfTheWild.paragraphs[position.paragraph].split(' ').filter(Boolean)[position.word];
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
