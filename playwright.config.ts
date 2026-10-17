import { defineConfig, devices } from '@playwright/test';

// The live-site check (e2e/live.spec.ts) runs against a deployed address instead
// of the local preview server: `LIVE_URL=https://… npm run test:live`.
const liveUrl = process.env.LIVE_URL;
// The preview server's port; E2E_PORT picks another when 4173 is taken by something else.
const port = Number(process.env.E2E_PORT ?? 4173);

// Layout specs need a real layout engine. WebKit is the engine behind iPhone and iPad Safari.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${port}` },
  webServer: liveUrl
    ? undefined
    : {
        command: `npx vite build && npx vite preview --port ${port} --strictPort`,
        port,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: liveUrl
    ? [{ name: 'live', use: { ...devices['Desktop Chrome'], baseURL: liveUrl }, testMatch: /live\.spec/, timeout: 300_000 }]
    : [
        { name: 'iphone', use: { ...devices['iPhone 13'] }, testIgnore: /offline|live\.spec/ },
        { name: 'ipad', use: { ...devices['iPad (gen 7)'] }, testIgnore: /offline|live\.spec/ },
        { name: 'laptop', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } }, testIgnore: /offline|live\.spec/ },
        // Service workers only run in Playwright's Chromium.
        { name: 'offline', use: { ...devices['Desktop Chrome'] }, testMatch: /offline/ },
      ],
});
