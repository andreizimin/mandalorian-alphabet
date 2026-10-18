import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { firstWord, isPhone, learn, pageText, reach, savedWord, start, swipe } from './helpers';

const firstPassage: { paragraphs: string[] } = JSON.parse(
  readFileSync(new URL('../src/content/bundled/call-of-the-wild.json', import.meta.url), 'utf8'),
);
const passageWords = firstPassage.paragraphs.join(' ').split(/\s+/);

test.beforeEach(async ({ page }) => start(page));

// @spec LAYOUT-001
test('caps the reading column at about 65 characters', async ({ page }) => {
  const ratio = await page.evaluate(() => {
    const area = document.querySelector('.page-area') as HTMLElement;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:65ch';
    probe.style.font = getComputedStyle(area.querySelector('p')!).font;
    area.append(probe);
    return area.clientWidth / probe.offsetWidth;
  });
  expect(ratio).toBeLessThanOrEqual(1.05);
});

// @spec LAYOUT-002
test('phones: bottom bar with arrows, Next letter, Quiz and menu; the rest in the menu', async ({ page }, info) => {
  test.skip(!isPhone(info), 'phone layout');
  await expect(page.getByRole('navigation', { name: 'Reader controls' })).toBeHidden();
  const bottom = page.getByRole('navigation', { name: 'Page turning' });
  for (const name of ['Previous page', 'Next letter', 'Quiz', 'Menu', 'Next page']) {
    await expect(bottom.getByRole('button', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Step back' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Menu' }).click();
  const sheet = page.getByRole('dialog', { name: 'Menu' });
  for (const name of ['Step back', 'Reset', 'Legend', 'Library', 'Larger text']) {
    await expect(sheet.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible();
  }
});

// @spec LAYOUT-003
test('wider screens: every control in the top bar, only arrows at the bottom', async ({ page }, info) => {
  test.skip(isPhone(info), 'wide layout');
  const top = page.getByRole('navigation', { name: 'Reader controls' });
  for (const name of ['Next letter', 'Quiz', 'Step back', 'Reset', 'Legend', 'Library', 'Larger text']) {
    await expect(top.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  await expect(page.getByRole('navigation', { name: 'Page turning' }).getByRole('button')).toHaveCount(2);
});

// @spec LAYOUT-004
test('makes every visible control at least 44 by 44', async ({ page }, info) => {
  await reach(page, info);
  const small = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter((b) => b.offsetParent !== null)
      .map((b) => ({ name: b.getAttribute('aria-label') ?? b.textContent, ...b.getBoundingClientRect().toJSON() }))
      .filter((r) => r.width < 44 || r.height < 44),
  );
  expect(small).toEqual([]);
});

// @spec LAYOUT-005
test('follows the system light or dark appearance and pads for the safe area', async ({ page }) => {
  const luminance = () =>
    page.evaluate(() => {
      const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g)!.map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await luminance()).toBeLessThan(0.2);
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await luminance()).toBeGreaterThan(0.8);

  const padding = await page
    .getByRole('navigation', { name: 'Page turning' })
    .evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
  expect(padding).toBeGreaterThanOrEqual(12);
});

// @spec LAYOUT-021, LAYOUT-022
test('draws the console: monospace square keys, a framed panel, a status line, and a serif passage', async ({ page }, info) => {
  await reach(page, info);
  const keys = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter((b) => b.offsetParent !== null)
      .map((b) => {
        const s = getComputedStyle(b);
        return { family: s.fontFamily, radius: parseFloat(s.borderTopLeftRadius), transform: s.textTransform, border: s.borderTopStyle };
      }),
  );
  expect(keys.length).toBeGreaterThan(3);
  for (const key of keys) {
    expect(key.family).toMatch(/mono|Menlo|Consolas|Courier/i);
    expect(key.radius).toBeLessThanOrEqual(2);
    expect(key.transform).toBe('uppercase');
    expect(key.border).toBe('solid');
  }

  const frame = await page.locator('main.reader').evaluate((el) => {
    const s = getComputedStyle(el);
    return { left: s.borderLeftStyle, width: parseFloat(s.borderLeftWidth), panel: s.backgroundColor, body: getComputedStyle(document.body).backgroundColor };
  });
  expect(frame.left).toBe('solid');
  expect(frame.width).toBeGreaterThanOrEqual(1);
  expect(frame.panel).not.toBe(frame.body);

  const status = await page.locator('.passage-title').evaluate((el) => {
    const s = getComputedStyle(el);
    return { family: s.fontFamily, transform: s.textTransform, cursor: el.querySelector('.cursor') !== null };
  });
  expect(status.family).toMatch(/mono|Menlo|Consolas|Courier/i);
  expect(status.transform).toBe('uppercase');
  expect(status.cursor).toBe(true);

  const passageFont = await page.locator('.page-area p').first().evaluate((p) => getComputedStyle(p).fontFamily);
  expect(passageFont).toMatch(/Georgia|serif/i);
  expect(passageFont).not.toMatch(/mono/i);
});

// @spec LAYOUT-017, LAYOUT-005
test('lets the learner choose Light or Dark over the system appearance, and remembers it', async ({ page }, info) => {
  const luminance = () =>
    page.evaluate(() => {
      const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g)!.map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
  const appearance = () => page.getByRole('button', { name: /^Appearance/ });

  await page.emulateMedia({ colorScheme: 'light' });
  await reach(page, info);
  await expect(appearance()).toHaveText('Auto');
  await appearance().click(); // Light
  await expect(appearance()).toHaveText('Light');
  await appearance().click(); // Dark
  await expect(appearance()).toHaveText('Dark');
  expect(await luminance()).toBeLessThan(0.2);

  // A forced appearance ignores the system's.
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await luminance()).toBeLessThan(0.2);

  // The choice survives a reload.
  await page.reload();
  await expect(page.locator('.page-area p').first()).toBeVisible();
  expect(await luminance()).toBeLessThan(0.2);

  // Light over a dark system; Auto follows the system again.
  await page.emulateMedia({ colorScheme: 'dark' });
  await reach(page, info);
  await appearance().click(); // Auto
  await expect(appearance()).toHaveText('Auto');
  expect(await luminance()).toBeLessThan(0.2);
  await appearance().click(); // Light
  expect(await luminance()).toBeGreaterThan(0.8);
});

// @spec LAYOUT-006, TEXT-004
test('changes text size for both fonts and keeps the learner on their word', async ({ page }, info) => {
  await learn(page, 1);
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('button', { name: 'Next page' }).click();
  const word = await savedWord(page);
  await expect.poll(() => pageText(page)).toContain(word);
  const size = () => page.locator('.page-area p').first().evaluate((p) => parseFloat(getComputedStyle(p).fontSize));
  expect(await size()).toBe(20);

  await reach(page, info);
  await page.getByRole('button', { name: 'Larger text' }).click();

  await expect.poll(size).toBe(22);
  const glyphSize = await page.locator('.page-area .g').first().evaluate((g) => parseFloat(getComputedStyle(g).fontSize));
  expect(glyphSize).toBe(22);
  // Pages are re-cut after the new size lays out, a moment after the font size changes.
  await expect.poll(() => pageText(page)).toContain(word);
});

// @spec LAYOUT-007
test('turns pages by swipe and by tapping the edge zones', async ({ page }) => {
  const opening = await firstWord(page);

  await swipe(page, -160);
  await expect.poll(() => firstWord(page)).not.toBe(opening);
  await swipe(page, 160);
  await expect.poll(() => firstWord(page)).toBe(opening);

  const box = (await page.locator('.page-area').boundingBox())!;
  const y = box.y + box.height / 2;
  const viewport = page.viewportSize()!;
  await page.mouse.click(box.x + box.width / 2, y);
  expect(await firstWord(page)).toBe(opening);

  await page.mouse.click(viewport.width * 0.97, y);
  await expect.poll(() => firstWord(page)).not.toBe(opening);
  await page.mouse.click(viewport.width * 0.03, y);
  await expect.poll(() => firstWord(page)).toBe(opening);
});

// @spec LAYOUT-008, LAYOUT-009, LAYOUT-010
test('opens the quiz full screen with a 2 by 2 grid placed for the width', async ({ page }, info) => {
  await learn(page, 2);
  await page.getByRole('button', { name: 'Quiz', exact: true }).click();

  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  await expect(page.locator('.page-area')).toHaveCount(0);
  const grid = (await page.locator('.choice-grid').boundingBox())!;
  const choices = await page.locator('.choice-grid .choice').evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect().toJSON()),
  );
  expect(new Set(choices.map((c) => Math.round(c.top))).size).toBe(2);
  expect(new Set(choices.map((c) => Math.round(c.left))).size).toBe(2);

  if (isPhone(info)) {
    expect(grid.y).toBeGreaterThanOrEqual(page.viewportSize()!.height / 2);
  } else {
    const prompt = (await page.locator('.quiz-prompt').boundingBox())!;
    expect(Math.abs(grid.x + grid.width / 2 - (prompt.x + prompt.width / 2))).toBeLessThanOrEqual(2);
    expect(grid.y).toBeGreaterThan(prompt.y);
  }
});

