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
    expect(glyphText).toHaveLength(8);
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
    it('shows the Latin letter for 1.5 s and counts a peek when a glyph is tapped', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container, onPeek } = renderPage();
      const glyph = container.querySelector('.g')!; // the capital T in "The"

      await user.click(glyph);

      expect(screen.getByRole('tooltip')).toHaveTextContent('T');
      expect(onPeek).toHaveBeenCalledTimes(1);
      expect(onPeek).toHaveBeenCalledWith('t');

      act(() => vi.advanceTimersByTime(1400));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(200));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
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
