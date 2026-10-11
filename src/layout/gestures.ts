import { useEffect, useRef } from 'react';

export const SWIPE_MIN_PX = 50;
export const TAP_MAX_PX = 10;
export const EDGE_ZONE = 0.15;

interface Point {
  x: number;
  y: number;
}

export type Gesture = 'forward' | 'back' | 'none';

// @spec LAYOUT-007
export function classifyGesture({
  start,
  end,
  width,
  onGlyph,
}: {
  start: Point;
  end: Point;
  width: number;
  onGlyph: boolean;
}): Gesture {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'forward' : 'back';
  if (Math.hypot(dx, dy) < TAP_MAX_PX && !onGlyph) {
    if (start.x > width * (1 - EDGE_ZONE)) return 'forward';
    if (start.x < width * EDGE_ZONE) return 'back';
  }
  return 'none';
}

/** Controls and overlays keep their own taps; gestures never start on them. */
const NOT_THE_PAGE = 'button, a, input, textarea, select, nav, [role="dialog"], .overlay, .menu-backdrop';

/**
 * Swipes and edge taps anywhere on the reading screen. Edge zones are measured
 * against the viewport, so on a wide screen they sit outside the text column.
 */
// @spec LAYOUT-007
export function usePageGestures({
  enabled,
  onBack,
  onForward,
}: {
  enabled: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  const handlers = useRef({ onBack, onForward });
  handlers.current = { onBack, onForward };

  useEffect(() => {
    if (!enabled) return;
    let start: Point | null = null;
    let onGlyph = false;

    function down(event: PointerEvent) {
      const target = event.target as Element | null;
      if (event.button > 0 || !target || target.closest(NOT_THE_PAGE)) return;
      start = { x: event.clientX, y: event.clientY };
      onGlyph = target.closest('.g') !== null;
    }
    function up(event: PointerEvent) {
      if (!start) return;
      const gesture = classifyGesture({
        start,
        end: { x: event.clientX, y: event.clientY },
        width: window.innerWidth,
        onGlyph,
      });
      start = null;
      if (gesture === 'forward') handlers.current.onForward();
      else if (gesture === 'back') handlers.current.onBack();
    }
    const cancel = () => {
      start = null;
    };

    document.addEventListener('pointerdown', down);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
    };
  }, [enabled]);
}
