import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomBar, MenuSheet, TextSizeControl, TopBar, type ReaderActions } from './ReaderChrome';

function actions(overrides: Partial<ReaderActions> = {}): ReaderActions {
  return {
    canAdvance: true,
    canStepBack: true,
    canTurnBack: true,
    learnedCount: 3,
    fontReady: true,
    textSize: 20,
    onAdvance: vi.fn(),
    onStepBack: vi.fn(),
    onReset: vi.fn(),
    onLegend: vi.fn(),
    onLibrary: vi.fn(),
    onQuiz: vi.fn(),
    onTextSize: vi.fn(),
    onBack: vi.fn(),
    onForward: vi.fn(),
    ...overrides,
  };
}

describe('TopBar', () => {
  // @spec LAYOUT-003, LAYOUT-011, LAYOUT-008, PROG-007
  it('holds every reader control, each one tap away', async () => {
    const a = actions();
    render(<TopBar {...a} />);
    const bar = screen.getByRole('navigation', { name: /reader controls/i });
    expect(bar).toHaveClass('top-bar');

    for (const [name, handler] of [
      [/next letter/i, a.onAdvance],
      [/step back/i, a.onStepBack],
      [/legend/i, a.onLegend],
      [/library/i, a.onLibrary],
      [/^quiz$/i, a.onQuiz],
    ] as const) {
      await userEvent.click(within(bar).getByRole('button', { name }));
      expect(handler).toHaveBeenCalledTimes(1);
    }
    expect(within(bar).getByRole('button', { name: /^reset/i })).toBeInTheDocument();
    expect(within(bar).getByRole('group', { name: /text size/i })).toBeInTheDocument();
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
  function renderSheet() {
    const a = actions();
    const onClose = vi.fn();
    render(<MenuSheet {...a} onClose={onClose} />);
    return { a, onClose, sheet: screen.getByRole('dialog', { name: /menu/i }) };
  }

  // @spec LAYOUT-002, LAYOUT-011, PROG-007
  it('holds Step back, Reset, Legend, Library and text size', () => {
    const { sheet } = renderSheet();
    for (const name of [/step back/i, /^reset/i, /legend/i, /library/i]) {
      expect(within(sheet).getByRole('button', { name })).toBeInTheDocument();
    }
    expect(within(sheet).getByRole('group', { name: /text size/i })).toBeInTheDocument();
  });

  // @spec LAYOUT-014
  it('runs the chosen item and closes', async () => {
    const { a, onClose, sheet } = renderSheet();
    await userEvent.click(within(sheet).getByRole('button', { name: /library/i }));
    expect(a.onLibrary).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  // @spec LAYOUT-014
  it('closes when the learner taps outside it', () => {
    const { onClose } = renderSheet();
    fireEvent.click(document.querySelector('.menu-backdrop')!);
    expect(onClose).toHaveBeenCalled();
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
