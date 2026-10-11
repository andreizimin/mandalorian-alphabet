import type { Position } from './types';

/** Whether a candidate page, given as one text block per paragraph fragment, fits the reading area. */
export type Fits = (blocks: string[]) => boolean;

/** A page runs from `start` up to, not including, `end`. */
export interface Page {
  start: Position;
  end: Position;
}

export function comparePositions(a: Position, b: Position): number {
  return a.paragraph - b.paragraph || a.word - b.word;
}

const wordsOf = (paragraph: string) => paragraph.split(' ').filter(Boolean);

function normalize(pos: Position, words: readonly string[][]): Position {
  return pos.word >= words[pos.paragraph].length ? { paragraph: pos.paragraph + 1, word: 0 } : pos;
}

// @spec TEXT-003
export function paginate(paragraphs: readonly string[], fits: Fits): Page[] {
  const words = paragraphs.map(wordsOf);
  const pages: Page[] = [];
  let start: Position = { paragraph: 0, word: 0 };

  while (start.paragraph < words.length) {
    const blocks: string[] = [];
    let cursor = start;

    while (cursor.paragraph < words.length) {
      const rest = words[cursor.paragraph].slice(cursor.word);
      if (fits([...blocks, rest.join(' ')])) {
        blocks.push(rest.join(' '));
        cursor = { paragraph: cursor.paragraph + 1, word: 0 };
        continue;
      }
      // Largest prefix of the remaining words that still fits.
      let lo = 0;
      let hi = rest.length - 1;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (fits([...blocks, rest.slice(0, mid).join(' ')])) lo = mid;
        else hi = mid - 1;
      }
      if (lo > 0) cursor = { paragraph: cursor.paragraph, word: cursor.word + lo };
      else if (blocks.length === 0) cursor = normalize({ ...cursor, word: cursor.word + 1 }, words);
      break;
    }

    pages.push({ start, end: cursor });
    start = cursor;
  }
  return pages;
}

export function pageBlocks(paragraphs: readonly string[], page: Page): string[] {
  const blocks: string[] = [];
  for (let p = page.start.paragraph; p <= page.end.paragraph && p < paragraphs.length; p++) {
    const words = wordsOf(paragraphs[p]);
    const from = p === page.start.paragraph ? page.start.word : 0;
    const to = p === page.end.paragraph ? page.end.word : words.length;
    if (to > from) blocks.push(words.slice(from, to).join(' '));
  }
  return blocks;
}

// @spec TEXT-004
export function pageIndexFor(pages: readonly Page[], position: Position): number {
  let index = 0;
  pages.forEach((page, i) => {
    if (comparePositions(page.start, position) <= 0) index = i;
  });
  return index;
}
