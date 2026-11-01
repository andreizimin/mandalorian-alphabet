import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpPanel } from './HelpPanel';
import { HELP_CONTROLS, HELP_INTRO } from './helpText';

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
