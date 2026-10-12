/// <reference types="vitest/config" />
import { configDefaults } from 'vitest/config';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaOptionsFor } from './src/offline/pwaOptions';
import { robotsTxt, stageFrom, transformIndexHtml } from './src/stage';

const stage = stageFrom(process.env.VITE_STAGE);

/** Stage-specific index.html and robots.txt (OFF-007, OFF-008). */
function stagePages(): Plugin {
  return {
    name: 'stage-pages',
    transformIndexHtml: (html) => transformIndexHtml(html, stage),
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(stage) });
    },
  };
}

export default defineConfig({
  plugins: [react(), VitePWA(pwaOptionsFor(stage)), stagePages()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
