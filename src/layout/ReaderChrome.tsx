import { useState } from 'react';
import { Controls } from '../progression/components';
import { QuizButton } from '../quiz/QuizScreen';
import { PageTurnBar } from './pageTurning';
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE } from './settings';

export interface ReaderActions {
  canAdvance: boolean;
  canStepBack: boolean;
  canTurnBack: boolean;
  learnedCount: number;
  fontReady: boolean;
  textSize: number;
  onAdvance: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onLegend: () => void;
  onLibrary: () => void;
  onQuiz: () => void;
  onTextSize: (direction: 1 | -1) => void;
  onBack: () => void;
  onForward: () => void;
}

// @spec LAYOUT-006
export function TextSizeControl({
  textSize,
  onTextSize,
}: {
  textSize: number;
  onTextSize: (direction: 1 | -1) => void;
}) {
  return (
    <div className="text-size" role="group" aria-label="Text size">
      <button type="button" aria-label="Smaller text" disabled={textSize <= MIN_TEXT_SIZE} onClick={() => onTextSize(-1)}>
        A−
      </button>
      <button type="button" aria-label="Larger text" disabled={textSize >= MAX_TEXT_SIZE} onClick={() => onTextSize(1)}>
        A+
      </button>
    </div>
  );
}

/** Every reader control, for viewports 600 px and wider (hidden below by CSS). */
// @spec LAYOUT-003, LAYOUT-008, LAYOUT-011, PROG-007
export function TopBar(a: ReaderActions) {
  return (
    <nav className="top-bar" aria-label="Reader controls">
      <Controls
        canAdvance={a.canAdvance}
        canStepBack={a.canStepBack}
        onAdvance={a.onAdvance}
        onStepBack={a.onStepBack}
        onReset={a.onReset}
      />
      <button type="button" onClick={a.onLegend}>
        Legend ({a.learnedCount})
      </button>
      <button type="button" onClick={a.onLibrary}>
        Library
      </button>
      <QuizButton learnedCount={a.learnedCount} fontReady={a.fontReady} onOpen={a.onQuiz} />
      <TextSizeControl textSize={a.textSize} onTextSize={a.onTextSize} />
    </nav>
  );
}

/** Page-turn buttons at every width; Next letter, Quiz and the menu only on phones (CSS). */
// @spec LAYOUT-002, LAYOUT-008, LAYOUT-012
export function BottomBar({ onMenu, ...a }: ReaderActions & { onMenu: () => void }) {
  return (
    <PageTurnBar canBack={a.canTurnBack} onBack={a.onBack} onForward={a.onForward}>
      <div className="phone-only">
        <button type="button" className="primary" onClick={a.onAdvance} disabled={!a.canAdvance}>
          Next letter
        </button>
        <QuizButton learnedCount={a.learnedCount} fontReady={a.fontReady} onOpen={a.onQuiz} />
        <button type="button" aria-label="Menu" onClick={onMenu}>
          ⋯
        </button>
      </div>
    </PageTurnBar>
  );
}

/** The phone menu: occasional controls, one tap from the bottom bar. */
// @spec LAYOUT-002, LAYOUT-011, LAYOUT-014, PROG-007
export function MenuSheet({ onClose, ...a }: ReaderActions & { onClose: () => void }) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const thenClose = (action: () => void) => () => {
    action();
    onClose();
  };

  return (
    <>
      <div className="menu-backdrop" onClick={onClose} />
      <div className="menu-sheet" role="dialog" aria-label="Menu">
        {confirmingReset ? (
          <div className="controls" role="group" aria-label="Confirm reset">
            <span>Reset all progress?</span>
            <button type="button" onClick={thenClose(a.onReset)}>
              Yes, reset
            </button>
            <button type="button" onClick={() => setConfirmingReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="menu-items">
            <button type="button" onClick={thenClose(a.onStepBack)} disabled={!a.canStepBack}>
              Step back
            </button>
            <button type="button" onClick={() => setConfirmingReset(true)}>
              Reset
            </button>
            <button type="button" onClick={thenClose(a.onLegend)}>
              Legend
            </button>
            <button type="button" onClick={thenClose(a.onLibrary)}>
              Library
            </button>
            <TextSizeControl textSize={a.textSize} onTextSize={a.onTextSize} />
          </div>
        )}
      </div>
    </>
  );
}
