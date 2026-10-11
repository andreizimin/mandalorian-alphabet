import { useCallback, useRef, useState } from 'react';
import { progressReducer, type ProgressEvent, type ProgressState } from '../progression/progression';
import { progressSlice } from './progressSlice';
import { loadSlice, probeStorage, saveSlice, type KeyValueStore } from './storage';

export type StorageNoticeKind = 'unavailable' | 'unreadable';

interface Init {
  progress: ProgressState;
  persist: boolean;
  notice: StorageNoticeKind | null;
}

function init(store: KeyValueStore): Init {
  if (!probeStorage(store)) return { progress: progressSlice.initial, persist: false, notice: 'unavailable' };
  const { value, unreadable } = loadSlice(store, progressSlice);
  return { progress: value, persist: true, notice: unreadable ? 'unreadable' : null };
}

/**
 * Progress state backed by on-device storage. Every change is written
 * synchronously, before the next render.
 */
// @spec PERS-001, PERS-003, PERS-004, PERS-005, PERS-006, PROG-014
export function usePersistedProgress(store: KeyValueStore) {
  const [initial] = useState(() => init(store));
  const [progress, setProgress] = useState(initial.progress);
  const [notice, setNotice] = useState(initial.notice);
  const current = useRef(initial.progress);

  const commit = useCallback(
    (next: ProgressState) => {
      if (next === current.current) return;
      current.current = next;
      if (initial.persist) saveSlice(store, progressSlice, next);
      setProgress(next);
    },
    [initial.persist, store],
  );

  const dispatch = useCallback((event: ProgressEvent) => commit(progressReducer(current.current, event)), [commit]);
  const replace = useCallback((next: ProgressState) => commit(next), [commit]);
  const dismissNotice = useCallback(() => setNotice(null), []);

  return { progress, dispatch, replace, notice, dismissNotice };
}
