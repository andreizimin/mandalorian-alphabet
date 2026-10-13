import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pwaOptions, pwaOptionsFor } from './pwaOptions';

/** Width and height from a PNG file's IHDR chunk. */
function pngSize(publicPath: string) {
  const bytes = readFileSync(resolve(process.cwd(), 'public', publicPath));
  expect(bytes.subarray(1, 4).toString('latin1')).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('web app manifest', () => {
  // @spec OFF-002
  it('names the app, launches standalone from the root', () => {
    expect(pwaOptions.manifest).toMatchObject({
      name: 'Learn Mandalorian',
      short_name: 'Mando',
      display: 'standalone',
      start_url: '/',
    });
  });

  // @spec OFF-005
  it('lists 192 and 512 px icons that exist at those sizes', () => {
    const icons = pwaOptions.manifest.icons;
    expect(icons.map((i) => i.sizes)).toEqual(['192x192', '512x512']);
    for (const icon of icons) {
      const [w, h] = icon.sizes.split('x').map(Number);
      expect(pngSize(icon.src)).toEqual({ width: w, height: h });
    }
  });

  // @spec OFF-005
  it('ships a 180 px apple-touch-icon referenced from index.html', () => {
    expect(pngSize('icons/apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    expect(html).toMatch(/<link rel="apple-touch-icon" href="\/icons\/apple-touch-icon.png"/);
  });
});

describe('service worker', () => {
  // @spec OFF-001, OFF-003
  it('precaches scripts, styles, the font, icons and html', () => {
    const patterns = pwaOptions.workbox.globPatterns.join(' ');
    for (const ext of ['js', 'css', 'html', 'woff2', 'png']) expect(patterns).toContain(ext);
    expect(pwaOptions.workbox.navigateFallback).toBe('/index.html');
  });

  // @spec OFF-004
  it('lets a new version take control as soon as it is ready, registered by the app itself', () => {
    expect(pwaOptions.workbox.skipWaiting).toBe(true);
    expect(pwaOptions.workbox.clientsClaim).toBe(true);
    // The plugin's own registration script would reload or prompt by its own rules; src/offline/updates.ts registers instead.
    expect(pwaOptions.injectRegister).toBe(false);
  });
});

describe('manifest per stage', () => {
  // @spec OFF-008
  it('names the installed app "Mando Dev" on dev and keeps the production names elsewhere', () => {
    expect(pwaOptionsFor('dev').manifest).toMatchObject({ name: 'Learn Mandalorian (Dev)', short_name: 'Mando Dev' });
    expect(pwaOptionsFor('production').manifest).toMatchObject({ name: 'Learn Mandalorian', short_name: 'Mando' });
    expect(pwaOptionsFor('local').manifest.short_name).toBe('Mando');
    expect(pwaOptions.manifest.short_name).toBe('Mando');
  });
});
