import { readFileSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from './test';
import { firstWord, isPhone, openMenu, start } from './helpers';

const fixture = readFileSync(new URL('./fixtures/feedback-widget.js', import.meta.url), 'utf8');
const staleWidget = readFileSync(new URL('./fixtures/feedback-widget-1.0.0.js', import.meta.url), 'utf8');

const feedbackButton = (page: Page) => page.getByRole('button', { name: 'Feedback', exact: true });

/** The Feedback key: on the title line on phones, in the menu on wider screens (LAYOUT-016). */
async function reachFeedback(page: Page, info: TestInfo) {
  if (!isPhone(info)) await openMenu(page);
  return feedbackButton(page);
}

// @spec LAYOUT-016
test('shows Feedback inline among the reader controls, styled like them', async ({ page }, info) => {
  await start(page, { feedbackWidget: fixture });
  if (!isPhone(info)) {
    // Wider screens: not in the top bar, but in the menu, styled like the keys beside it.
    await expect(page.getByRole('navigation', { name: 'Reader controls' }).getByRole('button', { name: 'Feedback' })).toHaveCount(0);
    await openMenu(page);
    const sheet = page.getByRole('dialog', { name: 'Menu' });
    const key = sheet.getByRole('button', { name: 'Feedback', exact: true });
    await expect(key).toBeEnabled();
    const look = (el: Element) => {
      const s = getComputedStyle(el);
      return { height: el.getBoundingClientRect().height, radius: s.borderRadius, border: s.borderTopWidth, family: s.fontFamily };
    };
    expect(await key.evaluate(look)).toEqual(await sheet.getByRole('button', { name: 'Suggest a feature' }).evaluate(look));
    expect((await key.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    return;
  }

  const button = feedbackButton(page);
  await expect(button).toBeEnabled();

  const style = await button.evaluate((el) => {
    const own = getComputedStyle(el);
    const fixedAncestor = (() => {
      for (let n: Element | null = el; n; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true;
      return false;
    })();
    return { fixedAncestor, height: el.getBoundingClientRect().height, radius: own.borderRadius, border: own.borderTopWidth };
  });
  expect(style.fixedAncestor).toBe(false);
  expect(style.height).toBeGreaterThanOrEqual(44);

  const box = (await button.boundingBox())!;
  const pageTop = (await page.locator('.page-area').boundingBox())!.y;
  expect(box.y + box.height).toBeLessThanOrEqual(pageTop);

  const title = (await page.locator('.passage-title').boundingBox())!;
  expect(Math.abs(box.y + box.height / 2 - (title.y + title.height / 2))).toBeLessThanOrEqual(12);
  expect(box.x).toBeGreaterThan(title.x);
});

// @spec FEED-002, FEED-004
test('opens the shared form, and arrow keys typed in it never turn the page', async ({ page }, info) => {
  test.skip(isPhone(info), 'arrow keys are a laptop and iPad input');
  await start(page, { feedbackWidget: fixture });
  const opening = await firstWord(page);

  await (await reachFeedback(page, info)).click();
  await expect.poll(() => page.evaluate(() => window.FeedbackWidget?.isOpen())).toBe(true);
  await page.keyboard.type('the page should stay put');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  expect(await firstWord(page)).toBe(opening);

  await page.evaluate(() => window.FeedbackWidget?.close());
  await page.locator('.page-area').click({ position: { x: 5, y: 5 } }); // move focus back to the page
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => firstWord(page)).not.toBe(opening);
});

// @spec FEED-004
test('ignores taps on the feedback form, even near the screen edges', async ({ page }, info) => {
  await start(page, { feedbackWidget: fixture });
  const opening = await firstWord(page);

  await (await reachFeedback(page, info)).click();
  await expect.poll(() => page.evaluate(() => window.FeedbackWidget?.isOpen())).toBe(true);
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width * 0.97, viewport.height / 2);
  expect(await firstWord(page)).toBe(opening);
});

// @spec FEED-003
test('shows Feedback disabled with a reason when the widget cannot load', async ({ page }, info) => {
  await start(page);
  await expect(await reachFeedback(page, info)).toBeDisabled();
  await expect(page.getByText('Feedback needs a connection').filter({ visible: true })).toHaveCount(1);
});

// @spec FEED-005
test('hides a stale 1.0.0 widget and explains the disabled button', async ({ page }, info) => {
  await start(page, { feedbackWidget: staleWidget });
  await expect(page.locator('#feedback-widget-host')).toBeHidden();
  await expect(await reachFeedback(page, info)).toBeDisabled();
  await expect(page.getByText('Feedback is unavailable right now').filter({ visible: true })).toHaveCount(1);
});
