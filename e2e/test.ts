import { test as base } from '@playwright/test';

export * from '@playwright/test';

/**
 * Playwright's `test`, with every page kept away from the Umami tracker, so no
 * browser test (the live-site check against dev and production included) is
 * ever counted as a visit. Specs import `test` and `expect` from here.
 */
// @spec ANA-010
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://cloud.umami.is/**', (route) => route.abort());
    await use(page);
  },
});