// @spec LAYOUT-011
test('opens the library from the reader controls', async ({ page }, info) => {
  await reach(page, info);
  await page.getByRole('button', { name: 'Library' }).click();
  await expect(page.getByRole('list', { name: 'Passages' })).toBeVisible();
});

// @spec PROG-007
test('shows the legend from the reader controls', async ({ page }, info) => {
  await learn(page, 2);
  await reach(page, info);
  await page.getByRole('button', { name: /^Legend/ }).click();
  await expect(page.locator('.legend .legend-latin')).toHaveText(['E', 'T']);
});

// @spec TEXT-003
test('fills real pages without overflow, covering every word in order', async ({ page }) => {
  const seen: string[] = [];
  for (let i = 0; i < 5; i++) {
    const overflow = await page
      .locator('.page-area')
      .evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(overflow).toBeLessThanOrEqual(1);
    seen.push(...(await pageText(page)).trim().split(/\s+/));
    await page.getByRole('button', { name: 'Next page' }).click();
  }
  expect(seen).toEqual(passageWords.slice(0, seen.length));
});

// @spec TEXT-004
test('keeps the learner on their word when the window resizes', async ({ page }, info) => {
  test.skip(isPhone(info), 'resize on wide viewports');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next page' }).click();
  const word = await savedWord(page);
  await expect.poll(() => pageText(page)).toContain(word);

  await page.setViewportSize({ width: 700, height: 700 });

  await expect.poll(() => pageText(page)).toContain(word);
});

