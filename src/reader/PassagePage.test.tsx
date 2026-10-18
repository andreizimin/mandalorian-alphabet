import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassagePage } from './PassagePage';

const learned = new Set(['e', 't']);
const paragraphs = ['The east gate.', 'Enter here.'];

function renderPage(overrides: Partial<Parameters<typeof PassagePage>[0]> = {}) {
  const onPeek = vi.fn();
  const onPageTurn = vi.fn();
  const utils = render(
    <PassagePage
      paragraphs={paragraphs}
      learnedSet={learned}
      onPeek={onPeek}
      onPageTurn={onPageTurn}
      {...overrides}
    />,
  );
  return { ...utils, onPeek, onPageTurn };
}

describe('PassagePage', () => {
  // @spec READ-001
  it('renders every learned letter as a glyph and nothing else', () => {
    const { container } = renderPage();

    const glyphText = Array.from(container.querySelectorAll('.g')).map((g) => g.textContent!.toLowerCase());
    expect(new Set(glyphText)).toEqual(learned);
    expect(glyphText).toHaveLength(11); // The east gate. (6) + Enter here. (5)
  });

  // @spec READ-001
  it('renders each paragraph as its own paragraph element', () => {
    const { container } = renderPage();
    const ps = container.querySelectorAll('p');
    expect(ps).toHaveLength(2);
    expect(ps[0].textContent).toBe(paragraphs[0]);
    expect(ps[1].textContent).toBe(paragraphs[1]);
  });

  describe('peek', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    // @spec READ-004
    it('shows the whole word with the tapped letter marked for 1.5 s and counts a peek when a glyph is tapped', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container, onPeek } = renderPage();
      const glyph = container.querySelector('.g')!; // the capital T in "The"

      await user.click(glyph);

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(/^The$/);
      expect(Array.from(tooltip.querySelectorAll('.peek-letter')).map((m) => m.textContent)).toEqual(['T']);
      expect(tooltip.querySelector('.g')).toBeNull(); // the reading font, not glyphs
      expect(onPeek).toHaveBeenCalledTimes(1);
      expect(onPeek).toHaveBeenCalledWith('t');

      act(() => vi.advanceTimersByTime(1400));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(200));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    // @spec READ-004
    it('marks every occurrence of the tapped letter in the word, in either case', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = renderPage();
      const enter = Array.from(container.querySelectorAll('[role="img"]')).find((w) => w.getAttribute('aria-label') === 'Enter')!;

      await user.click(enter.querySelector('.g')!); // the capital E

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(/^Enter$/);
      expect(Array.from(tooltip.querySelectorAll('.peek-letter')).map((m) => m.textContent)).toEqual(['E', 'e']);
    });

    // @spec READ-004
    it('replaces the word when another glyph is tapped', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = renderPage();
      const glyphs = container.querySelectorAll('.g');

      await user.click(glyphs[0]); // The
      await user.click(glyphs[glyphs.length - 1]); // here.

      expect(screen.getAllByRole('tooltip')).toHaveLength(1);
      expect(screen.getByRole('tooltip')).toHaveTextContent(/^here\.$/);
    });

    // @spec READ-004
    it('never turns the page on a glyph tap, wherever the glyph sits', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container, onPageTurn } = renderPage();
      const all = container.querySelectorAll('.g');

      await user.click(all[0]);
      await user.click(all[all.length - 1]);

      expect(onPageTurn).not.toHaveBeenCalled();
    });

    // @spec READ-004
    it('does not count a peek when a non-glyph character is tapped', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container, onPeek } = renderPage();

      await user.click(container.querySelector('p')!);

      expect(onPeek).not.toHaveBeenCalled();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});

describe('PassagePage selection X-ray', () => {
  function select(container: HTMLElement, from: number, to: number) {
    const text = container.querySelector('p')!;
    const range = document.createRange();
    range.setStart(text, from);
    range.setEnd(text, to);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });
  }

  afterEach(() => document.getSelection()?.removeAllRanges());

  // @spec READ-011
  it('shows the selected text in the reading font while it is selected, without counting a peek', () => {
    const { container, onPeek } = renderPage();
    const paragraph = container.querySelector('p')!;
    select(container, 0, paragraph.childNodes.length);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('The east gate.');
    expect(tooltip).toHaveClass('peek-selection');
    expect(tooltip.querySelector('.g')).toBeNull();
    expect(onPeek).not.toHaveBeenCalled();
  });

  // @spec READ-011
  it('removes the popover when the selection is cleared', () => {
    const { container } = renderPage();
    const paragraph = container.querySelector('p')!;
    select(container, 0, paragraph.childNodes.length);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    document.getSelection()!.removeAllRanges();
    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  // @spec READ-011
  it('ignores selections outside the page', () => {
    const { onPeek } = renderPage();
    const outside = document.createElement('p');
    outside.textContent = 'elsewhere';
    document.body.append(outside);
    const range = document.createRange();
    range.selectNodeContents(outside);
    document.getSelection()!.addRange(range);
    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(onPeek).not.toHaveBeenCalled();
    outside.remove();
  });
});

describe('PassagePage newest-letter highlight', () => {
  const highlighted = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('.g.g-new')).map((g) => g.textContent!.toLowerCase());

  // @spec READ-008
  it('highlights every occurrence of the newest learned letter and no other glyph', () => {
    const { container } = renderPage({ newestLetter: 't' });
    expect(highlighted(container)).toEqual(['t', 't', 't', 't']); // The, east, gate, Enter
    expect(container.querySelectorAll('.g')).toHaveLength(11);
  });

  // @spec READ-008
  it('moves the highlight when the newest letter changes, and shows none without one', () => {
    const { container, rerender } = renderPage({ newestLetter: 't' });
    rerender(
      <PassagePage paragraphs={paragraphs} learnedSet={learned} newestLetter="e" onPeek={() => {}} onPageTurn={() => {}} />,
    );
    expect(new Set(highlighted(container))).toEqual(new Set(['e']));
    expect(highlighted(container)).toHaveLength(7);

    rerender(<PassagePage paragraphs={paragraphs} learnedSet={learned} onPeek={() => {}} onPageTurn={() => {}} />);
    expect(highlighted(container)).toEqual([]);
  });
});
