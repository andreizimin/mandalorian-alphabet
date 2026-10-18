/**
 * Service worker and manifest settings for vite-plugin-pwa. Kept as plain data
 * so the offline specs can be checked without running a build.
 */
// @spec OFF-001, OFF-002, OFF-003, OFF-004, OFF-005, OFF-008
export function pwaOptionsFor(stage: string) {
  const dev = stage === 'dev';
  return {
  // A new version takes control as soon as it is downloaded; src/offline/updates.ts
  // registers the service worker and decides whether the page on screen reloads.
  registerType: 'prompt' as const,
  injectRegister: false as const,
  manifest: {
    name: dev ? 'Learn Mandalorian (Dev)' : 'Learn Mandalorian',
    short_name: dev ? 'Mando Dev' : 'Mando',
    description: 'Learn to read the Mandalorian alphabet by reading real stories.',
    start_url: '/',
    scope: '/',
    display: 'standalone' as const,
    background_color: '#0e0b08',
    theme_color: '#0e0b08',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,png,webmanifest}'],
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
  },
};
}

/** The production options (also what a build without a stage gets, apart from naming). */
export const pwaOptions = pwaOptionsFor('production');
