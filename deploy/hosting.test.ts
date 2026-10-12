import { DEV_DOMAIN, NO_CACHE, IMMUTABLE, ONE_DAY, cacheControlFor, domainFor } from './hosting';

describe('hosting', () => {
  // @spec OFF-006
  it('never caches the service worker, manifest, index.html or robots.txt', () => {
    for (const file of ['sw.js', 'manifest.webmanifest', 'index.html', 'registerSW.js', 'robots.txt']) {
      expect(cacheControlFor(file)).toBe(NO_CACHE);
    }
    expect(NO_CACHE).toMatch(/no-cache/);
  });

  // @spec OFF-006
  it('caches hashed build assets, including the Workbox runtime, for a year', () => {
    expect(cacheControlFor('assets/index-qDZeF62M.js')).toBe(IMMUTABLE);
    expect(cacheControlFor('workbox-2fbc6a65.js')).toBe(IMMUTABLE);
    expect(IMMUTABLE).toMatch(/max-age=31536000/);
    expect(IMMUTABLE).toMatch(/immutable/);
  });

  // @spec OFF-006
  it('publishes every build file, with no-cache for files no specific rule names', () => {
    expect(cacheControlFor('fonts/mando-af-regular.woff2')).toBe(ONE_DAY);
    expect(cacheControlFor('icons/icon-192.png')).toBe(ONE_DAY);
    for (const file of ['some-new-file.txt', 'nested/dir/file.json', 'workbox-2fbc6a65.js.map']) {
      expect(cacheControlFor(file)).toBe(NO_CACHE);
    }
  });

  // @spec OFF-006
  it('attaches the production domain to production and the dev domain to dev only', () => {
    expect(domainFor('production')).toBe('learn-mandalorian.andreizimin.com');
    expect(DEV_DOMAIN).toBe('learn-mandalorian-dev.andreizimin.com');
    expect(domainFor('dev')).toBe(DEV_DOMAIN);
    for (const stage of ['pr-12', 'andreizimin', 'staging']) expect(domainFor(stage)).toBeUndefined();
  });
});
