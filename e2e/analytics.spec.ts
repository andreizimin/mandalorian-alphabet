import { readFileSync } from 'node:fs';
import { learn, passIntro, reach } from './helpers';
import { expect, test, type Page } from './test';

const widget = readFileSync(new URL('./fixtures/feedback-widget.js', import.meta.url), 'utf8');

// Every test installs a stand-in tracker before the app loads and reads back what the
// app reported; the real tracker is blocked by the shared `test`, and the feedback
// widget is the stand-in from the fixtures, so no test can file a real ticket.
type Call = [string, Record<string, number> | undefined];
const reported = (page: Page) => page.evaluate(() => (window as unknown as { __events: Call[] }).__events);
const names = async (page: Page) => (await reported(page)).map(([name]) => name);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __events: Call[]; umami: { track: (name: string, data?: Record<string, number>) => void } };
    w.__events = [];
    w.umami = { track: (name, data) => w.__events.push([name, data]) };
  });
  await page.route('https://feedback.andreizimin.com/**', (route) =>
    new URL(route.request().url()).pathname === '/widget.js'
      ? route.fulfill({ contentType: 'text/javascript', body: widget })
      : route.abort(),
  );
  await page.goto('/');
});

// @spec ANA-003
test('reports the intro done once Let’s go is tapped', async ({ page }) => {
  expect(await names(page)).toEqual([]);
  await passIntro(page);
  expect(await names(page)).toEqual(['mando_intro_done']);
});

// @spec ANA-004
test('reports each letter advance with the letters learned', async ({ page }) => {
  await passIntro(page);
  await learn(page, 2);
  expect((await reported(page)).filter(([name]) => name === 'mando_letter_advance')).toEqual([
    ['mando_letter_advance', { learned: 1 }],
    ['mando_letter_advance', { learned: 2 }],
  ]);
});

// @spec ANA-005
test('reports a page read once per new page, not when re-reading', async ({ page }) => {
  await passIntro(page);
  await learn(page, 1);
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('button', { name: 'Previous page' }).click();
  await page.getByRole('button', { name: 'Next page' }).click();
  expect((await reported(page)).filter(([name]) => name === 'mando_page_read')).toEqual([['mando_page_read', { learned: 1 }]]);
});

// @spec FEED-006, ANA-007, LAYOUT-002, LAYOUT-003
test('Suggest a feature opens the shared feedback form and reports the tap', async ({ page }, info) => {
  await passIntro(page);
  await reach(page, info);
  const key = page.getByRole('button', { name: 'Suggest a feature' });
  await expect(key).toBeEnabled();
  await key.click();
  await expect.poll(() => page.evaluate(() => window.FeedbackWidget?.isOpen())).toBe(true);
  expect(await names(page)).toContain('mando_suggest_feature_click');
});

// @spec ANA-008
test('sends counts only and sets no cookie', async ({ page }) => {
  await passIntro(page);
  await learn(page, 2);
  await page.getByRole('button', { name: 'Next page' }).click();
  const calls = await reported(page);
  expect(calls.length).toBeGreaterThan(2);
  for (const [name, data] of calls) {
    expect(name).toMatch(/^mando_[a-z_]+$/);
    for (const value of Object.values(data ?? {})) expect(typeof value).toBe('number');
  }
  expect(await page.context().cookies()).toEqual([]);
});
