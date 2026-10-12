/**
 * Service worker and manifest settings for vite-plugin-pwa. Kept as plain data
 * so the offline specs can be checked without running a build.
 */
// @spec OFF-001, OFF-002, OFF-003, OFF-004, OFF-005, OFF-008
export function pwaOptionsFor(stage: string) {
  const dev = stage === 'dev';
  return {
  // 'prompt' never forces a reload; with skipWaiting off, a new version waits
  // in the background and takes over on the next launch.
  registerType: 'prompt' as const,
  injectRegister: 'script' as const,
  manifest: {
    name: dev ? 'Learn Mandalorian (Dev)' : 'Learn Mandalorian',
    short_name: dev ? 'Mando Dev' : 'Mando',
    description: 'Learn to read the Mandalorian alphabet by reading real stories.',
    start_url: '/',
    scope: '/',
    display: 'standalone' as const,
    background_color: '#fbfaf7',
    theme_color: '#1b1b1d',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,png,webmanifest}'],
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    skipWaiting: false,
    clientsClaim: false,
  },
};
}

/** The production options (also what a build without a stage gets, apart from naming). */
export const pwaOptions = pwaOptionsFor('production');
