import { expect, test, type Page } from './test';
import { readFileSync } from 'node:fs';
import { firstWord, isPhone, learn, openMenu, pageText, passIntro, reach, savedWord, start } from './helpers';

const fixture = readFileSync(new URL('./fixtures/feedback-widget.js', import.meta.url), 'utf8');

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

// @spec HELP-002
test('keeps the learner on their word when the pages are recut while Help is open', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('button', { name: 'Next page' }).click();
  const word = await savedWord(page);

  await helpKey(page).click();
  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width }); // rotate
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect.poll(() => pageText(page)).toContain(word);
});

// @spec HELP-003, HELP-008
test('a tap outside only closes Help, even over a control or a page-turn button', async ({ page }) => {
  await start(page);
  const opening = await firstWord(page);

  for (const name of ['Next page', 'Previous page', 'Library', 'Menu', 'Next letter', 'Feedback']) {
    const target = page.getByRole('button', { name, exact: true });
    if ((await target.count()) === 0 || !(await target.first().isVisible())) continue;
    await helpKey(page).click();
    const box = (await target.first().boundingBox())!;
    const card = (await panel(page).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) {
      await page.keyboard.press('Escape'); // covered by the card itself: not a tap outside
      continue;
    }
    await page.mouse.click(x, y);
    await expect(panel(page)).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.library')).toHaveCount(0);
    expect(await firstWord(page)).toBe(opening);
  }

  // On a phone the card fills the screen, but the margin beside it is still an edge zone.
  await helpKey(page).click();
  const viewport = page.viewportSize()!;
  await page.mouse.click(3, viewport.height / 2);
  await expect(panel(page)).toHaveCount(0);
  expect(await firstWord(page)).toBe(opening);
});

// @spec HELP-005
test('keeps Close in view at every scroll position on a short phone screen', async ({ page }, info) => {
  test.skip(!isPhone(info), 'the short-screen case is a phone in landscape');
  await page.setViewportSize({ width: 418, height: 401 });
  await start(page);
  await helpKey(page).click();
  const close = panel(page).getByRole('button', { name: 'Close' });
  for (const fraction of [0.25, 0.5, 0.75, 1]) {
    await panel(page).evaluate((el, f) => el.scrollTo(0, (el.scrollHeight - el.clientHeight) * f), fraction);
    await expect(close).toBeInViewport({ ratio: 1 });
  }
});

// @spec HELP-006, HELP-007
test('moves focus into Help, keeps Tab inside it, and gives focus back to the Help key', async ({ page }) => {
  await start(page);
  await helpKey(page).click();
  await expect(panel(page).getByRole('button', { name: 'Close' })).toBeFocused();
  await expect(panel(page)).toHaveAttribute('aria-modal', 'true');
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    expect(await panel(page).evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(helpKey(page)).toBeFocused();
});

// @spec HELP-006
test('gives focus to the Help key on screen when the width crossed 600 px while Help was open', async ({ page }, info) => {
  test.skip(isPhone(info), 'starts wide and narrows');
  await start(page);
  await helpKey(page).click();
  await page.setViewportSize({ width: 420, height: 800 });
  await page.keyboard.press('Escape');
  await expect(helpKey(page)).toBeFocused();
  await expect(helpKey(page)).toBeVisible();
});

// @spec HELP-012
test('Replay intro from Help moves focus to the intro terminal', async ({ page }) => {
  await start(page);
  await helpKey(page).click();
  await panel(page).getByRole('button', { name: 'Replay intro' }).click();
  await expect(page.locator('.terminal')).toBeFocused();
});

// @spec HELP-009
test('offers Help from the reader only', async ({ page }, info) => {
  await start(page);
  await reach(page, info);
  await page.getByRole('button', { name: 'Library' }).click();
  await expect(page.getByRole('button', { name: 'Help', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: /back to reading/i }).click();
  await learn(page, 2);
  await page.getByRole('button', { name: /^quiz$/i }).first().click();
  await expect(page.getByRole('button', { name: 'Help', exact: true })).toHaveCount(0);
});

// @spec HELP-013
test('does nothing when the Help key is activated while the menu or the feedback form is open', async ({ page }, info) => {
  await start(page, { feedbackWidget: fixture });
  const activateHelp = () =>
    page.evaluate(() => {
      const keys = [...document.querySelectorAll<HTMLButtonElement>('button[aria-label="Help"]')];
      keys.find((key) => key.offsetParent !== null)!.click();
    });

  await openMenu(page);
  await activateHelp();
  await expect(panel(page)).toHaveCount(0);
  await page.keyboard.press('Escape'); // close the menu

  if (!isPhone(info)) await openMenu(page);
  await page.getByRole('button', { name: 'Feedback', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.FeedbackWidget?.isOpen())).toBe(true);
  await activateHelp();
  await expect(panel(page)).toHaveCount(0);
});

// @spec HELP-010
test('shows the note about the menu, naming where its key is at this width', async ({ page }, info) => {
  await start(page);
  await helpKey(page).click();
  const note = panel(page).getByText(/the ⋯ key/i).filter({ visible: true });
  await expect(note).toHaveCount(1);
  await expect(note).toContainText(isPhone(info) ? 'bottom bar' : 'top bar');
});
