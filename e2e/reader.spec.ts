import { expect, test } from '@playwright/test';
import { firstWord, learn, start } from './helpers';

test.beforeEach(async ({ page }) => start(page));

// @spec READ-004, READ-010
test('a peek shows the whole word in English right under the word, within the screen', async ({ page }) => {
  await learn(page, 1); // e
  const opening = await firstWord(page);

  // A glyph in the last word with glyphs on the first line of text, near the right edge.
  const target = page.locator('.page-area [role="img"]').first();
  const word = (await target.getAttribute('aria-label'))!;
  const glyph = target.locator('.g').first();
  await glyph.click();

  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveText(word);
  await expect(tooltip.locator('.peek-letter').first()).toHaveText(/e/i);

  const wordBox = (await target.boundingBox())!;
  const box = (await tooltip.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y).toBeGreaterThanOrEqual(wordBox.y + wordBox.height - 1);
  expect(box.y).toBeLessThanOrEqual(wordBox.y + wordBox.height + 12);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);

  // The reading font, not glyphs, and the page itself did not move.
  const font = await tooltip.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).not.toMatch(/Mando/);
  expect(await firstWord(page)).toBe(opening);
});

// @spec READ-010
test('a peek on the last line stays within the page area: below the word when it fits, above when it does not', async ({ page }) => {
  await learn(page, 1); // e
  const last = page.locator('.page-area [role="img"]').last();
  const wordBox = (await last.boundingBox())!;
  const areaBox = (await page.locator('.page-area').boundingBox())!;

  await last.locator('.g').first().click();
  const box = (await page.getByRole('tooltip').boundingBox())!;

  const wordBottom = wordBox.y + wordBox.height;
  const fitsBelow = wordBottom + 6 + box.height <= areaBox.y + areaBox.height;
  if (fitsBelow) {
    expect(box.y).toBeGreaterThanOrEqual(wordBottom - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(areaBox.y + areaBox.height + 1);
  } else {
    expect(box.y + box.height).toBeLessThanOrEqual(wordBox.y + 1);
  }
});
