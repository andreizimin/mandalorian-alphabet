import { createAlphabet, FREQUENCY_ORDER, type FontRegistry, type FontStore } from './alphabet';

function fakeStore(initial: { blob: Blob; name: string } | null = null) {
  let stored = initial;
  const store: FontStore & { saves: number } = {
    saves: 0,
    async save(blob, name) {
      store.saves += 1;
      stored = { blob, name };
    },
    async load() {
      return stored;
    },
  };
  return store;
}

function fakeRegistry(opts: { fail?: boolean } = {}) {
  const registry: FontRegistry & { registered: string[] } = {
    registered: [],
    async register(family) {
      if (opts.fail) throw new Error('bad font data');
      registry.registered.push(family);
    },
  };
  return registry;
}

function fontFile(name: string, type = 'font/ttf') {
  return new File([new Uint8Array([0, 1, 0, 0])], name, { type });
}

describe('alphabet font loading', () => {
  // @spec ALPHA-001
  it('loads a TTF through the FontFace registry and stores it on device', async () => {
    const store = fakeStore();
    const registry = fakeRegistry();
    const alphabet = createAlphabet({ store, registry });

    await alphabet.loadFromFile(fontFile('mando.ttf'));

    expect(registry.registered).toEqual([alphabet.fontFamily]);
    expect(store.saves).toBe(1);
    expect(alphabet.status()).toEqual({ state: 'loaded', fileName: 'mando.ttf' });
    expect(alphabet.isSubstitutionEnabled()).toBe(true);
  });

  // @spec ALPHA-001
  it.each(['mando.otf', 'mando.woff2', 'MANDO.TTF'])('accepts %s', async (name) => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry() });
    await alphabet.loadFromFile(fontFile(name, ''));
    expect(alphabet.status().state).toBe('loaded');
  });

  // @spec ALPHA-001
  it('restores a previously stored font on startup', async () => {
    const store = fakeStore({ blob: fontFile('kept.ttf'), name: 'kept.ttf' });
    const registry = fakeRegistry();
    const alphabet = createAlphabet({ store, registry });

    await alphabet.restore();

    expect(registry.registered).toHaveLength(1);
    expect(alphabet.status()).toEqual({ state: 'loaded', fileName: 'kept.ttf' });
  });

  // @spec ALPHA-002
  it('makes no network request while loading or restoring a font', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network used'));
    const xhrSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
    const beacon = vi.fn();
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });

    const store = fakeStore();
    const alphabet = createAlphabet({ store, registry: fakeRegistry() });
    await alphabet.loadFromFile(fontFile('mando.ttf'));
    await createAlphabet({ store, registry: fakeRegistry() }).restore();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
    expect(beacon).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
    xhrSpy.mockRestore();
  });

  // @spec ALPHA-003
  it('enters an error state naming the file and disables substitution when the font fails to load', async () => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry({ fail: true }) });

    await alphabet.loadFromFile(fontFile('broken.ttf'));

    expect(alphabet.status()).toMatchObject({ state: 'error', fileName: 'broken.ttf' });
    expect(alphabet.isSubstitutionEnabled()).toBe(false);
  });

  // @spec ALPHA-003
  it('treats an unsupported file type as a load failure naming the file', async () => {
    const registry = fakeRegistry();
    const alphabet = createAlphabet({ store: fakeStore(), registry });

    await alphabet.loadFromFile(fontFile('notes.txt', 'text/plain'));

    expect(registry.registered).toEqual([]);
    expect(alphabet.status()).toMatchObject({ state: 'error', fileName: 'notes.txt' });
  });

  // @spec ALPHA-004
  it('starts with no font and substitution disabled', () => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry() });
    expect(alphabet.status()).toEqual({ state: 'none' });
    expect(alphabet.isSubstitutionEnabled()).toBe(false);
  });

  // @spec ALPHA-004
  it('notifies subscribers as status changes', async () => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry() });
    const seen: string[] = [];
    alphabet.subscribe(() => seen.push(alphabet.status().state));

    await alphabet.loadFromFile(fontFile('mando.ttf'));

    expect(seen).toEqual(['loading', 'loaded']);
  });
});

describe('alphabet letter order', () => {
  // @spec ALPHA-005
  it('defaults to English frequency order', () => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry() });
    expect(alphabet.order()).toEqual(FREQUENCY_ORDER);
    expect(FREQUENCY_ORDER.slice(0, 6)).toEqual(['e', 't', 'a', 'o', 'i', 'n']);
    expect([...FREQUENCY_ORDER].sort()).toEqual('abcdefghijklmnopqrstuvwxyz'.split(''));
  });

  // @spec ALPHA-005
  it('uses an edited order for all future lookups', () => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry() });
    const edited = [...FREQUENCY_ORDER].reverse();

    alphabet.setOrder(edited);

    expect(alphabet.order()).toEqual(edited);
  });

  // @spec ALPHA-005
  it('rejects an order that is not a permutation of the 26 letters', () => {
    const alphabet = createAlphabet({ store: fakeStore(), registry: fakeRegistry() });
    expect(() => alphabet.setOrder(['e', 't'])).toThrow();
    expect(() => alphabet.setOrder([...FREQUENCY_ORDER.slice(0, 25), 'e'])).toThrow();
    expect(alphabet.order()).toEqual(FREQUENCY_ORDER);
  });
});
