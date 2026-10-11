import type { QuizAnswerRecord } from '../progression/progression';

export type QuestionType = 'glyph-to-letter' | 'letter-to-glyph' | 'mando-to-english' | 'english-to-mando';

export interface Question {
  type: QuestionType;
  /** The letter this question was chosen to check. */
  target: string;
  /** For letter questions a letter; for word questions the word. */
  prompt: string;
  answer: string;
  choices: string[];
}

export interface SessionInput {
  learned: readonly string[];
  quizByLetter: Readonly<Record<string, readonly boolean[]>>;
  order: readonly string[];
  everyday: readonly string[];
  galaxy: readonly string[];
  rng: () => number;
}

export const SESSION_LENGTH = 10;
const NEWEST_MIN = 3;
const WORD_POOL_MIN = 8;
const NO_REPEAT_POOL_MIN = 10;
const GALAXY_PREFERRED_MIN = 4;
const RING_SIZE = 5;
const WORD_SHARE = 0.5;

export const isWordQuestion = (q: Question) => q.type === 'mando-to-english' || q.type === 'english-to-mando';

export function qualifyingWords(learned: readonly string[], words: readonly string[]): string[] {
  return words.filter((w) => [...w].every((c) => learned.includes(c)));
}

export function targetsLetter(q: Question, letter: string): boolean {
  return isWordQuestion(q) ? q.answer.includes(letter) : q.target === letter;
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const pick = <T>(items: readonly T[], rng: () => number) => items[Math.floor(rng() * items.length)];

/** Letters with fewer than 5 recorded answers are least certain and weigh the most. */
function weightOf(ring: readonly boolean[] = []): number {
  return ring.length < RING_SIZE ? RING_SIZE + 1 : 1 + ring.filter((c) => !c).length;
}

function weightedPick(letters: readonly string[], input: SessionInput): string {
  const weights = letters.map((l) => weightOf(input.quizByLetter[l]));
  let r = input.rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < letters.length; i++) {
    r -= weights[i];
    if (r < 0) return letters[i];
  }
  return letters[letters.length - 1];
}

const promptKey = (q: Question) => `${q.type}:${q.prompt}`;

// @spec QUIZ-004, QUIZ-008, QUIZ-009, QUIZ-010, QUIZ-011, QUIZ-012, QUIZ-013, QUIZ-014, QUIZ-015, QUIZ-016, QUIZ-017, QUIZ-018
export function generateSession(input: SessionInput): Question[] {
  const { learned, order, rng } = input;
  const newest = learned[learned.length - 1];
  const others = learned.slice(0, -1);
  const galaxy = qualifyingWords(learned, input.galaxy);
  const pool = [...galaxy, ...qualifyingWords(learned, input.everyday)];
  const wordMode = pool.length >= WORD_POOL_MIN;
  const noRepeat = pool.length >= NO_REPEAT_POOL_MIN;
  const preferGalaxy = galaxy.length >= GALAXY_PREFERRED_MIN;
  const usedAnswers = new Set<string>();

  const targets = shuffle(
    [
      ...Array<string>(NEWEST_MIN).fill(newest),
      ...Array.from({ length: SESSION_LENGTH - NEWEST_MIN }, () =>
        others.length > 0 ? weightedPick(others, input) : newest,
      ),
    ],
    rng,
  );

  function letterQuestion(target: string, type: QuestionType = rng() < 0.5 ? 'glyph-to-letter' : 'letter-to-glyph'): Question {
    const learnedOthers = shuffle(learned.filter((l) => l !== target), rng);
    const fillers = order.filter((l) => !learned.includes(l));
    const distractors = [...learnedOthers, ...fillers].slice(0, 3);
    return { type, target, prompt: target, answer: target, choices: shuffle([target, ...distractors], rng) };
  }

  function wordQuestion(target: string): Question | null {
    const candidates = pool.filter((w) => w.includes(target) && !(noRepeat && usedAnswers.has(w)));
    if (candidates.length === 0) return null;
    const galaxyCandidates = candidates.filter((w) => galaxy.includes(w));
    const answer = pick(preferGalaxy && galaxyCandidates.length > 0 ? galaxyCandidates : candidates, rng);
    usedAnswers.add(answer);

    const distractors = shuffle(
      pool.filter((w) => w !== answer),
      rng,
    )
      .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length))
      .slice(0, 3);
    const type: QuestionType = rng() < 0.5 ? 'mando-to-english' : 'english-to-mando';
    return { type, target, prompt: answer, answer, choices: shuffle([answer, ...distractors], rng) };
  }

  const questions: Question[] = [];
  let wordsLeft = wordMode ? Math.round(SESSION_LENGTH * WORD_SHARE) : 0;

  targets.forEach((target, i) => {
    const slotsLeft = SESSION_LENGTH - i;
    const wantWord = wordsLeft > 0 && (wordsLeft >= slotsLeft || rng() < wordsLeft / slotsLeft);
    let q = (wantWord && wordQuestion(target)) || letterQuestion(target);
    if (isWordQuestion(q)) wordsLeft--;

    const previous = questions[questions.length - 1];
    if (previous && promptKey(previous) === promptKey(q)) {
      // Flipping the direction changes the prompt shown, keeping the same target.
      const flipped: Record<QuestionType, QuestionType> = {
        'glyph-to-letter': 'letter-to-glyph',
        'letter-to-glyph': 'glyph-to-letter',
        'mando-to-english': 'english-to-mando',
        'english-to-mando': 'mando-to-english',
      };
      q = { ...q, type: flipped[q.type] };
    }
    questions.push(q);
  });
  return questions;
}

/** One answer per letter question; one per distinct letter of a word question's answer, sharing its result. */
// @spec QUIZ-023
export function recordAnswers(questions: readonly Question[], picks: readonly string[]): QuizAnswerRecord[] {
  return questions.flatMap((q, i) => {
    const correct = picks[i] === q.answer;
    const letters = isWordQuestion(q) ? [...new Set(q.answer)] : [q.target];
    return letters.map((letter) => ({ letter, correct }));
  });
}

// @spec QUIZ-021
export function missedLetters(questions: readonly Question[], picks: readonly string[]): string[] {
  const missed = recordAnswers(questions, picks)
    .filter((a) => !a.correct)
    .map((a) => a.letter);
  return [...new Set(missed)];
}
