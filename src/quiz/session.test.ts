import { FREQUENCY_ORDER } from '../alphabet/alphabet';
import { mulberry32 } from './rng';
import {
  SESSION_LENGTH,
  generateSession,
  missedLetters,
  qualifyingWords,
  recordAnswers,
  targetsLetter,
  type Question,
  type SessionInput,
} from './session';
import { EVERYDAY_WORDS, GALAXY_WORDS } from './wordPool';

const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1);
const first = (n: number) => FREQUENCY_ORDER.slice(0, n);

function input(learned: readonly string[], overrides: Partial<SessionInput> = {}): Omit<SessionInput, 'rng'> {
  return { learned, quizByLetter: {}, order: FREQUENCY_ORDER, everyday: EVERYDAY_WORDS, galaxy: GALAXY_WORDS, ...overrides };
}

function sessions(base: Omit<SessionInput, 'rng'>): Question[][] {
  return SEEDS.map((seed) => generateSession({ ...base, rng: mulberry32(seed) }));
}

const isWord = (q: Question) => q.type === 'mando-to-english' || q.type === 'english-to-mando';
const LEARNED_STATES = [first(2), first(3), first(4), first(5), first(10), first(26), [...first(4), 'q']];

describe('session shape', () => {
  // @spec QUIZ-004
  it('has exactly 10 questions, each with 4 distinct choices and exactly one correct', () => {
    for (const learned of LEARNED_STATES) {
      for (const session of sessions(input(learned))) {
        expect(session).toHaveLength(SESSION_LENGTH);
        for (const q of session) {
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices).size).toBe(4);
          expect(q.choices.filter((c) => c === q.answer)).toHaveLength(1);
        }
      }
    }
  });

  // @spec QUIZ-014
  it('never shows the same prompt twice in a row', () => {
    for (const learned of LEARNED_STATES) {
      for (const session of sessions(input(learned))) {
        session.slice(1).forEach((q, i) => {
          expect(`${q.type}:${q.prompt}`).not.toBe(`${session[i].type}:${session[i].prompt}`);
        });
      }
    }
  });
});

