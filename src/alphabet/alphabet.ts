export const FONT_URL = '/fonts/mando-af-regular.woff2';
export const FONT_FAMILY = 'Mando AF';

export const FREQUENCY_ORDER: readonly string[] = 'etaoinshrdlcumwfgypbvkjxqz'.split('');

export type FontState = 'loading' | 'loaded' | 'failed';

export interface FontRegistry {
  register(family: string, url: string): Promise<void>;
}

export interface Alphabet {
  readonly fontFamily: string;
  status(): FontState;
  subscribe(listener: () => void): () => void;
  start(): Promise<void>;
  retry(): Promise<void>;
  isSubstitutionEnabled(): boolean;
  order(): readonly string[];
}

export const browserFontRegistry: FontRegistry = {
  async register(family, url) {
    const face = new FontFace(family, `url(${url})`);
    await face.load();
    document.fonts.add(face);
  },
};

// @spec ALPHA-001, ALPHA-003, ALPHA-004, ALPHA-006, PROG-001
export function createAlphabet({ registry }: { registry: FontRegistry }): Alphabet {
  let state: FontState = 'loading';
  const listeners = new Set<() => void>();

  function setState(next: FontState) {
    state = next;
    listeners.forEach((l) => l());
  }

  async function load() {
    setState('loading');
    try {
      await registry.register(FONT_FAMILY, FONT_URL);
      setState('loaded');
    } catch {
      setState('failed');
    }
  }

  return {
    fontFamily: FONT_FAMILY,
    status: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start: load,
    retry: load,
    isSubstitutionEnabled: () => state === 'loaded',
    order: () => FREQUENCY_ORDER,
  };
}
