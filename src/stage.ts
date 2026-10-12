/**
 * The deploy stage baked into each build (VITE_STAGE, set by sst.config.ts):
 * "production", "dev", a personal stage name, or "local" for builds outside SST.
 * Pure functions, so vite.config.ts can use them at build time too.
 */

export function stageFrom(value: string | undefined): string {
  return value && value.trim() ? value.trim() : 'local';
}

/** The stage this build was made for. */
export function currentStage(): string {
  return stageFrom(import.meta.env?.VITE_STAGE as string | undefined);
}

export const isProductionStage = (stage: string) => stage === 'production';
export const isDevStage = (stage: string) => stage === 'dev';

// @spec OFF-007
export function robotsTxt(stage: string): string {
  return isProductionStage(stage) ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n';
}

/** Stage-specific edits to index.html: noindex outside production, the Home Screen name on dev. */
// @spec OFF-007, OFF-008
export function transformIndexHtml(html: string, stage: string): string {
  let out = html;
  if (isDevStage(stage)) {
    out = out.replace(
      '<meta name="apple-mobile-web-app-title" content="Mando" />',
      '<meta name="apple-mobile-web-app-title" content="Mando Dev" />',
    );
  }
  if (!isProductionStage(stage)) {
    out = out.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>');
  }
  return out;
}
