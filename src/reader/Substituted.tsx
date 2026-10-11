import type { ReactNode } from 'react';

const ASCII_LETTER = /^[a-z]$/i;

function isGlyph(ch: string, letters: ReadonlySet<string>) {
  return ASCII_LETTER.test(ch) && letters.has(ch.toLowerCase());
}

function renderWord(word: string, letters: ReadonlySet<string>, key: number): ReactNode {
  if (![...word].some((ch) => isGlyph(ch, letters))) return word;

  return (
    <span key={key} role="img" aria-label={word}>
      {[...word].map((ch, i) =>
        isGlyph(ch, letters) ? (
          <span key={i} className="g" aria-hidden="true">
            {ch}
          </span>
        ) : (
          ch
        ),
      )}
    </span>
  );
}

/**
 * Renders text with the given letters drawn in the Mandalorian font. The DOM
 * text stays Latin with its original case; both cases of a letter get a glyph.
 */
// @spec READ-002, READ-003, READ-005, READ-006, READ-007
export function Substituted({ text, letters }: { text: string; letters: ReadonlySet<string> }) {
  const parts = text.split(/(\s+)/);
  return <>{parts.map((part, i) => (/^\s*$/.test(part) ? part : renderWord(part, letters, i)))}</>;
}
