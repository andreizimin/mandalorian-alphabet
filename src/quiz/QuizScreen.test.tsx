import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FREQUENCY_ORDER } from '../alphabet/alphabet';
import { QuizButton, QuizScreen } from './QuizScreen';
import { mulberry32 } from './rng';
import { generateSession, type Question } from './session';
import { EVERYDAY_WORDS, GALAXY_WORDS } from './wordPool';

const learned = FREQUENCY_ORDER.slice(0, 10);
const base = { learned, quizByLetter: {}, order: FREQUENCY_ORDER, everyday: EVERYDAY_WORDS, galaxy: GALAXY_WORDS };

function expectedSession(seed: number): Question[] {
  return generateSession({ ...base, rng: mulberry32(seed) });
}

function renderQuiz(overrides: Partial<Parameters<typeof QuizScreen>[0]> = {}) {
  const props = { ...base, rng: mulberry32(7), onRecord: vi.fn(), onExit: vi.fn(), ...overrides } as Parameters<typeof QuizScreen>[0] & { onRecord: ReturnType<typeof vi.fn>; onExit: ReturnType<typeof vi.fn> };
  const utils = render(<QuizScreen {...props} />);
  return { ...utils, props };
}

const choiceButtons = () => within(screen.getByRole('group', { name: /choices/i })).getAllByRole('button');
const choiceFor = (text: string) => choiceButtons().find((b) => b.textContent === text)!;

async function answer(user: ReturnType<typeof userEvent.setup>, choice: string) {
  await user.click(choiceFor(choice));
  await user.click(screen.getByRole('button', { name: /^next$|see results/i }));
}

describe('QuizScreen', () => {
  // @spec QUIZ-005
  it('builds every question from the learned set it started with', () => {
    const session = expectedSession(7);
    const { props, rerender } = renderQuiz();

    rerender(<QuizScreen {...props} learned={[...learned, 'c']} />);

    expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();
    expect(choiceButtons().map((b) => b.textContent)).toEqual(session[0].choices);
  });

  // @spec QUIZ-019
  it('marks a right answer at once and moves on when Next is tapped', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    renderQuiz();

    await user.click(choiceFor(session[0].answer));

    expect(screen.getByRole('status')).toHaveTextContent(/right/i);
    expect(choiceFor(session[0].answer)).toHaveClass('correct');
    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(screen.getByText(/question 2 of 10/i)).toBeInTheDocument();
  });

  // @spec QUIZ-019
  it('marks a wrong answer and shows the correct one', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    renderQuiz();
    const wrong = session[0].choices.find((c) => c !== session[0].answer)!;

    await user.click(choiceFor(wrong));

    expect(choiceFor(wrong)).toHaveClass('wrong');
    expect(choiceFor(session[0].answer)).toHaveClass('correct');
    expect(choiceButtons().every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  describe('timing', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    // @spec QUIZ-019
    it('moves on by itself after a short pause', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const session = expectedSession(7);
      renderQuiz();

      await user.click(choiceFor(session[0].answer));
      act(() => vi.advanceTimersByTime(2000));

      expect(screen.getByText(/question 2 of 10/i)).toBeInTheDocument();
    });

    // @spec QUIZ-020
    it('never times out an unanswered question', () => {
      renderQuiz();
      act(() => vi.advanceTimersByTime(10 * 60 * 1000));
      expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();
      expect(choiceButtons().every((b) => !(b as HTMLButtonElement).disabled)).toBe(true);
    });
  });

  // @spec QUIZ-021, QUIZ-023
  it('records the answers and shows score, missed letters, again and back when the last question is answered', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    const { props } = renderQuiz();
    const picks = session.map((q, i) => (i === 0 ? q.choices.find((c) => c !== q.answer)! : q.answer));

    for (const pick of picks) await answer(user, pick);

    expect(props.onRecord).toHaveBeenCalledTimes(1);
    const recorded = props.onRecord.mock.calls[0][0] as { letter: string; correct: boolean }[];
    expect(recorded.filter((r) => !r.correct).length).toBeGreaterThan(0);
    expect(screen.getByText(/9 of 10/)).toBeInTheDocument();
    expect(screen.getByText(/missed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /again/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to reading/i }));
    expect(props.onExit).toHaveBeenCalled();
  });

  // @spec QUIZ-021
  it('starts a fresh session on Again', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    renderQuiz();
    for (const q of session) await answer(user, q.answer);

    await user.click(screen.getByRole('button', { name: /again/i }));

    expect(screen.getByText(/question 1 of 10/i)).toBeInTheDocument();
  });

  // @spec QUIZ-006
  it('records nothing when the learned set changed during the session', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    const { props, rerender } = renderQuiz();

    await answer(user, session[0].answer);
    rerender(<QuizScreen {...props} learned={learned.slice(0, 9)} />);
    for (const q of session.slice(1)) await answer(user, q.answer);

    expect(props.onRecord).not.toHaveBeenCalled();
    expect(screen.getByText(/10 of 10/)).toBeInTheDocument();
  });

  // @spec QUIZ-007
  it('records nothing when the learner leaves before the last question', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    const { props } = renderQuiz();

    for (const q of session.slice(0, 9)) await answer(user, q.answer);
    await user.click(screen.getByRole('button', { name: /back to reading/i }));

    expect(props.onExit).toHaveBeenCalled();
    expect(props.onRecord).not.toHaveBeenCalled();
  });

  // @spec QUIZ-022
  it('shows the result screen even when nothing could be recorded', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    renderQuiz({ onRecord: () => {} });
    for (const q of session) await answer(user, q.answer);
    expect(screen.getByText(/10 of 10/)).toBeInTheDocument();
  });

  // @spec QUIZ-025
  it('renders glyphs through the substitution renderer with the letters of the item shown', () => {
    const session = expectedSession(7);
    const { container } = renderQuiz();
    const q = session[0];
    const glyphText = Array.from(container.querySelectorAll('.g')).map((g) => g.textContent).join('');

    const glyphSide = q.type === 'glyph-to-letter' || q.type === 'mando-to-english' ? q.prompt : q.choices.join('');
    expect(glyphText).toBe(glyphSide);
  });
});

describe('QuizButton', () => {
  // @spec QUIZ-001
  it('opens the quiz when available', async () => {
    const onOpen = vi.fn();
    render(<QuizButton learnedCount={3} fontReady onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('button', { name: /quiz/i }));
    expect(onOpen).toHaveBeenCalled();
  });

  // @spec QUIZ-001, QUIZ-002
  it('stays visible but disabled with a reason while fewer than 2 letters are learned', () => {
    render(<QuizButton learnedCount={1} fontReady onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: /quiz/i })).toBeDisabled();
    expect(screen.getByText(/learn 2 letters first/i)).toBeInTheDocument();
  });

  // @spec QUIZ-003
  it('is disabled while the Mandalorian font is not loaded', () => {
    render(<QuizButton learnedCount={5} fontReady={false} onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: /quiz/i })).toBeDisabled();
  });
});

describe('QuizScreen and the newest-letter highlight', () => {
  // @spec QUIZ-026
  it('renders glyphs without the highlight on every question', async () => {
    const user = userEvent.setup();
    const session = expectedSession(7);
    const { container } = renderQuiz();
    for (const q of session) {
      expect(container.querySelectorAll('.g').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('.g-new')).toHaveLength(0);
      await answer(user, q.answer);
    }
  });
});
