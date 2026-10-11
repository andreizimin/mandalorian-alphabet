import { comparePositions, pageIndexFor, type Page } from './paginate';
import type { Passage, Position } from './types';

export interface ContentState {
  currentId: string | null;
  positions: Readonly<Record<string, Position>>;
  /** Furthest point read per passage: the end of the furthest page counted as read. */
  furthest: Readonly<Record<string, Position>>;
  /** Pasted passages, newest first. */
  pasted: readonly Passage[];
}

export const initialContent: ContentState = { currentId: null, positions: {}, furthest: {}, pasted: [] };

const START: Position = { paragraph: 0, word: 0 };

function omit<T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> {
  const { [key]: _removed, ...rest } = record;
  return rest;
}

// @spec TEXT-005
export function resolveCurrentId(state: ContentState, bundled: readonly Passage[]): string {
  const known = (id: string) => bundled.some((p) => p.id === id) || state.pasted.some((p) => p.id === id);
  return state.currentId && known(state.currentId) ? state.currentId : bundled[0].id;
}

// @spec TEXT-006
export function positionOf(state: ContentState, id: string): Position {
  return state.positions[id] ?? START;
}

// @spec TEXT-006
export function openPassage(state: ContentState, id: string): ContentState {
  return state.currentId === id ? state : { ...state, currentId: id };
}

// @spec TEXT-002
export function addPasted(state: ContentState, passage: Passage): ContentState {
  return { ...state, pasted: [passage, ...state.pasted], currentId: passage.id };
}

// @spec TEXT-009
export function deletePasted(state: ContentState, id: string, firstBundledId: string): ContentState {
  if (!state.pasted.some((p) => p.id === id)) return state;
  return {
    currentId: state.currentId === id ? firstBundledId : state.currentId,
    pasted: state.pasted.filter((p) => p.id !== id),
    positions: omit(state.positions, id),
    furthest: omit(state.furthest, id),
  };
}

export interface ForwardResult {
  state: ContentState;
  /** The page left counts as read for progression (TEXT-011). */
  pageRead: boolean;
  /** The turn was on the last page; show the end card (TEXT-012). */
  ended: boolean;
}

// @spec TEXT-010, TEXT-011, TEXT-012
export function turnForward(state: ContentState, id: string, pages: readonly Page[]): ForwardResult {
  const index = pageIndexFor(pages, positionOf(state, id));
  const page = pages[index];
  const furthest = state.furthest[id] ?? START;
  const pageRead = comparePositions(page.end, furthest) > 0;
  const ended = index === pages.length - 1;

  let next = state;
  if (pageRead) next = { ...next, furthest: { ...next.furthest, [id]: page.end } };
  if (!ended) next = { ...next, positions: { ...next.positions, [id]: pages[index + 1].start } };
  return { state: next, pageRead, ended };
}

// @spec TEXT-010
export function turnBack(state: ContentState, id: string, pages: readonly Page[]): ContentState {
  const index = pageIndexFor(pages, positionOf(state, id));
  if (index === 0) return state;
  return { ...state, positions: { ...state.positions, [id]: pages[index - 1].start } };
}

// @spec TEXT-012
export function nextBundledId(bundled: readonly Passage[], currentId: string): string {
  const index = bundled.findIndex((p) => p.id === currentId);
  return bundled[(index + 1) % bundled.length].id;
}

const isCount = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isPosition = (v: unknown) => isRecord(v) && isCount(v.paragraph) && isCount(v.word);
const isPastedPassage = (v: unknown) =>
  isRecord(v) &&
  typeof v.id === 'string' &&
  typeof v.title === 'string' &&
  v.source === 'pasted' &&
  Array.isArray(v.paragraphs) &&
  v.paragraphs.length > 0 &&
  v.paragraphs.every((p) => typeof p === 'string');

/** Checks a value restored from storage or an import against the content shape. */
// @spec PERS-003, PERS-006
export function validateContent(value: unknown): value is ContentState {
  if (!isRecord(value)) return false;
  const { currentId, positions, furthest, pasted } = value;
  return (
    (currentId === null || typeof currentId === 'string') &&
    isRecord(positions) &&
    Object.values(positions).every(isPosition) &&
    isRecord(furthest) &&
    Object.values(furthest).every(isPosition) &&
    Array.isArray(pasted) &&
    pasted.every(isPastedPassage)
  );
}
