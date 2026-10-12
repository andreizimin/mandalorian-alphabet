import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { firstWord, isPhone, start } from './helpers';

const fixture = readFileSync(new URL('./fixtures/feedback-widget.js', import.meta.url), 'utf8');

const feedbackButton = (page: Page) => page.getByRole('button', { name: 'Feedback', exact: true });

// @spec LAYOUT-016
test('shows Feedback inline among the reader controls, styled like them', async ({ page }, info) => {
  await start(page, { feedbackWidget: fixture });
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

  if (isPhone(info)) {
    const title = (await page.locator('.passage-title').boundingBox())!;
    expect(Math.abs(box.y + box.height / 2 - (title.y + title.height / 2))).toBeLessThanOrEqual(12);
    expect(box.x).toBeGreaterThan(title.x);
  } else {
    await expect(page.getByRole('navigation', { name: 'Reader controls' }).getByRole('button', { name: 'Feedback' })).toBeVisible();
    const library = page.getByRole('button', { name: 'Library' });
    const libraryStyle = await library.evaluate((el) => {
      const s = getComputedStyle(el);
      return { height: el.getBoundingClientRect().height, radius: s.borderRadius, border: s.borderTopWidth };
    });
    expect(style).toMatchObject({ height: libraryStyle.height, radius: libraryStyle.radius, border: libraryStyle.border });
  }
});

// @spec FEED-002, FEED-004
test('opens the shared form, and arrow keys typed in it never turn the page', async ({ page }, info) => {
  test.skip(isPhone(info), 'arrow keys are a laptop and iPad input');
  await start(page, { feedbackWidget: fixture });
  const opening = await firstWord(page);

  await feedbackButton(page).click();
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
test('ignores taps on the feedback form, even near the screen edges', async ({ page }) => {
  await start(page, { feedbackWidget: fixture });
  const opening = await firstWord(page);

  await feedbackButton(page).click();
  await expect.poll(() => page.evaluate(() => window.FeedbackWidget?.isOpen())).toBe(true);
  const viewport = page.viewportSize()!;
  await page.mouse.click(viewport.width * 0.97, viewport.height / 2);
  expect(await firstWord(page)).toBe(opening);
});

// @spec FEED-003
test('shows Feedback disabled with a reason when the widget cannot load', async ({ page }) => {
  await start(page);
  await expect(feedbackButton(page)).toBeDisabled();
  await expect(page.getByText('Feedback needs a connection').filter({ visible: true })).toHaveCount(1);
});
