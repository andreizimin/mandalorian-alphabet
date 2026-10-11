export const KEY_PREFIX = 'script-ramp:v1:';
const PROBE_KEY = `${KEY_PREFIX}probe`;

/** The subset of the Web Storage API persistence uses. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** A piece of learner state owned by one segment, stored under its own key. */
export interface Slice<T> {
  key: string;
  initial: T;
  validate(value: unknown): value is T;
}

export interface Loaded<T> {
  value: T;
  /** True when something was stored but could not be read; it was backed up. */
  unreadable: boolean;
}

/** Local storage, looked up lazily so a browser that throws on access is handled like any failed call. */
export const localStore: KeyValueStore = {
  getItem: (k) => window.localStorage.getItem(k),
  setItem: (k, v) => window.localStorage.setItem(k, v),
  removeItem: (k) => window.localStorage.removeItem(k),
};

// @spec PERS-004
export function probeStorage(store: KeyValueStore): boolean {
  try {
    store.setItem(PROBE_KEY, '1');
    store.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

// @spec PERS-005
export function saveSlice<T>(store: KeyValueStore, slice: Slice<T>, value: T): boolean {
  try {
    store.setItem(slice.key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// @spec PERS-001, PERS-006
export function loadSlice<T>(store: KeyValueStore, slice: Slice<T>): Loaded<T> {
  let raw: string | null;
  try {
    raw = store.getItem(slice.key);
  } catch {
    return { value: slice.initial, unreadable: false };
  }
  if (raw === null) return { value: slice.initial, unreadable: false };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (slice.validate(parsed)) return { value: parsed, unreadable: false };
  } catch {
    // fall through to backup
  }
  try {
    store.setItem(`${slice.key}:unreadable`, raw);
  } catch {
    // backup is best effort
  }
  return { value: slice.initial, unreadable: true };
}
