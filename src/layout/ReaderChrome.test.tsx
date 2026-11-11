import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppearanceControl, BottomBar, MenuSheet, TextSizeControl, TitleBar, TopBar, type ReaderActions } from './ReaderChrome';

function actions(overrides: Partial<ReaderActions> = {}): ReaderActions {
  return {
    canAdvance: true,
    canStepBack: true,
    canTurnBack: true,
    learnedCount: 3,
    fontReady: true,
    textSize: 20,
    appearance: 'system',
    feedbackReady: true,
    onAdvance: vi.fn(),
    onStepBack: vi.fn(),
    onReset: vi.fn(),
    onLegend: vi.fn(),
    onLibrary: vi.fn(),
    onQuiz: vi.fn(),
    onTextSize: vi.fn(),
    onAppearance: vi.fn(),
    onBack: vi.fn(),
    onForward: vi.fn(),
    onFeedback: vi.fn(),
    onHelp: vi.fn(),
    ...overrides,
  };
}

describe('TopBar', () => {
  function renderBar(overrides: Partial<ReaderActions> = {}) {
    const a = actions(overrides);
    const onMenu = vi.fn();
    render(<TopBar {...a} onMenu={onMenu} />);
    return { a, onMenu, bar: screen.getByRole('navigation', { name: /reader controls/i }) };
  }

  // @spec LAYOUT-003
  it('shows exactly six keys, in order: Next letter, Quiz, Legend, Library, Help and the menu key', () => {
    const { bar } = renderBar();
    expect(bar).toHaveClass('top-bar');
    expect(within(bar).getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      'Next letter',
      'Quiz',
      'Legend (3)',
      'Library',
      'Help',
      'Menu',
    ]);
  });

  // @spec LAYOUT-003, LAYOUT-011, LAYOUT-008, PROG-007, HELP-001
  it('keeps each of the six one tap away', async () => {
    const { a, onMenu, bar } = renderBar();
    for (const [name, handler] of [
      [/next letter/i, a.onAdvance],
      [/^quiz$/i, a.onQuiz],
      [/legend/i, a.onLegend],
      [/library/i, a.onLibrary],
      ['Help', a.onHelp],
      ['Menu', onMenu],
    ] as const) {
      await userEvent.click(within(bar).getByRole('button', { name }));
      expect(handler).toHaveBeenCalledTimes(1);
    }
  });

  // @spec LAYOUT-003, LAYOUT-016
  it('leaves Step back, Reset, text size, appearance, Feedback and Suggest a feature to the menu', () => {
    const { bar } = renderBar();
    for (const name of [/step back/i, /^reset/i, /smaller text/i, /larger text/i, /^appearance/i, 'Feedback', 'Suggest a feature']) {
      expect(within(bar).queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });

  // @spec LAYOUT-023
  it('groups the reading keys at one end and Help with the menu key at the other', () => {
    const { bar } = renderBar();
    const groups = [...bar.children] as HTMLElement[];
    expect(groups).toHaveLength(2);
    expect(within(groups[0]).getAllByRole('button')).toHaveLength(4);
    expect(within(groups[1]).getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Help', 'Menu']);
  });

  // @spec PROG-013, LAYOUT-008
  it('disables Next letter when no letter is left and Quiz below 2 letters', () => {
    const { bar } = renderBar({ canAdvance: false, learnedCount: 1 });
    expect(within(bar).getByRole('button', { name: /next letter/i })).toBeDisabled();
    expect(within(bar).getByRole('button', { name: /^quiz$/i })).toBeDisabled();
  });
});

describe('BottomBar', () => {
  // @spec LAYOUT-002, LAYOUT-012
  it('holds the page-turn buttons at its ends and the phone controls between them', async () => {
    const a = actions();
    render(<BottomBar {...a} onMenu={vi.fn()} />);
    const bar = screen.getByRole('navigation', { name: /page turning/i });
    const buttons = within(bar).getAllByRole('button');

    expect(buttons[0]).toHaveAccessibleName(/previous page/i);
    expect(buttons[buttons.length - 1]).toHaveAccessibleName(/next page/i);
    const phone = bar.querySelector('.phone-only')!;
    expect(within(phone as HTMLElement).getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Next letter',
      'Quiz',
      '⋯',
    ]);

    await userEvent.click(within(bar).getByRole('button', { name: /next letter/i }));
    expect(a.onAdvance).toHaveBeenCalled();
  });

  // @spec LAYOUT-012, LAYOUT-008
  it('disables back on the first page and Quiz below 2 letters', () => {
    render(<BottomBar {...actions({ canTurnBack: false, learnedCount: 1 })} onMenu={vi.fn()} />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^quiz$/i })).toBeDisabled();
  });
});

