import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAlphabet, FONT_URL, FREQUENCY_ORDER, type FontRegistry } from './alphabet';

function deferred() {
  let resolveFn!: () => void;
  let rejectFn!: (e: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolveFn = res;
    rejectFn = rej;
  });
  return { promise, resolve: resolveFn, reject: rejectFn };
}

function fakeRegistry(outcomes: Array<'ok' | 'fail'> = ['ok']) {
  const calls: Array<{ family: string; url: string }> = [];
  const registry: FontRegistry & { calls: typeof calls } = {
    calls,
    async register(family, url) {
      calls.push({ family, url });
      const outcome = outcomes[Math.min(calls.length - 1, outcomes.length - 1)];
      if (outcome === 'fail') throw new Error('font failed to load');
    },
  };
  return registry;
}

describe('alphabet font loading', () => {
  // @spec ALPHA-001
  it('loads the bundled font through the FontFace registry on start', async () => {
    const registry = fakeRegistry();
    const alphabet = createAlphabet({ registry });

    await alphabet.start();

    expect(registry.calls).toEqual([{ family: alphabet.fontFamily, url: FONT_URL }]);
    expect(alphabet.status()).toBe('loaded');
    expect(alphabet.isSubstitutionEnabled()).toBe(true);
  });

  // @spec ALPHA-001
  it('ships the bundled font as a WOFF2 file at the path it loads from', () => {
    expect(FONT_URL).toBe('/fonts/mando-af-regular.woff2');
    const bytes = readFileSync(resolve(process.cwd(), 'public', FONT_URL.slice(1)));
    expect(bytes.subarray(0, 4).toString('latin1')).toBe('wOF2');
  });

  // @spec ALPHA-006
  it('loads the font from the app origin and makes no other network request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network used'));
    const registry = fakeRegistry();

    await createAlphabet({ registry }).start();

    const resolved = new URL(registry.calls[0].url, window.location.href);
    expect(resolved.origin).toBe(window.location.origin);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  // @spec ALPHA-003
  it('enters the failed state and keeps substitution off when the font fails to load', async () => {
    const alphabet = createAlphabet({ registry: fakeRegistry(['fail']) });

    await alphabet.start();

    expect(alphabet.status()).toBe('failed');
    expect(alphabet.isSubstitutionEnabled()).toBe(false);
  });

  // @spec ALPHA-003
  it('retries after a failure and recovers when the retry succeeds', async () => {
    const registry = fakeRegistry(['fail', 'ok']);
    const alphabet = createAlphabet({ registry });
    await alphabet.start();

    await alphabet.retry();

    expect(registry.calls).toHaveLength(2);
    expect(alphabet.status()).toBe('loaded');
    expect(alphabet.isSubstitutionEnabled()).toBe(true);
  });

  // @spec ALPHA-004
  it('keeps substitution off while the font is loading', async () => {
    const gate = deferred();
    const alphabet = createAlphabet({ registry: { register: () => gate.promise } });

    const started = alphabet.start();
    expect(alphabet.status()).toBe('loading');
    expect(alphabet.isSubstitutionEnabled()).toBe(false);

    gate.resolve();
    await started;
    expect(alphabet.isSubstitutionEnabled()).toBe(true);
  });

  // @spec ALPHA-004
  it('notifies subscribers on each status change', async () => {
    const alphabet = createAlphabet({ registry: fakeRegistry(['fail', 'ok']) });
    const seen: string[] = [];
    alphabet.subscribe(() => seen.push(alphabet.status()));

    await alphabet.start();
    await alphabet.retry();

    expect(seen).toEqual(['loading', 'failed', 'loading', 'loaded']);
  });
});

describe('alphabet letter order', () => {
  // @spec PROG-001
  it('is English frequency order covering all 26 letters once', () => {
    const alphabet = createAlphabet({ registry: fakeRegistry() });
    expect(alphabet.order()).toEqual(FREQUENCY_ORDER);
    expect(FREQUENCY_ORDER.slice(0, 6)).toEqual(['e', 't', 'a', 'o', 'i', 'n']);
    expect([...FREQUENCY_ORDER].sort()).toEqual('abcdefghijklmnopqrstuvwxyz'.split(''));
  });
});
