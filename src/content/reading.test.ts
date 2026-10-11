import { paginate, type Fits } from './paginate';
import {
  addPasted,
  deletePasted,
  initialContent,
  nextBundledId,
  openPassage,
  positionOf,
  resolveCurrentId,
  turnBack,
  turnForward,
  validateContent,
  type ContentState,
} from './reading';
import type { Passage } from './types';

const bundled: Passage[] = [
  { id: 'wild', title: 'The Call of the Wild', source: 'bundled', paragraphs: ['a b c', 'd e', 'f g h i'] },
  { id: 'island', title: 'Treasure Island', source: 'bundled', paragraphs: ['x y z'] },
  { id: 'worlds', title: 'The War of the Worlds', source: 'bundled', paragraphs: ['q r s'] },
];
const fiveWords: Fits = (blocks) => blocks.join(' ').split(/\s+/).filter(Boolean).length <= 5;
const pages = paginate(bundled[0].paragraphs, fiveWords); // page 0: {0,0}-{2,0}; page 1: {2,0}-{3,0}
const pasted = (id: string, title = 'My text'): Passage => ({ id, title, source: 'pasted', paragraphs: ['hello there'] });

describe('opening passages', () => {
  // @spec TEXT-005
  it('opens the first bundled passage when there is no current passage', () => {
    expect(resolveCurrentId(initialContent, bundled)).toBe('wild');
  });

  // @spec TEXT-005
  it('falls back to the first bundled passage when the current one no longer exists', () => {
    expect(resolveCurrentId({ ...initialContent, currentId: 'gone' }, bundled)).toBe('wild');
  });

  // @spec TEXT-006
  it('reopens a passage at the last position read in it, or at its start', () => {
    const { state } = turnForward(openPassage(initialContent, 'wild'), 'wild', pages);
    const elsewhere = openPassage(state, 'island');

    expect(positionOf(openPassage(elsewhere, 'wild'), 'wild')).toEqual({ paragraph: 2, word: 0 });
    expect(positionOf(elsewhere, 'island')).toEqual({ paragraph: 0, word: 0 });
  });
});

describe('pasted passages', () => {
  // @spec TEXT-002
  it('saves pasted text as a new passage, newest first, and opens it', () => {
    const one = addPasted(initialContent, pasted('p1', 'First'));
    const two = addPasted(one, pasted('p2', 'Second'));

    expect(two.pasted.map((p) => p.id)).toEqual(['p2', 'p1']);
    expect(two.currentId).toBe('p2');
  });

  // @spec TEXT-009
  it('deletes a pasted passage with its reading position', () => {
    const state = addPasted(addPasted(initialContent, pasted('p1')), pasted('p2'));
    const read = turnForward(state, 'p1', pages).state;

    const after = deletePasted(read, 'p1', 'wild');

    expect(after.pasted.map((p) => p.id)).toEqual(['p2']);
    expect(after.positions.p1).toBeUndefined();
    expect(after.furthest.p1).toBeUndefined();
    expect(after.currentId).toBe('p2');
  });

  // @spec TEXT-009
  it('opens the first bundled passage when the passage being read is deleted', () => {
    const state = addPasted(initialContent, pasted('p1'));
    expect(deletePasted(state, 'p1', 'wild').currentId).toBe('wild');
  });

  // @spec TEXT-009
  it('never deletes a bundled passage', () => {
    const state = openPassage(initialContent, 'wild');
    expect(deletePasted(state, 'wild', 'wild')).toBe(state);
  });
});

describe('page turns', () => {
  const start = openPassage(initialContent, 'wild');

  // @spec TEXT-010
  it('moves forward to the next page and back to the previous one', () => {
    const forward = turnForward(start, 'wild', pages).state;
    expect(positionOf(forward, 'wild')).toEqual({ paragraph: 2, word: 0 });

    const back = turnBack(forward, 'wild', pages);
    expect(positionOf(back, 'wild')).toEqual({ paragraph: 0, word: 0 });
  });

  // @spec TEXT-010
  it('does nothing when turning back on the first page', () => {
    expect(turnBack(start, 'wild', pages)).toBe(start);
  });

  // @spec TEXT-011
  it('counts a page read only when moving past the furthest point reached', () => {
    const first = turnForward(start, 'wild', pages);
    expect(first.pageRead).toBe(true);

    const back = turnBack(first.state, 'wild', pages);
    const again = turnForward(back, 'wild', pages);
    expect(again.pageRead).toBe(false);
  });

  // @spec TEXT-012
  it('ends the passage on a forward turn from the last page, counting that page once', () => {
    const onLast = turnForward(start, 'wild', pages).state;

    const end = turnForward(onLast, 'wild', pages);
    expect(end).toMatchObject({ ended: true, pageRead: true });
    expect(positionOf(end.state, 'wild')).toEqual({ paragraph: 2, word: 0 });

    expect(turnForward(end.state, 'wild', pages)).toMatchObject({ ended: true, pageRead: false });
  });

  // @spec TEXT-012
  it('reports no end on a forward turn before the last page', () => {
    expect(turnForward(start, 'wild', pages).ended).toBe(false);
  });

  // @spec TEXT-012
  it('offers the next bundled passage, wrapping to the first', () => {
    expect(nextBundledId(bundled, 'wild')).toBe('island');
    expect(nextBundledId(bundled, 'worlds')).toBe('wild');
    expect(nextBundledId(bundled, 'pasted-1')).toBe('wild');
  });
});

describe('validateContent', () => {
  const real: ContentState = turnForward(addPasted(initialContent, pasted('p1')), 'p1', pages).state;

  // @spec PERS-003, PERS-006
  it('accepts initial and real content, including after a JSON round trip', () => {
    expect(validateContent(initialContent)).toBe(true);
    expect(validateContent(JSON.parse(JSON.stringify(real)))).toBe(true);
  });

  // @spec PERS-003, PERS-006
  it.each<[string, unknown]>([
    ['null', null],
    ['a current id that is not a string', { ...real, currentId: 7 }],
    ['a fractional position', { ...real, positions: { p1: { paragraph: 0.5, word: 0 } } }],
    ['a negative position', { ...real, furthest: { p1: { paragraph: 0, word: -1 } } }],
    ['a pasted passage marked bundled', { ...real, pasted: [{ ...pasted('p9'), source: 'bundled' }] }],
    ['a pasted passage with no paragraphs', { ...real, pasted: [{ ...pasted('p9'), paragraphs: [] }] }],
    ['a pasted passage with a non-string paragraph', { ...real, pasted: [{ ...pasted('p9'), paragraphs: [1] }] }],
  ])('rejects %s', (_label, value) => {
    expect(validateContent(value)).toBe(false);
  });
});
