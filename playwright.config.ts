import { defineConfig, devices } from '@playwright/test';

// Layout specs need a real layout engine. WebKit is the engine behind iPhone and iPad Safari.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npx vite build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'ipad', use: { ...devices['iPad (gen 7)'] } },
    { name: 'laptop', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } } },
  ],
});
