import { contentSlice } from './contentSlice';
import type { KeyValueStore } from './storage';
import { usePersistedSlice } from './usePersistedSlice';

// @spec PERS-001, PERS-003, PERS-004, PERS-005, PERS-006
export function usePersistedContent(store: KeyValueStore) {
  const { value: content, set: replace, update, notice, dismissNotice } = usePersistedSlice(store, contentSlice);
  return { content, update, replace, notice, dismissNotice };
}
