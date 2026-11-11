import { useEffect, useState } from 'react';

/** The width at which the reader switches from the phone layout to the top bar (LAYOUT-002, LAYOUT-003). */
export const WIDE_QUERY = '(min-width: 600px)';

/** Whether the viewport is 600 px or wider, kept current as the window resizes. Narrow where matchMedia is missing. */
export function useWideViewport(): boolean {
  const query = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(WIDE_QUERY) : null);
  const [wide, setWide] = useState(() => query()?.matches ?? false);
  useEffect(() => {
    const list = query();
    if (!list) return;
    const onChange = () => setWide(list.matches);
    onChange();
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, []);
  return wide;
}
