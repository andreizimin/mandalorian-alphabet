import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { passIntro } from './helpers';

// The live-site check: runs against a deployed address (LIVE_URL) after each
// deploy, never against the local preview server, which serves every file and
// so cannot show what the host actually publishes. LIVE_STAGE names the stage
// and LIVE_DIST the build that was deployed (default `dist`).

const stage = process.env.LIVE_STAGE ?? 'production';
const dist = process.env.LIVE_DIST ?? 'dist';
// CloudFront edges can serve the previous deploy for a short while after an
// invalidation, so content checks retry for up to this long.
const SETTLE_MS = 120_000;

function buildFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? buildFiles(path) : [relative(dist, path).split('\\').join('/')];
  });
}

test.describe.configure({ mode: 'serial' });

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

// A file the host lacks can come back as 200 with the app's page (the router's
// fallback), so each file is compared with the build byte for byte.
// @spec OFF-013, OFF-006
test('serves every file of the build', async ({ request }) => {
  const files = buildFiles(dist);
  expect(files).toContain('index.html');
  await expect
    .poll(
      async () => {
        const wrong: string[] = [];
        for (const file of files) {
          const response = await request.get(`/${file}`, { maxRedirects: 0 });
          if (response.status() !== 200) wrong.push(`${file} → ${response.status()}`);
          else if (sha256(await response.body()) !== sha256(readFileSync(join(dist, file)))) wrong.push(`${file} → different content`);
        }
        return wrong;
      },
      { timeout: SETTLE_MS, intervals: [5_000] },
    )
    .toEqual([]);
});

// @spec OFF-013, OFF-006
test('serves the service worker, manifest and index.html with no-cache', async ({ request }) => {
  for (const path of ['/', '/index.html', '/sw.js', '/manifest.webmanifest']) {
    const response = await request.get(path);
    expect(response.headers()['cache-control'], path).toMatch(/no-cache/);
  }
});

// @spec OFF-013, OFF-007, OFF-008
test('carries the stage names and indexing rules', async ({ page, request }) => {
  const dev = stage === 'dev';
  const production = stage === 'production';
  await expect
    .poll(async () => (await request.get('/robots.txt')).text(), { timeout: SETTLE_MS, intervals: [5_000] })
    .toBe(production ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n');
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest).toMatchObject(
    dev ? { name: 'Learn Mandalorian (Dev)', short_name: 'Mando Dev' } : { name: 'Learn Mandalorian', short_name: 'Mando' },
  );

  await page.goto('/');
  await passIntro(page);
  await expect(page.locator('.passage-title').first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveCount(production ? 0 : 1);
  await expect(page.locator('.dev-marker').filter({ visible: true })).toHaveCount(dev ? 1 : 0);
});

// @spec OFF-013, OFF-001
test('opens with no network after the first visit', async ({ page }) => {
  await page.goto('/');
  await passIntro(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator('.passage-title').first()).toBeVisible();
  await expect(page.locator('.page-area p').first()).not.toBeEmpty();
});
