import type { Alphabet } from './alphabet';
import { useFontState } from './useFontState';

// @spec ALPHA-003
export function FontStatus({ alphabet }: { alphabet: Alphabet }) {
  const state = useFontState(alphabet);
  if (state !== 'failed') return null;

  return (
    <div role="status" className="font-status">
      Mandalorian glyphs couldn't load, so text is showing in English letters.
      <button type="button" onClick={() => void alphabet.retry()}>
        Retry
      </button>
    </div>
  );
}
