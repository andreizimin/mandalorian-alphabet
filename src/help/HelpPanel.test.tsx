import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpPanel } from './HelpPanel';
import { HELP_CONTROLS, HELP_INTRO, MENU_NOTE } from './helpText';
import { QUIZ_MIN_LETTERS, SESSION_LENGTH } from '../quiz/session';

/** Every reader control's visible name (LAYOUT-002, LAYOUT-003): Help must say what each one does. */
const READER_CONTROLS = [
  'Next letter',
  'Quiz',
  'Step back',
  'Reset',
  'Legend',
  'Library',
  'A−',
  'A+',
  'appearance',
  'Feedback',
  'Suggest a feature',
];

function renderPanel() {
  const onClose = vi.fn();
  const onReplayIntro = vi.fn();
  render(<HelpPanel onClose={onClose} onReplayIntro={onReplayIntro} />);
  return { onClose, onReplayIntro, panel: screen.getByRole('dialog', { name: 'Help' }) };
}

describe('the Help text', () => {
  // @spec HELP-001
  it('says what the app does and how it teaches', () => {
    const intro = HELP_INTRO.join(' ');
    expect(intro).toMatch(/real stories/i);
    expect(intro).toMatch(/one letter at a time/i);
    expect(intro).toMatch(/Mandalorian/);
  });

  // @spec HELP-001
  it('names every reader control and the page-turn gestures', () => {
    const names = HELP_CONTROLS.map((c) => c.name).join(' ');
    for (const control of READER_CONTROLS) expect(names).toContain(control);
    expect(names).toMatch(/tap a glyph/i);
    expect(names).toMatch(/swipe/i);
  });
});

describe('HelpPanel', () => {
  // @spec HELP-001
  it('shows the explanation and one entry per control', () => {
    const { panel } = renderPanel();
    expect(within(panel).getByText(HELP_INTRO[0])).toBeInTheDocument();
    for (const control of HELP_CONTROLS) expect(within(panel).getByText(control.text)).toBeInTheDocument();
  });

  // @spec HELP-010
  it('carries the menu note for each width, naming where the ⋯ key is, for the stylesheet to show one', () => {
    const { panel } = renderPanel();
    expect(MENU_NOTE.narrow).toMatch(/⋯ key/);
    expect(MENU_NOTE.narrow).toMatch(/bottom bar/);
    expect(MENU_NOTE.wide).toMatch(/⋯ key/);
    expect(MENU_NOTE.wide).toMatch(/top bar/);
    expect(within(panel).getByText(MENU_NOTE.narrow)).toHaveClass('help-note', 'narrow-only');
    expect(within(panel).getByText(MENU_NOTE.wide)).toHaveClass('help-note', 'wide-only');
  });

  // @spec HELP-002
  it('closes on Close', async () => {
    const { onClose, panel } = renderPanel();
    await userEvent.click(within(panel).getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec HELP-002
  it('closes on a tap outside the panel but not on a tap inside it', async () => {
    const { onClose, panel } = renderPanel();
    await userEvent.click(within(panel).getByText(HELP_INTRO[0]));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(panel.parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec HELP-002
  it('closes on Escape', () => {
    const { onClose } = renderPanel();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec HELP-004
  it('offers Replay intro', async () => {
    const { onReplayIntro, panel } = renderPanel();
    await userEvent.click(within(panel).getByRole('button', { name: 'Replay intro' }));
    expect(onReplayIntro).toHaveBeenCalledTimes(1);
  });
});

describe('HelpPanel focus and assistive technology', () => {
  // @spec HELP-006
  it('moves keyboard focus to Close when it opens', () => {
    const { panel } = renderPanel();
    expect(within(panel).getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  // @spec HELP-007
  it('is a modal dialog labelled Help that keeps Tab inside it', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <HelpPanel onClose={vi.fn()} onReplayIntro={vi.fn()} />
      </>,
    );
    const panel = screen.getByRole('dialog', { name: 'Help' });
    expect(panel).toHaveAttribute('aria-modal', 'true');
    for (let i = 0; i < 5; i++) {
      await userEvent.tab();
      expect(panel).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 5; i++) {
      await userEvent.tab({ shift: true });
      expect(panel).toContainElement(document.activeElement as HTMLElement);
    }
  });
});

describe('the Help text facts', () => {
  // @spec HELP-011
  it('states the quiz length and the letters the quiz needs from the quiz itself', () => {
    const quiz = HELP_CONTROLS.find((c) => c.name === 'Quiz')!;
    expect(quiz.text).toContain(`${SESSION_LENGTH}-question`);
    expect(quiz.text).toMatch(new RegExp(`once you have ${QUIZ_MIN_LETTERS}\\b`));
  });
});