describe('question types and mix', () => {
  // @spec QUIZ-008
  it('asks glyph-to-letter and letter-to-glyph questions about learned letters', () => {
    const all = sessions(input(first(2))).flat();
    expect(new Set(all.map((q) => q.type))).toEqual(new Set(['glyph-to-letter', 'letter-to-glyph']));
    for (const q of all) {
      expect(first(2)).toContain(q.prompt);
      expect(q.answer).toBe(q.prompt);
    }
  });

  // @spec QUIZ-009
  it('asks only letter questions while fewer than 8 pool words qualify', () => {
    expect(qualifyingWords(first(3), [...EVERYDAY_WORDS, ...GALAXY_WORDS]).length).toBeLessThan(8);
    for (const learned of [first(2), first(3)]) {
      expect(sessions(input(learned)).flat().some(isWord)).toBe(false);
    }
  });

  // @spec QUIZ-010
  it('makes about half the session word questions once 8 words qualify, all fully learned', () => {
    for (const learned of [first(4), first(10), first(26)]) {
      for (const session of sessions(input(learned))) {
        const words = session.filter(isWord);
        expect(words.length).toBeGreaterThanOrEqual(4);
        expect(words.length).toBeLessThanOrEqual(6);
        for (const q of words) {
          for (const choice of q.choices) expect([...choice].every((c) => learned.includes(c))).toBe(true);
          expect(q.prompt).toBe(q.answer); // the same word, shown in glyphs on one side and Latin on the other
        }
      }
    }
  });

  // @spec QUIZ-011
  it('targets the newest letter in at least 3 questions', () => {
    for (const learned of LEARNED_STATES) {
      const newest = learned.at(-1)!;
      for (const session of sessions(input(learned))) {
        expect(session.filter((q) => targetsLetter(q, newest)).length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  // @spec QUIZ-012
  it('uses letter questions for the newest letter when no qualifying word contains it', () => {
    const learned = [...first(4), 'q'];
    expect(qualifyingWords(learned, [...EVERYDAY_WORDS, ...GALAXY_WORDS]).some((w) => w.includes('q'))).toBe(false);
    for (const session of sessions(input(learned))) {
      const onQ = session.filter((q) => targetsLetter(q, 'q'));
      expect(onQ.length).toBeGreaterThanOrEqual(3);
      expect(onQ.every((q) => !isWord(q))).toBe(true);
    }
  });

  // @spec QUIZ-013
  it('weights other letters toward low recent accuracy, with too few answers weighted highest', () => {
    const learned = first(5); // e t a o i; newest i
    const ring = (correct: boolean) => Array<boolean>(5).fill(correct);
    const base = input(learned, { quizByLetter: { e: ring(true), a: ring(true), o: ring(false) } }); // t has none

    const counts: Record<string, number> = {};
    for (const session of sessions(base)) {
      for (const q of session.slice(0)) if (q.target !== 'i') counts[q.target] = (counts[q.target] ?? 0) + 1;
    }

    expect(counts.o).toBeGreaterThan(counts.e * 2);
    expect(counts.t).toBeGreaterThan(counts.a * 2);
  });
});

describe('choices', () => {
  // @spec QUIZ-015
  it('fills letter choices from the next unlearned letters while fewer than 4 are learned', () => {
    for (const q of sessions(input(first(2))).flat()) {
      for (const c of q.choices) expect(first(4)).toContain(c);
    }
    for (const q of sessions(input(first(3))).flat()) {
      for (const c of q.choices) expect(first(4)).toContain(c);
    }
  });

  // @spec QUIZ-015
  it('draws letter distractors only from the learned set once 4 or more are learned', () => {
    for (const learned of [first(4), first(10)]) {
      for (const q of sessions(input(learned)).flat().filter((x) => !isWord(x))) {
        for (const c of q.choices) expect(learned).toContain(c);
      }
    }
  });

  // @spec QUIZ-016
  it('uses same-length word distractors whenever 3 exist', () => {
    for (const learned of [first(4), first(10), first(26)]) {
      const pool = qualifyingWords(learned, [...EVERYDAY_WORDS, ...GALAXY_WORDS]);
      for (const q of sessions(input(learned)).flat().filter(isWord)) {
        const sameLength = pool.filter((w) => w !== q.answer && w.length === q.answer.length);
        for (const c of q.choices) expect(pool).toContain(c);
        if (sameLength.length >= 3) expect(q.choices.every((c) => c.length === q.answer.length)).toBe(true);
      }
    }
  });

  // @spec QUIZ-017
  it('never repeats an answer word in a session while 10 or more words qualify', () => {
    for (const learned of [first(10), first(26)]) {
      for (const session of sessions(input(learned))) {
        const answers = session.filter(isWord).map((q) => q.answer);
        expect(new Set(answers).size).toBe(answers.length);
      }
    }
  });

  // @spec QUIZ-018
  it('prefers galaxy words as answers while at least 4 qualify', () => {
    const learned = first(26);
    const galaxy = qualifyingWords(learned, GALAXY_WORDS);
    expect(galaxy.length).toBeGreaterThanOrEqual(4);
    for (const session of sessions(input(learned))) {
      const used = new Set<string>();
      for (const q of session.filter(isWord)) {
        const galaxyFits = galaxy.some((w) => w.includes(q.target) && !used.has(w));
        if (galaxyFits) expect(GALAXY_WORDS).toContain(q.answer);
        used.add(q.answer);
      }
    }
  });
});

describe('recording', () => {
  const letterQ: Question = { type: 'glyph-to-letter', target: 'e', prompt: 'e', answer: 'e', choices: ['e', 't', 'a', 'o'] };
  const wordQ: Question = {
    type: 'mando-to-english',
    target: 'e',
    prompt: 'teet',
    answer: 'teet',
    choices: ['teet', 'toot', 'tate', 'tote'],
  };

  // @spec QUIZ-023
  it('records one answer per letter question and one per distinct letter of a word answer', () => {
    expect(recordAnswers([letterQ, wordQ], ['t', 'teet'])).toEqual([
      { letter: 'e', correct: false },
      { letter: 't', correct: true },
      { letter: 'e', correct: true },
    ]);
  });

  // @spec QUIZ-023
  it('records a miss for every letter of a word answered wrongly', () => {
    expect(recordAnswers([wordQ], ['toot'])).toEqual([
      { letter: 't', correct: false },
      { letter: 'e', correct: false },
    ]);
  });

  // @spec QUIZ-021
  it('lists each letter with at least one miss once, in order of first miss', () => {
    expect(missedLetters([letterQ, wordQ, letterQ], ['t', 'toot', 'e'])).toEqual(['e', 't']);
    expect(missedLetters([letterQ], ['e'])).toEqual([]);
  });
});
