import { isDevStage, isProductionStage, robotsTxt, stageFrom, transformIndexHtml } from './stage';

const html = `<html><head>
    <meta name="apple-mobile-web-app-title" content="Mando" />
    <title>Learn Mandalorian</title>
  </head><body></body></html>`;

describe('build stage', () => {
  // @spec OFF-007, OFF-008
  it('reads the stage baked into the build, defaulting to local', () => {
    expect(stageFrom('production')).toBe('production');
    expect(stageFrom('dev')).toBe('dev');
    expect(stageFrom(undefined)).toBe('local');
    expect(stageFrom('')).toBe('local');
    expect(isProductionStage('production')).toBe(true);
    expect(isProductionStage('dev')).toBe(false);
    expect(isDevStage('dev')).toBe(true);
    expect(isDevStage('local')).toBe(false);
  });
});

describe('search engines', () => {
  // @spec OFF-007
  it('allows crawling in production and disallows it everywhere else', () => {
    expect(robotsTxt('production')).toBe('User-agent: *\nAllow: /\n');
    for (const stage of ['dev', 'local', 'andreizimin']) expect(robotsTxt(stage)).toBe('User-agent: *\nDisallow: /\n');
  });

  // @spec OFF-007
  it('adds a noindex tag to every page outside production', () => {
    expect(transformIndexHtml(html, 'production')).not.toContain('noindex');
    for (const stage of ['dev', 'local']) {
      expect(transformIndexHtml(html, stage)).toContain('<meta name="robots" content="noindex, nofollow" />');
    }
  });
});

describe('dev naming', () => {
  // @spec OFF-008
  it('names the iOS Home Screen app "Mando Dev" on dev only', () => {
    expect(transformIndexHtml(html, 'dev')).toContain('<meta name="apple-mobile-web-app-title" content="Mando Dev" />');
    expect(transformIndexHtml(html, 'production')).toContain('<meta name="apple-mobile-web-app-title" content="Mando" />');
    expect(transformIndexHtml(html, 'local')).toContain('content="Mando" />');
  });
});
