import { useCallback } from 'react';
import { progressReducer, type ProgressEvent } from '../progression/progression';
import { progressSlice } from './progressSlice';
import type { KeyValueStore } from './storage';
import { usePersistedSlice } from './usePersistedSlice';

export type { StorageNoticeKind } from './usePersistedSlice';

// @spec PERS-001, PERS-003, PERS-004, PERS-005, PERS-006, PROG-014
export function usePersistedProgress(store: KeyValueStore) {
  const { value: progress, set: replace, update, notice, dismissNotice } = usePersistedSlice(store, progressSlice);
  const dispatch = useCallback((event: ProgressEvent) => update((p) => progressReducer(p, event)), [update]);
  return { progress, dispatch, replace, notice, dismissNotice };
}