describe('MenuSheet', () => {
  function renderSheet({ wide = false, ...overrides }: Partial<ReaderActions> & { wide?: boolean } = {}) {
    const a = actions(overrides);
    const onClose = vi.fn();
    render(<MenuSheet {...a} wide={wide} onClose={onClose} />);
    return { a, onClose, sheet: screen.getByRole('dialog', { name: /menu/i }) };
  }
  const names = (sheet: HTMLElement) =>
    within(sheet)
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label') ?? b.textContent);

  // @spec LAYOUT-002, LAYOUT-011, PROG-007
  it('under 600 px holds Step back, Reset, Legend, Library, Suggest a feature, text size and appearance', () => {
    const { sheet } = renderSheet();
    expect(names(sheet)).toEqual([
      'Step back',
      'Reset',
      'Legend',
      'Library',
      'Suggest a feature',
      'Smaller text',
      'Larger text',
      'Appearance: Auto',
    ]);
  });

  // @spec LAYOUT-003, LAYOUT-016
  it('at 600 px or wider holds Step back, Reset, text size, appearance, Feedback and Suggest a feature', () => {
    const { sheet } = renderSheet({ wide: true });
    expect(names(sheet)).toEqual([
      'Step back',
      'Reset',
      'Smaller text',
      'Larger text',
      'Appearance: Auto',
      'Feedback',
      'Suggest a feature',
    ]);
  });

  // @spec LAYOUT-014, FEED-006
  it.each([false, true])('Suggest a feature opens the feedback form and closes the menu (wide: %s)', async (wide) => {
    const { a, sheet, onClose } = renderSheet({ wide });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Suggest a feature' }));
    expect(a.onFeedback).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec LAYOUT-014, LAYOUT-016, FEED-002
  it('Feedback opens the feedback form and closes the menu', async () => {
    const { a, sheet, onClose } = renderSheet({ wide: true });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Feedback' }));
    expect(a.onFeedback).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec LAYOUT-016, FEED-003, FEED-006
  it('shows Feedback and Suggest a feature disabled, with the reason, while the widget is unavailable', () => {
    const { sheet } = renderSheet({ wide: true, feedbackReady: false });
    expect(within(sheet).getByRole('button', { name: 'Feedback' })).toBeDisabled();
    expect(within(sheet).getByRole('button', { name: 'Suggest a feature' })).toBeDisabled();
    expect(within(sheet).getByText('Feedback needs a connection')).toBeInTheDocument();
  });

  // @spec LAYOUT-014, LAYOUT-017
  it.each([false, true])('steps the appearance and stays open so the result can be seen (wide: %s)', async (wide) => {
    const { a, onClose, sheet } = renderSheet({ wide });
    await userEvent.click(within(sheet).getByRole('button', { name: /^appearance/i }));
    expect(a.onAppearance).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  // @spec LAYOUT-014, LAYOUT-006
  it('steps the text size and stays open', async () => {
    const { a, onClose, sheet } = renderSheet({ wide: true });
    await userEvent.click(within(sheet).getByRole('button', { name: /larger text/i }));
    expect(a.onTextSize).toHaveBeenCalledWith(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  // @spec LAYOUT-014
  it('runs the chosen item and closes', async () => {
    const { a, onClose, sheet } = renderSheet();
    await userEvent.click(within(sheet).getByRole('button', { name: /library/i }));
    expect(a.onLibrary).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  // @spec LAYOUT-014, PROG-005
  it.each([false, true])('steps back and closes (wide: %s)', async (wide) => {
    const { a, onClose, sheet } = renderSheet({ wide });
    await userEvent.click(within(sheet).getByRole('button', { name: /step back/i }));
    expect(a.onStepBack).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec PROG-005
  it('disables Step back when no letter is learned', () => {
    const { sheet } = renderSheet({ canStepBack: false });
    expect(within(sheet).getByRole('button', { name: /step back/i })).toBeDisabled();
  });

  // @spec LAYOUT-014, PROG-006
  it.each([false, true])('resets only after the learner confirms, then closes (wide: %s)', async (wide) => {
    const { a, onClose, sheet } = renderSheet({ wide });

    await userEvent.click(within(sheet).getByRole('button', { name: /^reset/i }));
    expect(a.onReset).not.toHaveBeenCalled();
    await userEvent.click(within(sheet).getByRole('button', { name: /cancel/i }));
    expect(a.onReset).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(within(sheet).getByRole('button', { name: /^reset/i }));
    await userEvent.click(within(sheet).getByRole('button', { name: /yes, reset/i }));
    expect(a.onReset).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // @spec LAYOUT-014
  it('closes when the learner taps outside it', () => {
    const { onClose } = renderSheet();
    fireEvent.click(document.querySelector('.menu-backdrop')!);
    expect(onClose).toHaveBeenCalled();
  });

  // @spec LAYOUT-026
  it.each([false, true])('moves keyboard focus to its first key when it opens (wide: %s)', (wide) => {
    const { sheet } = renderSheet({ wide });
    expect(within(sheet).getByRole('button', { name: /step back/i })).toHaveFocus();
  });

  // @spec LAYOUT-026
  it('skips a disabled key when it moves focus in', () => {
    const { sheet } = renderSheet({ wide: true, canStepBack: false });
    expect(within(sheet).getByRole('button', { name: /^reset/i })).toHaveFocus();
  });

  // @spec LAYOUT-027
  it.each([false, true])('closes on Escape, saying so, so focus can go back to the menu key (wide: %s)', (wide) => {
    const { onClose } = renderSheet({ wide });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith('escape');
  });

  // @spec LAYOUT-028
  it('keeps Tab inside the menu, wrapping at both ends', async () => {
    const { sheet } = renderSheet({ wide: true });
    const keys = within(sheet).getAllByRole('button');
    keys[keys.length - 1].focus();
    await userEvent.tab();
    expect(keys[0]).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(keys[keys.length - 1]).toHaveFocus();
  });
});

describe('TextSizeControl', () => {
  // @spec LAYOUT-006
  it('steps the size down and up, disabling each button at its limit', async () => {
    const onTextSize = vi.fn();
    const { rerender } = render(<TextSizeControl textSize={20} onTextSize={onTextSize} />);

    await userEvent.click(screen.getByRole('button', { name: /smaller text/i }));
    await userEvent.click(screen.getByRole('button', { name: /larger text/i }));
    expect(onTextSize.mock.calls).toEqual([[-1], [1]]);

    rerender(<TextSizeControl textSize={16} onTextSize={onTextSize} />);
    expect(screen.getByRole('button', { name: /smaller text/i })).toBeDisabled();
    rerender(<TextSizeControl textSize={32} onTextSize={onTextSize} />);
    expect(screen.getByRole('button', { name: /larger text/i })).toBeDisabled();
  });
});

describe('AppearanceControl', () => {
  // @spec LAYOUT-017
  it('shows the current choice as its label and steps on tap', async () => {
    const onAppearance = vi.fn();
    const { rerender } = render(<AppearanceControl appearance="system" onAppearance={onAppearance} />);
    const button = screen.getByRole('button', { name: /^appearance/i });
    expect(button).toHaveTextContent('Auto');

    await userEvent.click(button);
    expect(onAppearance).toHaveBeenCalledTimes(1);

    rerender(<AppearanceControl appearance="light" onAppearance={onAppearance} />);
    expect(button).toHaveTextContent('Light');
    rerender(<AppearanceControl appearance="dark" onAppearance={onAppearance} />);
    expect(button).toHaveTextContent('Dark');
  });
});

describe('Feedback among the reader controls', () => {
  // @spec LAYOUT-016
  it('sits at the right end of the title line for phones', async () => {
    const a = actions();
    render(<TitleBar title="Treasure Island" {...a} />);
    const line = screen.getByText('Treasure Island').closest('.title-line') as HTMLElement;
    const phoneButton = within(line).getByRole('button', { name: 'Feedback' });

    expect(phoneButton.closest('.phone-only')).not.toBeNull();
    expect(line.lastElementChild).toContainElement(phoneButton);
    await userEvent.click(phoneButton);
    expect(a.onFeedback).toHaveBeenCalledTimes(1);
  });

  // @spec LAYOUT-016, HELP-001
  it('puts a compact Help key on the phone title line, just before Feedback', async () => {
    const a = actions();
    render(<TitleBar title="Treasure Island" {...a} />);
    const line = screen.getByText('Treasure Island').closest('.title-line') as HTMLElement;
    const help = within(line).getByRole('button', { name: 'Help' });

    expect(help.closest('.phone-only')).not.toBeNull();
    expect(help).toHaveTextContent('?');
    expect(help.compareDocumentPosition(within(line).getByRole('button', { name: 'Feedback' }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    await userEvent.click(help);
    expect(a.onHelp).toHaveBeenCalledTimes(1);
  });

  // @spec LAYOUT-016, FEED-003
  it('is disabled on the phone title line while the widget is unavailable', () => {
    render(<TitleBar title="Treasure Island" {...actions({ feedbackReady: false })} />);
    expect(screen.getByRole('button', { name: 'Feedback' })).toBeDisabled();
  });
});

describe('status line', () => {
  // @spec LAYOUT-021
  it('shows the passage title as a console status line with a cursor, keeping the title readable', () => {
    render(<TitleBar title="Treasure Island" feedbackReady onFeedback={() => {}} />);
    const title = screen.getByText('Treasure Island');
    expect(title).toHaveClass('passage-title', 'status-line');
    expect(title.querySelector('.cursor')).not.toBeNull();
    expect(title.querySelector('.cursor')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('DEV marker', () => {
  // @spec OFF-008
  it('follows the passage title on dev builds only', () => {
    const { rerender } = render(<TitleBar title="Treasure Island" feedbackReady onFeedback={() => {}} dev />);
    const marker = screen.getByText('DEV');
    expect(marker.closest('.title-line')).toContainElement(screen.getByText('Treasure Island'));

    rerender(<TitleBar title="Treasure Island" feedbackReady onFeedback={() => {}} />);
    expect(screen.queryByText('DEV')).not.toBeInTheDocument();
  });
});
