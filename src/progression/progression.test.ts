import { FREQUENCY_ORDER } from '../alphabet/alphabet';
import {
  initialProgress,
  nextLetter,
  progressReducer,
  readinessSignals,
  showIntro,
  validateProgress,
  visibleHint,
  type ProgressEvent,
  type ProgressState,
} from './progression';

const ORDER = FREQUENCY_ORDER;

function run(events: ProgressEvent[], from: ProgressState = initialProgress): ProgressState {
  return events.reduce(progressReducer, from);
}

const advance: ProgressEvent = { type: 'advance', order: ORDER };
const pageRead: ProgressEvent = { type: 'pageRead' };
const peek = (letter: string): ProgressEvent => ({ type: 'peek', letter });
const quiz = (letter: string, ...results: boolean[]): ProgressEvent => ({
  type: 'quizAnswers',
  answers: results.map((correct) => ({ letter, correct })),
});

describe('order and advancing', () => {
  // @spec PROG-001
  it('introduces letters in the alphabet order, starting from English frequency order', () => {
    expect(run([advance]).learned).toEqual(['e']);
    expect(run([advance, advance, advance]).learned).toEqual(['e', 't', 'a']);
  });

  // @spec PROG-002
  it('adds exactly one letter per advance', () => {
    const before = run([advance, advance]);
    expect(progressReducer(before, advance).learned).toHaveLength(before.learned.length + 1);
  });

  // @spec PROG-010
  it('allows advancing at any time, with or without a readiness hint', () => {
    const justAdvanced = run([advance]);
    expect(visibleHint(justAdvanced)).toEqual([]);
    expect(progressReducer(justAdvanced, advance).learned).toEqual(['e', 't']);
  });

  // @spec PROG-013
  it('stops advancing and shows no hint once every letter is learned', () => {
    const all = run(ORDER.map(() => advance));
    expect(all.learned).toHaveLength(26);
    expect(nextLetter(all, ORDER)).toBeNull();
    expect(progressReducer(all, advance)).toBe(all);

    const withSignals = run([pageRead, pageRead, quiz('z', true, true, true, true, true)], all);
    expect(readinessSignals(withSignals)).toEqual({ reading: true, quiz: true });
    expect(visibleHint(withSignals)).toEqual([]);
  });
});

describe('readiness hint: reading signal', () => {
  // @spec PROG-004
  it('does not fire right after a letter is introduced', () => {
    expect(readinessSignals(run([advance])).reading).toBe(false);
    expect(readinessSignals(run([advance, pageRead])).reading).toBe(false);
  });

  // @spec PROG-004
  it('fires after 2 pages read since introduction with fewer than 2 peeks on the newest letter', () => {
    const state = run([advance, peek('e'), pageRead, pageRead]);
    expect(readinessSignals(state).reading).toBe(true);
    expect(visibleHint(state)).toEqual(['reading']);
  });

  // @spec PROG-004
  it('does not fire with 2 or more peeks on the newest letter over the last 2 pages', () => {
    const state = run([advance, peek('e'), pageRead, peek('e'), pageRead]);
    expect(readinessSignals(state).reading).toBe(false);
  });

  // @spec PROG-004
  it('only counts the last 2 pages read', () => {
    const state = run([advance, peek('e'), peek('e'), peek('e'), pageRead, pageRead, peek('e'), pageRead]);
    expect(readinessSignals(state).reading).toBe(true);
  });

  // @spec PROG-004
  it('counts only peeks on the newest letter', () => {
    const state = run([advance, advance, peek('e'), peek('e'), pageRead, peek('e'), pageRead]);
    expect(readinessSignals(state).reading).toBe(true);
  });

  // @spec PROG-004
  it('ignores pages read before the newest letter was introduced', () => {
    const state = run([advance, pageRead, pageRead, advance]);
    expect(readinessSignals(state).reading).toBe(false);
  });
});

describe('readiness hint: quiz signal', () => {
  // @spec PROG-008
  it('fires when at least 4 of the last 5 quiz answers on the newest letter are correct', () => {
    expect(readinessSignals(run([advance, advance, quiz('t', true, true, false, true, true)])).quiz).toBe(true);
    expect(readinessSignals(run([advance, advance, quiz('t', true, true, true, true)])).quiz).toBe(true);
    expect(visibleHint(run([advance, advance, quiz('t', true, true, true, true)]))).toEqual(['quiz']);
  });

  // @spec PROG-008
  it('does not fire with fewer than 4 correct, or on answers about an older letter', () => {
    expect(readinessSignals(run([advance, advance, quiz('t', true, true, false, false, true)])).quiz).toBe(false);
    expect(readinessSignals(run([advance, advance, quiz('e', true, true, true, true, true)])).quiz).toBe(false);
  });

  // @spec PROG-009
  it('keeps the last 5 quiz answers per letter, newest last', () => {
    const state = run([advance, quiz('e', false, false, true), quiz('e', true, true, false, true)]);
    expect(state.quizByLetter.e).toEqual([true, true, true, false, true]);
  });
});

