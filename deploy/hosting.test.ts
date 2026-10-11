import { NO_CACHE, IMMUTABLE, cacheRules, domainFor } from './hosting';

const ruleFor = (file: string) => cacheRules.find((r) => r.matches(file))?.cacheControl;

describe('hosting', () => {
  // @spec OFF-006
  it('never caches the service worker, manifest or index.html', () => {
    for (const file of ['sw.js', 'manifest.webmanifest', 'index.html', 'registerSW.js']) {
      expect(ruleFor(file)).toBe(NO_CACHE);
    }
    expect(NO_CACHE).toMatch(/no-cache/);
  });

  // @spec OFF-006
  it('caches hashed build assets for a year', () => {
    expect(ruleFor('assets/index-qDZeF62M.js')).toBe(IMMUTABLE);
    expect(IMMUTABLE).toMatch(/max-age=31536000/);
    expect(IMMUTABLE).toMatch(/immutable/);
  });

  // @spec OFF-006
  it('attaches the custom domain only on the production stage', () => {
    expect(domainFor('production')).toBe('learn-mandalorian.andreizimin.com');
    expect(domainFor('dev')).toBeUndefined();
    expect(domainFor('pr-12')).toBeUndefined();
  });
});
