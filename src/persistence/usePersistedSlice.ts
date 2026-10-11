import { useCallback, useRef, useState } from 'react';
import { loadSlice, probeStorage, saveSlice, type KeyValueStore, type Slice } from './storage';

export type StorageNoticeKind = 'unavailable' | 'unreadable';

interface Init<T> {
  value: T;
  persist: boolean;
  notice: StorageNoticeKind | null;
}

function init<T>(store: KeyValueStore, slice: Slice<T>): Init<T> {
  if (!probeStorage(store)) return { value: slice.initial, persist: false, notice: 'unavailable' };
  const { value, unreadable } = loadSlice(store, slice);
  return { value, persist: true, notice: unreadable ? 'unreadable' : null };
}

/**
 * One slice of learner state backed by on-device storage. Every change is
 * written synchronously, before the next render.
 */
// @spec PERS-001, PERS-004, PERS-005, PERS-006
export function usePersistedSlice<T>(store: KeyValueStore, slice: Slice<T>) {
  const [initial] = useState(() => init(store, slice));
  const [value, setValue] = useState(initial.value);
  const [notice, setNotice] = useState(initial.notice);
  const current = useRef(initial.value);

  const set = useCallback(
    (next: T) => {
      if (next === current.current) return;
      current.current = next;
      if (initial.persist) saveSlice(store, slice, next);
      setValue(next);
    },
    [initial.persist, store, slice],
  );

  /** Applies a change to the latest value, so several updates in one handler compose. */
  const update = useCallback((change: (value: T) => T) => set(change(current.current)), [set]);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return { value, set, update, notice, dismissNotice };
}
