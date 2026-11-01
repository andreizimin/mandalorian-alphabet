import { expect, test, type Page } from './test';
import { firstWord, isPhone, passIntro, start } from './helpers';

const helpKey = (page: Page) => page.getByRole('button', { name: 'Help', exact: true });
const panel = (page: Page) => page.getByRole('dialog', { name: 'Help' });

// @spec LAYOUT-003, LAYOUT-016, LAYOUT-004
test('shows Help inline among the reader controls, the phone title still readable', async ({ page }, info) => {
  await start(page);
  const key = helpKey(page);
  await expect(key).toBeVisible();

  const box = (await key.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  const pageTop = (await page.locator('.page-area').boundingBox())!.y;
  expect(box.y + box.height).toBeLessThanOrEqual(pageTop);

  if (isPhone(info)) {
    const line = (await page.locator('.title-line').boundingBox())!;
    const title = (await page.locator('.passage-title').boundingBox())!;
    const feedback = (await page.getByRole('button', { name: 'Feedback', exact: true }).boundingBox())!;
    expect(Math.abs(box.y + box.height / 2 - (title.y + title.height / 2))).toBeLessThanOrEqual(12);
    expect(box.x).toBeGreaterThan(title.x + title.width - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(feedback.x + 1);
    expect(title.width).toBeGreaterThanOrEqual(line.width * 0.4 - 1);
  } else {
    await expect(page.getByRole('navigation', { name: 'Reader controls' }).getByRole('button', { name: 'Help' })).toBeVisible();
  }
});

// @spec HELP-001, HELP-002
test('opens over the page and closes back to the same page', async ({ page }) => {
  await start(page);
  const opening = await firstWord(page);

  await helpKey(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page)).toContainText('one letter at a time');
  await expect(panel(page)).toContainText('Next letter');
  await panel(page).getByRole('button', { name: 'Close' }).click();
  await expect(panel(page)).toHaveCount(0);
  expect(await firstWord(page)).toBe(opening);

  await helpKey(page).click();
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);

  await helpKey(page).click();
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width * 0.03, viewport.height / 2);
  await expect(panel(page)).toHaveCount(0);
  expect(await firstWord(page)).toBe(opening);
});

// @spec HELP-003
test('ignores page-turn keys and edge taps while open', async ({ page }) => {
  await start(page);
  const opening = await firstWord(page);

  await helpKey(page).click();
  await page.keyboard.press('ArrowRight');
  await expect(panel(page)).toBeVisible();
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width * 0.97, viewport.height / 2); // closes the panel, nothing more
  await expect(panel(page)).toHaveCount(0);
  expect(await firstWord(page)).toBe(opening);
});

// @spec HELP-004
test('replays the intro and comes back to the same page', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Next page' }).click();
  const word = await firstWord(page);

  await helpKey(page).click();
  await panel(page).getByRole('button', { name: 'Replay intro' }).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(page.locator('.terminal')).toBeVisible();

  await passIntro(page);
  await expect.poll(() => firstWord(page)).toBe(word);
});

// @spec HELP-005
test('fits a short phone screen by scrolling within itself, Close always reachable', async ({ page }, info) => {
  test.skip(!isPhone(info), 'the short-screen case is a phone in landscape');
  await page.setViewportSize({ width: 418, height: 401 });
  await start(page);
  await helpKey(page).click();

  const box = (await panel(page).boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(401);
  const scroll = await panel(page).evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
  expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight);

  await panel(page).evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect(panel(page).getByRole('button', { name: 'Close' })).toBeInViewport();
  await panel(page).getByRole('button', { name: 'Close' }).click();
  await expect(panel(page)).toHaveCount(0);
});
