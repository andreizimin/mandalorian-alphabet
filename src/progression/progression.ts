export type Signal = 'reading' | 'quiz';

export interface QuizAnswerRecord {
  letter: string;
  correct: boolean;
}

export interface ProgressState {
  /** Learned letters in the order they were added; the last is the newest. */
  learned: readonly string[];
  peeksByLetter: Readonly<Record<string, number>>;
  /** Peeks on the newest letter, one entry per page read since it was introduced. */
  newestPagePeeks: readonly number[];
  /** Peeks on the newest letter on the page being read. */
  currentPagePeeks: number;
  /** Last answers per letter, newest last. */
  quizByLetter: Readonly<Record<string, readonly boolean[]>>;
  hintDismissedFor: readonly Signal[];
  welcomeSeen: boolean;
}

export type ProgressEvent =
  | { type: 'advance'; order: readonly string[] }
  | { type: 'stepBack' }
  | { type: 'reset' }
  | { type: 'peek'; letter: string }
  | { type: 'pageRead' }
  | { type: 'quizAnswers'; answers: readonly QuizAnswerRecord[] }
  | { type: 'dismissHint' }
  | { type: 'dismissWelcome' };

export interface Thresholds {
  readingPages: number;
  maxPeeks: number;
  quizWindow: number;
  quizCorrect: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  readingPages: 2,
  maxPeeks: 2,
  quizWindow: 5,
  quizCorrect: 4,
};

export const initialProgress: ProgressState = {
  learned: [],
  peeksByLetter: {},
  newestPagePeeks: [],
  currentPagePeeks: 0,
  quizByLetter: {},
  hintDismissedFor: [],
  welcomeSeen: false,
};

const freshNewestLetter = {
  newestPagePeeks: [],
  currentPagePeeks: 0,
  hintDismissedFor: [],
} satisfies Partial<ProgressState>;

function omit<T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> {
  const { [key]: _removed, ...rest } = record;
  return rest;
}

// @spec PROG-001, PROG-013
export function nextLetter(state: ProgressState, order: readonly string[]): string | null {
  return order.find((letter) => !state.learned.includes(letter)) ?? null;
}

// @spec PROG-002, PROG-005, PROG-006, PROG-009, PROG-012, READ-004
export function progressReducer(state: ProgressState, event: ProgressEvent): ProgressState {
  switch (event.type) {
    case 'advance': {
      const letter = nextLetter(state, event.order);
      if (!letter) return state;
      return { ...state, ...freshNewestLetter, learned: [...state.learned, letter] };
    }
    case 'stepBack': {
      const newest = state.learned.at(-1);
      if (!newest) return state;
      return {
        ...state,
        ...freshNewestLetter,
        learned: state.learned.slice(0, -1),
        peeksByLetter: omit(state.peeksByLetter, newest),
        quizByLetter: omit(state.quizByLetter, newest),
      };
    }
    case 'reset':
      return { ...initialProgress, welcomeSeen: state.welcomeSeen };
    case 'peek': {
      if (!state.learned.includes(event.letter)) return state;
      return {
        ...state,
        peeksByLetter: { ...state.peeksByLetter, [event.letter]: (state.peeksByLetter[event.letter] ?? 0) + 1 },
        currentPagePeeks: state.currentPagePeeks + (event.letter === state.learned.at(-1) ? 1 : 0),
      };
    }
    case 'pageRead':
      if (state.learned.length === 0) return state;
      return { ...state, newestPagePeeks: [...state.newestPagePeeks, state.currentPagePeeks], currentPagePeeks: 0 };
    case 'quizAnswers': {
      const quizByLetter = { ...state.quizByLetter };
      for (const { letter, correct } of event.answers) {
        quizByLetter[letter] = [...(quizByLetter[letter] ?? []), correct].slice(-DEFAULT_THRESHOLDS.quizWindow);
      }
      return { ...state, quizByLetter };
    }
    case 'dismissHint': {
      const shown = visibleHint(state);
      if (shown.length === 0) return state;
      return { ...state, hintDismissedFor: [...state.hintDismissedFor, ...shown] };
    }
    case 'dismissWelcome':
      return state.welcomeSeen ? state : { ...state, welcomeSeen: true };
  }
}

// @spec PROG-004, PROG-008
export function readinessSignals(
  state: ProgressState,
  t: Thresholds = DEFAULT_THRESHOLDS,
): Record<Signal, boolean> {
  const newest = state.learned.at(-1);
  if (!newest) return { reading: false, quiz: false };

  const pages = state.newestPagePeeks;
  const recentPeeks = pages.slice(-t.readingPages).reduce((sum, n) => sum + n, 0);
  const reading = pages.length >= t.readingPages && recentPeeks < t.maxPeeks;

  const answers = (state.quizByLetter[newest] ?? []).slice(-t.quizWindow);
  const quiz = answers.filter(Boolean).length >= t.quizCorrect;

  return { reading, quiz };
}

/** Signals the hint should name right now; empty means no hint. */
// @spec PROG-011, PROG-012, PROG-013
export function visibleHint(state: ProgressState, t: Thresholds = DEFAULT_THRESHOLDS): Signal[] {
  if (state.learned.length === 26) return [];
  const signals = readinessSignals(state, t);
  return (['reading', 'quiz'] as const).filter((s) => signals[s] && !state.hintDismissedFor.includes(s));
}

const isLetter = (v: unknown): v is string => typeof v === 'string' && /^[a-z]$/.test(v);
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Checks a value restored from storage or an import against the progress shape. */
// @spec PERS-003, PERS-006
export function validateProgress(value: unknown): value is ProgressState {
  if (!isRecord(value)) return false;
  const { learned, peeksByLetter, newestPagePeeks, currentPagePeeks, quizByLetter, hintDismissedFor, welcomeSeen } =
    value;

  if (!Array.isArray(learned) || !learned.every(isLetter) || new Set(learned).size !== learned.length) return false;
  if (!isRecord(peeksByLetter)) return false;
  if (!Object.entries(peeksByLetter).every(([k, n]) => learned.includes(k) && isCount(n))) return false;
  if (!Array.isArray(newestPagePeeks) || !newestPagePeeks.every(isCount)) return false;
  if (!isCount(currentPagePeeks)) return false;
  if (!isRecord(quizByLetter)) return false;
  const ringOk = (ring: unknown) =>
    Array.isArray(ring) && ring.length <= DEFAULT_THRESHOLDS.quizWindow && ring.every((a) => typeof a === 'boolean');
  if (!Object.entries(quizByLetter).every(([k, ring]) => isLetter(k) && ringOk(ring))) return false;
  if (!Array.isArray(hintDismissedFor) || !hintDismissedFor.every((s) => s === 'reading' || s === 'quiz')) return false;
  return typeof welcomeSeen === 'boolean';
}

// @spec PROG-014
export function showWelcome(state: ProgressState): boolean {
  return !state.welcomeSeen && state.learned.length === 0;
}
