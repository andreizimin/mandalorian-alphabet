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

// @spec READ-011
test('highlighting text shows its English above the selection, and letting go removes it', async ({ page }) => {
  await learn(page, 2); // e, t
  const opening = await firstWord(page);
  const paragraph = page.locator('.page-area p').first();

  // Select the first line or so of the first paragraph, the way a drag would.
  const selected = await paragraph.evaluate((p) => {
    const range = document.createRange();
    range.setStart(p, 0);
    range.setEnd(p, Math.min(p.childNodes.length, 12));
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    return selection.toString();
  });
  expect(selected.length).toBeGreaterThan(3);

  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toHaveClass(/peek-selection/);
  await expect(tooltip).toHaveText(selected.trim());
  expect(await tooltip.evaluate((el) => getComputedStyle(el).fontFamily)).not.toMatch(/Mando/);

  const box = (await tooltip.boundingBox())!;
  const selectionTop = await paragraph.evaluate(() => document.getSelection()!.getRangeAt(0).getClientRects()[0].top);
  const areaBox = (await page.locator('.page-area').boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  if (selectionTop - areaBox.y >= box.height + 6) expect(box.y + box.height).toBeLessThanOrEqual(selectionTop + 1);
  expect(await firstWord(page)).toBe(opening);

  await page.evaluate(() => document.getSelection()!.removeAllRanges());
  await expect(tooltip).toHaveCount(0);
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
