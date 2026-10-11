import { pageBlocks, pageIndexFor, paginate, type Fits } from './paginate';

const paragraphs = ['a b c', 'd e', 'f g h i'];

/** A page holds at most n words. */
const capacity =
  (n: number): Fits =>
  (blocks) =>
    blocks.join(' ').split(/\s+/).filter(Boolean).length <= n;

const allWords = (ps: readonly string[]) => ps.join(' ').split(/\s+/).filter(Boolean);

describe('paginate', () => {
  // @spec TEXT-003
  it('fills pages with whole paragraphs while they fit', () => {
    const pages = paginate(paragraphs, capacity(5));

    expect(pages).toEqual([
      { start: { paragraph: 0, word: 0 }, end: { paragraph: 2, word: 0 } },
      { start: { paragraph: 2, word: 0 }, end: { paragraph: 3, word: 0 } },
    ]);
    expect(pageBlocks(paragraphs, pages[0])).toEqual(['a b c', 'd e']);
  });

  // @spec TEXT-003
  it('splits a paragraph that does not fit at a word boundary', () => {
    const pages = paginate(paragraphs, capacity(2));

    expect(pages).toHaveLength(5);
    expect(pages.map((p) => pageBlocks(paragraphs, p))).toEqual([['a b'], ['c', 'd'], ['e', 'f'], ['g h'], ['i']]);
  });

  // @spec TEXT-003
  it('covers every word exactly once, in order, at any capacity', () => {
    for (const n of [1, 2, 3, 4, 5, 9, 50]) {
      const pages = paginate(paragraphs, capacity(n));
      const covered = pages.flatMap((p) => allWords(pageBlocks(paragraphs, p)));
      expect(covered).toEqual(allWords(paragraphs));
    }
  });

  // @spec TEXT-003
  it('places a word too large for an empty page alone, so pagination always advances', () => {
    const fiveChars: Fits = (blocks) => blocks.join(' ').length <= 5;
    const ps = ['supercalifragilistic tiny'];

    const pages = paginate(ps, fiveChars);

    expect(pages.map((p) => pageBlocks(ps, p))).toEqual([['supercalifragilistic'], ['tiny']]);
  });
});

describe('pageIndexFor', () => {
  const small = paginate(paragraphs, capacity(2)); // starts: {0,0} {0,2} {1,1} {2,1} {2,3}

  // @spec TEXT-004
  it('finds the page containing a position', () => {
    expect(pageIndexFor(small, { paragraph: 0, word: 0 })).toBe(0);
    expect(pageIndexFor(small, { paragraph: 1, word: 0 })).toBe(1);
    expect(pageIndexFor(small, { paragraph: 1, word: 1 })).toBe(2);
    expect(pageIndexFor(small, { paragraph: 2, word: 3 })).toBe(4);
  });

  // @spec TEXT-004
  it('keeps the learner on their place after re-pagination', () => {
    const learnerAt = small[3].start; // {2,1}: the "g" in "f g h i"
    const bigger = paginate(paragraphs, capacity(5));

    const index = pageIndexFor(bigger, learnerAt);

    expect(index).toBe(1);
    expect(pageBlocks(paragraphs, bigger[index]).join(' ')).toContain('g');
  });

  // @spec TEXT-004
  it('clamps a position past the end to the last page', () => {
    expect(pageIndexFor(small, { paragraph: 9, word: 0 })).toBe(4);
  });
});
