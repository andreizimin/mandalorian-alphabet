import { loadSlice, probeStorage, saveSlice, type Slice } from './storage';
import { brokenStore, memoryStore } from './testStores';

interface Counter {
  n: number;
}

const counter: Slice<Counter> = {
  key: 'script-ramp:v1:counter',
  initial: { n: 0 },
  validate: (v: unknown): v is Counter =>
    typeof v === 'object' && v !== null && typeof (v as Counter).n === 'number',
};

describe('probeStorage', () => {
  // @spec PERS-004
  it('reports working storage and leaves no probe key behind', () => {
    const store = memoryStore();
    expect(probeStorage(store)).toBe(true);
    expect(store.data.size).toBe(0);
  });

  // @spec PERS-004
  it('reports unavailable storage without throwing', () => {
    expect(probeStorage(brokenStore())).toBe(false);
  });
});

describe('saveSlice and loadSlice', () => {
  // @spec PERS-001, PERS-005
  it('writes a slice as JSON under its key and reads it back', () => {
    const store = memoryStore();

    expect(saveSlice(store, counter, { n: 3 })).toBe(true);

    expect(JSON.parse(store.getItem(counter.key)!)).toEqual({ n: 3 });
    expect(loadSlice(store, counter)).toEqual({ value: { n: 3 }, unreadable: false });
  });

  // @spec PERS-001
  it('returns the initial value when nothing is stored', () => {
    expect(loadSlice(memoryStore(), counter)).toEqual({ value: { n: 0 }, unreadable: false });
  });

  // @spec PERS-004
  it('reports a failed write instead of throwing', () => {
    expect(saveSlice(brokenStore(), counter, { n: 1 })).toBe(false);
  });

  // @spec PERS-006
  it('starts fresh and backs up the raw value when stored data is not JSON', () => {
    const store = memoryStore({ [counter.key]: '{not json' });

    expect(loadSlice(store, counter)).toEqual({ value: { n: 0 }, unreadable: true });
    expect(store.getItem(`${counter.key}:unreadable`)).toBe('{not json');
  });

  // @spec PERS-006
  it('starts fresh and backs up the raw value when stored data fails validation', () => {
    const store = memoryStore({ [counter.key]: '{"n":"three"}' });

    expect(loadSlice(store, counter)).toEqual({ value: { n: 0 }, unreadable: true });
    expect(store.getItem(`${counter.key}:unreadable`)).toBe('{"n":"three"}');
  });
});
