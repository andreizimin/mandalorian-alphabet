import { expect, test, type Page } from '@playwright/test';
import { firstWord, passIntro, reach, start } from './helpers';

const terminal = (page: Page) => page.locator('.terminal');
const letsGo = (page: Page) => page.getByRole('button', { name: "Let's go" });

async function openFresh(page: Page) {
  await page.route('https://feedback.andreizimin.com/**', (route) => route.abort());
  await page.goto('/');
}

// @spec PROG-014, INTRO-001, INTRO-002
test('the first open lands on the terminal, which greets in glyphs and then in English', async ({ page }) => {
  await openFresh(page);
  await expect(terminal(page)).toBeVisible();
  await expect(page.locator('.page-area')).toHaveCount(0);

  const greeting = page.locator('.intro-greeting');
  const glyph = greeting.locator('.g').first();
  await expect(glyph).toBeVisible();
  expect(await glyph.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Mando/);
  await expect(letsGo(page)).toHaveCount(0);

  await expect(greeting.locator('.g')).toHaveCount(0, { timeout: 10_000 });
  await expect(greeting).toHaveText('Hello, adventurer!');
});

// @spec INTRO-003, INTRO-004, INTRO-005
test("a tap finishes the typing; Let's go opens the first passage, and a reload opens the reader", async ({ page }) => {
  await openFresh(page);
  await terminal(page).click({ position: { x: 12, y: 12 } });

  await expect(letsGo(page)).toBeVisible();
  await expect(terminal(page)).toContainText("don't read Mando'a yet");
  await expect(terminal(page)).toContainText('Next letter');

  await letsGo(page).click();
  await expect(page.locator('.page-area p').first()).toBeVisible();
  await expect(page.locator('.passage-title')).toContainText(/Call of the Wild/);

  await page.reload();
  await expect(page.locator('.page-area p').first()).toBeVisible();
  await expect(terminal(page)).toHaveCount(0);
});

// @spec INTRO-007
test('shows the whole text at once under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openFresh(page);
  await expect(letsGo(page)).toBeVisible();
  await expect(page.locator('.intro-greeting')).toHaveText('Hello, adventurer!');
  await expect(page.locator('.intro-greeting .g')).toHaveCount(0);
});

// @spec INTRO-008
test('replays from the library and comes back to the same page', async ({ page }, info) => {
  await start(page);
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('button', { name: 'Next page' }).click();
  const word = await firstWord(page);

  await reach(page, info);
  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByRole('button', { name: 'Replay intro' }).click();
  await expect(terminal(page)).toBeVisible();

  await passIntro(page);
  await expect.poll(() => firstWord(page)).toBe(word);
});
