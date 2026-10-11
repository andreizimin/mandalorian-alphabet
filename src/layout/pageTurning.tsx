import { useEffect, useRef, type ReactNode } from 'react';

/** Page-turn buttons at the two ends of the bottom bar; `children` sit between them. */
// @spec LAYOUT-012
export function PageTurnBar({
  canBack,
  onBack,
  onForward,
  children,
}: {
  canBack: boolean;
  onBack: () => void;
  onForward: () => void;
  children?: ReactNode;
}) {
  return (
    <nav className="page-turn-bar" aria-label="Page turning">
      <button type="button" aria-label="Previous page" onClick={onBack} disabled={!canBack}>
        ←
      </button>
      {children}
      <button type="button" aria-label="Next page" onClick={onForward}>
        →
      </button>
    </nav>
  );
}

function isTextField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

// @spec LAYOUT-013
export function useArrowKeyPageTurns({
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
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTextField(event.target)) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handlers.current.onForward();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlers.current.onBack();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
