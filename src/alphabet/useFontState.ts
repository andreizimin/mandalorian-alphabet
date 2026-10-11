import { useSyncExternalStore } from 'react';
import type { Alphabet } from './alphabet';

export function useFontState(alphabet: Alphabet) {
  return useSyncExternalStore(alphabet.subscribe, alphabet.status);
}