// @spec READ-008, LAYOUT-015
test('highlights the newest letter in a readable accent color, light and dark, without breaking pages', async ({ page }) => {
  await learn(page, 2); // e, then t: t is newest
  const newest = page.locator('.page-area .g.g-new');
  await expect(newest.first()).toBeVisible();
  expect(new Set((await newest.allInnerTexts()).map((t) => t.toLowerCase()))).toEqual(new Set(['t']));

  const contrast = () =>
    page.evaluate(() => {
      const rgb = (c: string) => c.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const lum = ([r, g, b]: number[]) =>
        [r, g, b]
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const newestColor = getComputedStyle(document.querySelector('.page-area .g.g-new')!).color;
      const otherColor = getComputedStyle(document.querySelector('.page-area .g:not(.g-new)')!).color;
      // The passage sits on the console panel, not the page behind it.
      const bg = getComputedStyle(document.querySelector('main.reader')!).backgroundColor;
      const ratio = (color: string) => {
        const [a, b] = [lum(rgb(color)), lum(rgb(bg))].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
      };
      return { differs: newestColor !== otherColor, newest: ratio(newestColor), text: ratio(otherColor) };
    });

  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    const { differs, newest, text } = await contrast();
    expect(differs).toBe(true);
    expect(newest).toBeGreaterThanOrEqual(4.5);
    expect(text).toBeGreaterThanOrEqual(4.5);
  }

  // Pages re-fit when the header changes height (for example when the readiness hint appears),
  // so wait for layout to settle before measuring.
  const overflow = () => page.locator('.page-area').evaluate((el) => el.scrollHeight - el.clientHeight);
  for (let i = 0; i < 3; i++) {
    await expect.poll(overflow).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: 'Next page' }).click();
  }
});
