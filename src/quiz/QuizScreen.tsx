import { useEffect, useRef, useState } from 'react';
import type { QuizAnswerRecord } from '../progression/progression';
import { Substituted } from '../reader/Substituted';
import { SESSION_LENGTH, generateSession, isWordQuestion, missedLetters, recordAnswers, type Question } from './session';

export const FEEDBACK_MS = 1500;

interface QuizScreenProps {
  learned: readonly string[];
  quizByLetter: Readonly<Record<string, readonly boolean[]>>;
  order: readonly string[];
  everyday: readonly string[];
  galaxy: readonly string[];
  rng?: () => number;
  onRecord: (answers: QuizAnswerRecord[]) => void;
  onExit: () => void;
}

/** Which side of a question is drawn in glyphs. */
const glyphPrompt = (q: Question) => q.type === 'glyph-to-letter' || q.type === 'mando-to-english';

// Never passes a highlight letter: the newest-letter highlight would give away which letter a question targets.
// @spec QUIZ-025, QUIZ-026
function Item({ text, glyph, word }: { text: string; glyph: boolean; word: boolean }) {
  if (glyph) return <Substituted text={text} letters={new Set(text)} />;
  return <span className={word ? undefined : 'latin-letter'}>{text}</span>;
}

// @spec QUIZ-005, QUIZ-006, QUIZ-007, QUIZ-019, QUIZ-020, QUIZ-021, QUIZ-022
export function QuizScreen({ rng = Math.random, ...props }: QuizScreenProps) {
  const start = () => {
    const snapshot = [...props.learned];
    return { snapshot, questions: generateSession({ ...props, learned: snapshot, rng }) };
  };
  const [session, setSession] = useState(start);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [phase, setPhase] = useState<'question' | 'feedback' | 'results'>('question');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const { questions } = session;
  const q = questions[index];
  const isLast = index === SESSION_LENGTH - 1;

  function next() {
    clearTimeout(timer.current);
    if (isLast) setPhase('results');
    else {
      setIndex((i) => i + 1);
      setPhase('question');
    }
  }

  function choose(choice: string) {
    if (phase !== 'question') return;
    const nextPicks = [...picks, choice];
    setPicks(nextPicks);
    setPhase('feedback');
    if (isLast && session.snapshot.join('') === props.learned.join('')) {
      props.onRecord(recordAnswers(questions, nextPicks));
    }
    timer.current = setTimeout(next, FEEDBACK_MS);
  }

  function again() {
    setSession(start());
    setIndex(0);
    setPicks([]);
    setPhase('question');
  }

  if (phase === 'results') {
    const score = picks.filter((p, i) => p === questions[i].answer).length;
    const missed = missedLetters(questions, picks);
    return (
      <section className="quiz quiz-results" aria-label="Quiz results">
        <p className="quiz-score">
          You got {score} of {SESSION_LENGTH}.
        </p>
        <p>
          {missed.length > 0
            ? `Missed: ${missed.map((l) => l.toUpperCase()).join(', ')}`
            : 'No misses. Clean run.'}
        </p>
        <div className="controls">
          <button type="button" className="primary" onClick={again}>
            Again
          </button>
          <button type="button" onClick={props.onExit}>
            Back to reading
          </button>
        </div>
      </section>
    );
  }

  const picked = phase === 'feedback' ? picks[index] : null;
  const word = isWordQuestion(q);

  return (
    <section className="quiz" aria-label="Quiz">
      <div className="quiz-header">
        <span>
          Question {index + 1} of {SESSION_LENGTH}
        </span>
        <button type="button" onClick={props.onExit}>
          Back to reading
        </button>
      </div>

      <div className="quiz-prompt">
        <Item text={q.prompt} glyph={glyphPrompt(q)} word={word} />
      </div>

      <p role="status" className="quiz-feedback">
        {picked === null ? '' : picked === q.answer ? 'Right!' : 'Not quite. The right answer is highlighted.'}
      </p>

      <div className="choice-grid" role="group" aria-label="Choices">
        {q.choices.map((choice) => {
          const mark = picked === null ? '' : choice === q.answer ? 'correct' : choice === picked ? 'wrong' : '';
          return (
            <button
              key={choice}
              type="button"
              className={`choice ${mark}`.trim()}
              disabled={picked !== null}
              onClick={() => choose(choice)}
            >
              <Item text={choice} glyph={!glyphPrompt(q)} word={word} />
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <button type="button" className="primary quiz-next" onClick={next}>
          {isLast ? 'See results' : 'Next'}
        </button>
      )}
    </section>
  );
}

// @spec QUIZ-001, QUIZ-002, QUIZ-003
export function QuizButton({
  learnedCount,
  fontReady,
  onOpen,
}: {
  learnedCount: number;
  fontReady: boolean;
  onOpen: () => void;
}) {
  const reason = learnedCount < 2 ? 'Learn 2 letters first' : !fontReady ? 'Waiting for the Mandalorian font' : null;
  return (
    <span className="quiz-button">
      <button type="button" onClick={onOpen} disabled={reason !== null} aria-describedby={reason ? 'quiz-reason' : undefined}>
        Quiz
      </button>
      {reason && (
        <small id="quiz-reason" className="quiz-reason">
          {reason}
        </small>
      )}
    </span>
  );
}
