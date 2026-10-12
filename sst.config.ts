/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'learn-mandalorian',
      // Keep prod resources on accidental removal; tear down other stages.
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: { aws: { region: 'us-east-1' } },
    };
  },
  async run() {
    const { cacheRules, domainFor } = await import('./deploy/hosting');

    // `production` and `dev` get their own custom domains; any other stage
    // deploys to a throwaway CloudFront URL. SST provisions the ACM
    // certificate and the Route 53 record in the existing andreizimin.com zone.
    // The stage is baked into the build, which decides the installed app's
    // name, the DEV marker and whether search engines may index the site.
    const domain = domainFor($app.stage);
    const site = new sst.aws.StaticSite('Reader', {
      build: { command: 'npm run build', output: 'dist' },
      environment: { VITE_STAGE: $app.stage },
      domain: domain ? { name: domain } : undefined,
      assets: {
        fileOptions: cacheRules.map(({ files, cacheControl }) => ({ files, cacheControl })),
      },
    });

    return { url: site.url };
  },
});
