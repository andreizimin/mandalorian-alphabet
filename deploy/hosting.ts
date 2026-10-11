/**
 * Hosting rules for the static site, used by sst.config.ts. Kept free of SST
 * imports so they can be unit-tested.
 */

export const DOMAIN = 'learn-mandalorian.andreizimin.com';

/** Checked on every launch, so a phone finds new versions. */
export const NO_CACHE = 'public,max-age=0,no-cache';
/** Hashed build output never changes under the same name. */
export const IMMUTABLE = 'public,max-age=31536000,immutable';
/** Unhashed static files (font, icons) that change rarely. */
export const ONE_DAY = 'public,max-age=86400';

export interface CacheRule {
  files: string[];
  cacheControl: string;
  matches(path: string): boolean;
}

function rule(files: string[], cacheControl: string): CacheRule {
  return {
    files,
    cacheControl,
    matches: (path) =>
      files.some((pattern) => (pattern.endsWith('/**') ? path.startsWith(pattern.slice(0, -2)) : path === pattern)),
  };
}

// The rules cover disjoint files, so the order SST applies them in does not matter.
// @spec OFF-006
export const cacheRules: CacheRule[] = [
  rule(['sw.js', 'registerSW.js', 'manifest.webmanifest', 'index.html'], NO_CACHE),
  rule(['assets/**'], IMMUTABLE),
  rule(['fonts/**', 'icons/**'], ONE_DAY),
];

// @spec OFF-006
export function domainFor(stage: string): string | undefined {
  return stage === 'production' ? DOMAIN : undefined;
}
