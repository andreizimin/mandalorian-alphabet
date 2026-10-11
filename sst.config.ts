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

    // The custom domain is attached only on the `production` stage, so other
    // stages deploy to throwaway CloudFront URLs. SST provisions the ACM
    // certificate and the Route 53 record in the existing andreizimin.com zone.
    const domain = domainFor($app.stage);
    const site = new sst.aws.StaticSite('Reader', {
      build: { command: 'npm run build', output: 'dist' },
      domain: domain ? { name: domain } : undefined,
      assets: {
        fileOptions: cacheRules.map(({ files, cacheControl }) => ({ files, cacheControl })),
      },
    });

    return { url: site.url };
  },
});
