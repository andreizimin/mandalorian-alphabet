import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controls, HintBanner, IntroCard, Legend, WelcomeCard, exampleWords } from './components';

describe('IntroCard', () => {
  const passage = 'The east gate stood open. Beyond it, the desert stretched east forever.';

  // @spec PROG-003
  it('picks up to 3 distinct words from the passage that contain the letter, in passage order', () => {
    expect(exampleWords(passage, 'e')).toEqual(['the', 'east', 'gate']);
    expect(exampleWords(passage, 'g')).toEqual(['gate']);
    expect(exampleWords(passage, 'q')).toEqual([]);
  });

  // @spec PROG-002, PROG-003
  it('shows the glyph, its Latin letter and the example words', async () => {
    const onClose = vi.fn();
    render(<IntroCard letter="e" passageText={passage} onClose={onClose} />);

    const card = screen.getByRole('dialog', { name: /new letter/i });
    expect(card.querySelector('.intro-glyph .g')).toHaveTextContent('e');
    expect(within(card).getByText('E', { selector: '.intro-latin' })).toBeInTheDocument();
    for (const word of ['the', 'east', 'gate']) {
      expect(within(card).getByRole('img', { name: word })).toBeInTheDocument();
    }

    await userEvent.click(within(card).getByRole('button', { name: /got it/i }));
    expect(onClose).toHaveBeenCalled();
  });

  // @spec PROG-003
  it('leaves out the examples section when the passage has no word with the letter', () => {
    render(<IntroCard letter="q" passageText={passage} onClose={() => {}} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('HintBanner', () => {
  // @spec PROG-004
  it('names reading as the signal', () => {
    render(<HintBanner signals={['reading']} onDismiss={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent(/ready for the next letter/i);
    expect(screen.getByRole('status')).toHaveTextContent(/peek/i);
    expect(screen.getByRole('status')).not.toHaveTextContent(/quiz/i);
  });

  // @spec PROG-008
  it('names the quiz as the signal', () => {
    render(<HintBanner signals={['quiz']} onDismiss={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent(/quiz/i);
    expect(screen.getByRole('status')).not.toHaveTextContent(/peek/i);
  });

  // @spec PROG-011
  it('names both signals in a single hint', () => {
    render(<HintBanner signals={['reading', 'quiz']} onDismiss={() => {}} />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(/peek/i);
    expect(screen.getByRole('status')).toHaveTextContent(/quiz/i);
  });

  // @spec PROG-012
  it('can be dismissed and renders nothing without signals', async () => {
    const onDismiss = vi.fn();
    const { rerender, container } = render(<HintBanner signals={['reading']} onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();

    rerender(<HintBanner signals={[]} onDismiss={onDismiss} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Controls', () => {
  function renderControls(overrides: Partial<Parameters<typeof Controls>[0]> = {}) {
    const props = {
      canAdvance: true,
      canStepBack: true,
      onAdvance: vi.fn(),
      onStepBack: vi.fn(),
      onReset: vi.fn(),
      ...overrides,
    };
    render(<Controls {...props} />);
    return props;
  }

  // @spec PROG-002, PROG-005
  it('advances and steps back on tap', async () => {
    const props = renderControls();
    await userEvent.click(screen.getByRole('button', { name: /next letter/i }));
    await userEvent.click(screen.getByRole('button', { name: /step back/i }));
    expect(props.onAdvance).toHaveBeenCalledTimes(1);
    expect(props.onStepBack).toHaveBeenCalledTimes(1);
  });

  // @spec PROG-013
  it('disables advance when there is no next letter', () => {
    renderControls({ canAdvance: false });
    expect(screen.getByRole('button', { name: /next letter/i })).toBeDisabled();
  });

  // @spec PROG-005
  it('disables step back when no letter is learned', () => {
    renderControls({ canStepBack: false });
    expect(screen.getByRole('button', { name: /step back/i })).toBeDisabled();
  });

  // @spec PROG-006
  it('resets only after the learner confirms', async () => {
    const props = renderControls();

    await userEvent.click(screen.getByRole('button', { name: /^reset/i }));
    expect(props.onReset).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(props.onReset).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /^reset/i }));
    await userEvent.click(screen.getByRole('button', { name: /yes, reset/i }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });
});

describe('Legend', () => {
  // @spec PROG-007
  it('lists every learned letter with its glyph and Latin letter, in learning order', () => {
    render(<Legend learned={['e', 't', 'a']} />);
    const items = screen.getAllByRole('listitem');
    expect(items.map((i) => i.querySelector('.legend-latin')?.textContent)).toEqual(['E', 'T', 'A']);
    expect(items.every((i) => i.querySelector('.g'))).toBe(true);
  });

  // @spec PROG-007
  it('says so when nothing is learned yet', () => {
    render(<Legend learned={[]} />);
    expect(screen.getByText(/no letters yet/i)).toBeInTheDocument();
  });
});

describe('WelcomeCard', () => {
  // @spec PROG-014
  it('points at the advance control and can be dismissed', async () => {
    const onDismiss = vi.fn();
    render(<WelcomeCard onDismiss={onDismiss} />);
    expect(screen.getByRole('dialog', { name: /welcome/i })).toHaveTextContent(/next letter/i);
    await userEvent.click(screen.getByRole('button', { name: /start reading/i }));
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('newest-letter highlight on the intro card and legend', () => {
  // @spec PROG-015
  it('draws every glyph on the intro card, letter and example words, in the highlight', () => {
    const { container } = render(
      <IntroCard letter="e" passageText="The east gate stood open." onClose={() => {}} />,
    );
    const glyphs = Array.from(container.querySelectorAll('.g'));
    expect(glyphs.length).toBeGreaterThan(1);
    expect(glyphs.every((g) => g.classList.contains('g-new'))).toBe(true);
  });

  // @spec PROG-015
  it("highlights only the legend's entry for the newest letter", () => {
    const { container } = render(<Legend learned={['e', 't', 'a']} />);
    const marked = Array.from(container.querySelectorAll('li')).map((li) => li.querySelector('.g')!.classList.contains('g-new'));
    expect(marked).toEqual([false, false, true]);
  });
});
