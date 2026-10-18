import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { peekPlacement, selectionPlacement, type Area, type Box } from './peekPlacement';
import { Substituted } from './Substituted';

export const PEEK_MS = 1500;

interface PassagePageProps {
  paragraphs: readonly string[];
  learnedSet: ReadonlySet<string>;
  /** The most recently learned letter, drawn in the highlight color. */
  newestLetter?: string;
  onPeek: (letter: string) => void;
  /** Wired by the layout segment (LAYOUT-007); glyph taps never call it. */
  onPageTurn?: () => void;
}

interface Peek {
  /** The whitespace-delimited word the tapped glyph belongs to, punctuation included. */
  word: string;
  /** The tapped letter, lower case. */
  letter: string;
  /** The word's box and the page area's vertical extent, in viewport coordinates. */
  anchor: Box;
  area: Area;
}

interface SelectionPeek {
  /** The selected text, which is English because the page's text is Latin underneath (READ-002). */
  text: string;
  /** The boxes of the selection's first and last lines, in viewport coordinates. */
  first: Box;
  last: Box;
  area: Area;
}

const box = ({ left, top, width, height }: DOMRect): Box => ({ left, top, width, height });

function areaOf(node: Element | null): Area {
  const rect = node?.closest('.page-area')?.getBoundingClientRect();
  return rect ? { top: rect.top, bottom: rect.bottom } : { top: 0, bottom: window.innerHeight };
}

/** The word in the reading font with every occurrence of the tapped letter marked. */
function PeekWord({ word, letter }: { word: string; letter: string }) {
  return (
    <>
      {[...word].map((ch, i) =>
        ch.toLowerCase() === letter ? (
          <mark key={i} className="peek-letter">
            {ch}
          </mark>
        ) : (
          ch
        ),
      )}
    </>
  );
}

// @spec READ-001, READ-004, READ-008, READ-010, READ-011
export function PassagePage({ paragraphs, learnedSet, newestLetter, onPeek }: PassagePageProps) {
  const [peek, setPeek] = useState<Peek | null>(null);
  const [selected, setSelected] = useState<SelectionPeek | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const page = useRef<HTMLDivElement>(null);
  const popover = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Selection X-ray: whatever is selected within the page is shown in English while the selection stands.
  useEffect(() => {
    function onSelectionChange() {
      const selection = document.getSelection();
      const text = selection?.toString().trim() ?? '';
      const anchor = selection?.anchorNode ?? null;
      if (!selection || selection.isCollapsed || !text || !anchor || !page.current?.contains(anchor)) {
        setSelected(null);
        return;
      }
      const rects = selection.getRangeAt(0).getClientRects();
      const empty: Box = { left: 0, top: 0, width: 0, height: 0 };
      const first = rects.length ? box(rects[0]) : empty;
      const last = rects.length ? box(rects[rects.length - 1]) : empty;
      setSelected({ text, first, last, area: areaOf(page.current) });
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  // The popover's size is known only once it renders, so it is placed just before the frame shows.
  useLayoutEffect(() => {
    const el = popover.current;
    if (!el) return;
    const size = el.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const place = selected
      ? selectionPlacement(selected.first, selected.last, size, viewport, selected.area)
      : peek
        ? peekPlacement(peek.anchor, size, viewport, peek.area)
        : null;
    if (!place) return;
    el.style.left = `${place.left}px`;
    el.style.top = `${place.top}px`;
  }, [peek, selected]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const glyph = (event.target as Element).closest('.g');
    if (!glyph) return;
    event.stopPropagation();
    const letter = (glyph.textContent ?? '').toLowerCase();
    const wordEl = glyph.closest('[role="img"]');
    const word = wordEl?.getAttribute('aria-label') ?? glyph.textContent ?? '';

    onPeek(letter);
    setPeek({ word, letter, anchor: box((wordEl ?? glyph).getBoundingClientRect()), area: areaOf(glyph) });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeek(null), PEEK_MS);
  }

  return (
    <div className="passage-page" ref={page} onClick={handleClick}>
      {paragraphs.map((text, i) => (
        <p key={i}>
          <Substituted text={text} letters={learnedSet} highlight={newestLetter} />
        </p>
      ))}
      {selected ? (
        <div role="tooltip" className="peek peek-selection" ref={popover}>
          {selected.text}
        </div>
      ) : (
        peek && (
          <div role="tooltip" className="peek" ref={popover}>
            <PeekWord word={peek.word} letter={peek.letter} />
          </div>
        )
      )}
    </div>
  );
}
