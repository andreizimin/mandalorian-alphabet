import type { KeyValueStore } from './storage';

export function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

export function brokenStore(): KeyValueStore {
  const fail = () => {
    throw new DOMException('denied', 'SecurityError');
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}