describe('readiness hint: combining and dismissing', () => {
  const bothSignals = [advance, pageRead, pageRead, quiz('e', true, true, true, true)];

  // @spec PROG-011
  it('shows one hint naming both signals when both hold', () => {
    expect(visibleHint(run(bothSignals))).toEqual(['reading', 'quiz']);
  });

  // @spec PROG-012
  it('hides a dismissed hint until the next advance', () => {
    const dismissed = run([advance, pageRead, pageRead, { type: 'dismissHint' }]);
    expect(visibleHint(dismissed)).toEqual([]);
    expect(visibleHint(run([pageRead], dismissed))).toEqual([]);
  });

  // @spec PROG-012
  it('shows the hint once more when the other signal later holds, naming only that signal', () => {
    const dismissedReading = run([advance, pageRead, pageRead, { type: 'dismissHint' }]);
    const quizArrives = run([quiz('e', true, true, true, true)], dismissedReading);
    expect(visibleHint(quizArrives)).toEqual(['quiz']);

    expect(visibleHint(progressReducer(quizArrives, { type: 'dismissHint' }))).toEqual([]);
  });

  // @spec PROG-012
  it('dismisses both signals when a hint naming both is dismissed', () => {
    expect(visibleHint(run([...bothSignals, { type: 'dismissHint' }]))).toEqual([]);
  });

  // @spec PROG-012
  it('clears dismissals when the learner advances', () => {
    const state = run([advance, pageRead, pageRead, { type: 'dismissHint' }, advance, pageRead, pageRead]);
    expect(visibleHint(state)).toEqual(['reading']);
  });
});

describe('peeks', () => {
  // @spec READ-004
  it('counts each peek against its letter', () => {
    const state = run([advance, advance, peek('e'), peek('t'), peek('e')]);
    expect(state.peeksByLetter).toEqual({ e: 2, t: 1 });
  });
});

describe('step back and reset', () => {
  // @spec PROG-005
  it('removes the newest letter and clears its peek count and quiz ring', () => {
    const state = run([advance, advance, peek('t'), peek('e'), quiz('t', true, false)]);

    const back = progressReducer(state, { type: 'stepBack' });

    expect(back.learned).toEqual(['e']);
    expect(back.peeksByLetter).toEqual({ e: 1 });
    expect(back.quizByLetter.t).toBeUndefined();
  });

  // @spec PROG-005
  it('re-adding a stepped-back letter starts it fresh, with no instant hint', () => {
    const state = run([advance, advance, quiz('t', true, true, true, true, true), { type: 'stepBack' }, advance]);
    expect(state.learned).toEqual(['e', 't']);
    expect(visibleHint(state)).toEqual([]);
  });

  // @spec PROG-005
  it('does nothing when no letter is learned', () => {
    expect(progressReducer(initialProgress, { type: 'stepBack' })).toBe(initialProgress);
  });

  // @spec PROG-006
  it('clears the learned set, all peek counts and all quiz rings on reset', () => {
    const state = run([advance, advance, peek('e'), peek('t'), quiz('e', true), quiz('t', false), pageRead]);

    const reset = progressReducer(state, { type: 'reset' });

    expect(reset.learned).toEqual([]);
    expect(reset.peeksByLetter).toEqual({});
    expect(reset.quizByLetter).toEqual({});
    expect(reset.newestPagePeeks).toEqual([]);
  });
});

describe('validateProgress', () => {
  const valid = run([advance, advance, peek('e'), quiz('t', true, false), pageRead, { type: 'completeIntro' }]);

  // @spec PERS-003, PERS-006
  it('accepts initial and real progress, including after a JSON round trip', () => {
    expect(validateProgress(initialProgress)).toBe(true);
    expect(validateProgress(JSON.parse(JSON.stringify(valid)))).toBe(true);
  });

  // @spec PERS-003, PERS-006
  it.each<[string, unknown]>([
    ['null', null],
    ['a missing field', { ...valid, welcomeSeen: undefined }],
    ['a repeated learned letter', { ...valid, learned: ['e', 'e'] }],
    ['a learned item that is not a letter a-z', { ...valid, learned: ['e', 'é'] }],
    ['a negative peek count', { ...valid, peeksByLetter: { e: -1 } }],
    ['a fractional peek count', { ...valid, peeksByLetter: { e: 1.5 } }],
    ['peeks on a letter not learned', { ...valid, peeksByLetter: { z: 1 } }],
    ['a quiz ring longer than 5', { ...valid, quizByLetter: { t: [true, true, true, true, true, true] } }],
    ['a quiz ring with non-booleans', { ...valid, quizByLetter: { t: [1] } }],
    ['an unknown hint signal', { ...valid, hintDismissedFor: ['vibes'] }],
    ['a negative page peek count', { ...valid, newestPagePeeks: [-1] }],
  ])('rejects %s', (_label, value) => {
    expect(validateProgress(value)).toBe(false);
  });
});

describe('first launch', () => {
  // @spec PROG-014
  it('starts with no letters learned and the intro to show', () => {
    expect(initialProgress.learned).toEqual([]);
    expect(showIntro(initialProgress)).toBe(true);
  });

  // @spec PROG-014
  it('shows the intro only once, even after a reset', () => {
    const seen = progressReducer(initialProgress, { type: 'completeIntro' });
    expect(showIntro(seen)).toBe(false);
    expect(showIntro(run([advance, { type: 'reset' }], seen))).toBe(false);
  });

  // @spec PROG-014
  it('does not show the intro once a letter is learned', () => {
    expect(showIntro(run([advance]))).toBe(false);
  });

  // @spec PROG-014, PERS-001
  it('keeps the completion flag under its stored name, so saved progress stays readable', () => {
    const seen = progressReducer(initialProgress, { type: 'completeIntro' });
    expect(seen.welcomeSeen).toBe(true);
    expect(validateProgress(JSON.parse(JSON.stringify(seen)))).toBe(true);
  });
});
