/**
 * Hosting rules for the static site, used by sst.config.ts. Kept free of SST
 * imports so they can be unit-tested.
 */

export const DOMAIN = 'learn-mandalorian.andreizimin.com';
export const DEV_DOMAIN = 'learn-mandalorian-dev.andreizimin.com';

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

/** The subset of SST's glob syntax the rules use: `**`, `dir/**`, `*` within one name. */
function globMatches(pattern: string, path: string): boolean {
  if (pattern === '**') return true;
  if (pattern.endsWith('/**')) return path.startsWith(pattern.slice(0, -2));
  const source = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  return new RegExp(`^${source}$`).test(path);
}

function rule(files: string[], cacheControl: string): CacheRule {
  return { files, cacheControl, matches: (path) => files.some((pattern) => globMatches(pattern, path)) };
}

// SST uploads only the files some rule covers, and a later rule wins over an
// earlier one, so the list starts with a catch-all: nothing the build adds is
// silently left unpublished.
// @spec OFF-006
export const cacheRules: CacheRule[] = [
  rule(['**'], NO_CACHE),
  rule(['sw.js', 'registerSW.js', 'manifest.webmanifest', 'index.html', 'robots.txt'], NO_CACHE),
  rule(['assets/**', 'workbox-*.js'], IMMUTABLE),
  rule(['fonts/**', 'icons/**'], ONE_DAY),
];

/** The Cache-Control a published file gets: the last rule that covers it, as in SST. */
export function cacheControlFor(path: string): string | undefined {
  return cacheRules.findLast((r) => r.matches(path))?.cacheControl;
}

// @spec OFF-006
export function domainFor(stage: string): string | undefined {
  if (stage === 'production') return DOMAIN;
  if (stage === 'dev') return DEV_DOMAIN;
  return undefined;
}
