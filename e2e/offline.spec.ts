import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { learn, savedWord, start } from './helpers';

// Runs in Chromium only: Playwright's WebKit build does not run service workers.

async function goOffline(page: import('@playwright/test').Page) {
  await start(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await page.context().setOffline(true);
  await page.reload();
}

// @spec OFF-001
test('opens and shows the bundled passage with no network', async ({ page }) => {
  await goOffline(page);
  await expect(page.locator('.page-area p').first()).toContainText('Old longings nomadic leap');
  await expect(page.locator('.font-status')).toHaveCount(0);
});

// @spec OFF-003
test('runs a whole quiz with no network', async ({ page }) => {
  await goOffline(page);
  await learn(page, 2);
  await page.getByRole('button', { name: 'Quiz', exact: true }).click();
  for (let i = 0; i < 10; i++) {
    await page.locator('.choice-grid .choice').first().click();
    await page.getByRole('button', { name: /^(Next|See results)$/ }).click();
  }
  await expect(page.getByText(/You got \d+ of 10/)).toBeVisible();
});

// @spec OFF-002, OFF-005
test('serves the manifest and icons the app links to', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: 'Learn Mandalorian', short_name: 'Mando', display: 'standalone' });
  for (const icon of manifest.icons) expect((await request.get(`/${icon.src}`)).ok()).toBe(true);
  expect((await request.get('/icons/apple-touch-icon.png')).ok()).toBe(true);
});

// Updates: Playwright cannot intercept the browser's own fetch of the service
// worker file, so these tests serve a copy of the build from their own server
// and publish a new version by changing the copy's sw.js, as a deploy does.

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

// Registered before Workbox's own handlers, so it answers first: the page can
// tell which version controls it.
const NEW_VERSION_PREFIX = `self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).pathname === '/__version') event.respondWith(new Response('new'));
});
`;

async function versionServer() {
  const dir = mkdtempSync(join(tmpdir(), 'mando-update-'));
  cpSync('dist', dir, { recursive: true });
  let swDelayMs = 0;
  const server: Server = createServer(async (request, response) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname;
    let file = join(dir, path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html');
    if (path === '/sw.js' && swDelayMs) await new Promise((resolve) => setTimeout(resolve, swDelayMs));
    response.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    response.end(readFileSync(file));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/`,
    /** Deploys a new version; `delayMs` holds back the changed sw.js when the browser asks for it. */
    publishNewVersion(delayMs = 0) {
      swDelayMs = delayMs;
      const sw = join(dir, 'sw.js');
      writeFileSync(sw, NEW_VERSION_PREFIX + readFileSync(sw, 'utf8'));
    },
    close() {
      server.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

const newVersionInControl = (page: Page) =>
  page.evaluate(() =>
    fetch('/__version', { cache: 'no-store' })
      .then((r) => r.text())
      .then((t) => t === 'new'),
  );

/** Installs the current version from `url`, turns a page and returns the saved word and a load counter. */
async function installedWithAPageTurned(page: Page, url: string) {
  await start(page, { url });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await page.getByRole('button', { name: 'Next page' }).click();
  const word = await savedWord(page);
  let loads = 0;
  page.on('load', () => loads++);
  return { word, loads: () => loads };
}

test.describe('updates', () => {
  let site: Awaited<ReturnType<typeof versionServer>>;
  test.beforeEach(async () => {
    site = await versionServer();
  });
  test.afterEach(() => site.close());

  // @spec OFF-004, OFF-009
  test('reloads once into a new version found on opening, keeping the place', async ({ page }) => {
    const { word, loads } = await installedWithAPageTurned(page, site.url);
    site.publishNewVersion();
    await page.reload();
    // The opening itself, then one automatic reload into the new version.
    await expect.poll(loads, { timeout: 15_000 }).toBe(2);
    await expect.poll(() => newVersionInControl(page)).toBe(true);
    await expect(page.locator('.page-area .passage-page')).toContainText(word);
    await page.waitForTimeout(1_500);
    expect(loads()).toBe(2);
  });

  // @spec OFF-004, OFF-010
  test('keeps the page on screen when the new version arrives after an interaction', async ({ page }) => {
    const { word, loads } = await installedWithAPageTurned(page, site.url);
    site.publishNewVersion(2_000);
    await page.reload();
    await page.keyboard.press('Shift');
    await expect.poll(() => newVersionInControl(page), { timeout: 15_000 }).toBe(true);
    await page.waitForTimeout(1_500);
    expect(loads()).toBe(1);
    await expect(page.locator('.page-area .passage-page')).toContainText(word);
  });
});
