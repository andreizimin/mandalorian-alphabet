import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Substituted } from './Substituted';

export const PEEK_MS = 1500;

interface PassagePageProps {
  paragraphs: readonly string[];
  learnedSet: ReadonlySet<string>;
  onPeek: (letter: string) => void;
  /** Wired by the layout segment (LAYOUT-007); glyph taps never call it. */
  onPageTurn?: () => void;
}

// @spec READ-001, READ-004
export function PassagePage({ paragraphs, learnedSet, onPeek }: PassagePageProps) {
  const [peek, setPeek] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const glyph = (event.target as Element).closest('.g');
    if (!glyph) return;
    event.stopPropagation();
    const letter = glyph.textContent ?? '';
    onPeek(letter.toLowerCase());
    setPeek(letter);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPeek(null), PEEK_MS);
  }

  return (
    <div className="passage-page" onClick={handleClick}>
      {paragraphs.map((text, i) => (
        <p key={i}>
          <Substituted text={text} letters={learnedSet} />
        </p>
      ))}
      {peek && (
        <div role="tooltip" className="peek">
          {peek}
        </div>
      )}
    </div>
  );
}
