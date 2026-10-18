import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroTerminal } from './IntroTerminal';
import { CHAR_MS, GREETING, LINES, SWITCH_PAUSE_MS } from './typing';

const GREETING_LETTERS = GREETING.replace(/[^a-z]/gi, '').length;
const greeting = () => document.querySelector('.intro-greeting')!;
const goButton = () => screen.queryByRole('button', { name: /let's go/i });

/**
 * Each step arms the next timer only after React has committed the step, so the
 * clock is advanced one character at a time, as it would tick in a browser.
 */
function advance(ms: number) {
  for (let i = 0; i < Math.ceil(ms / CHAR_MS); i++) act(() => vi.advanceTimersByTime(CHAR_MS));
}

function finishTyping() {
  for (let i = 0; i < 5000 && !goButton(); i++) act(() => vi.advanceTimersByTime(CHAR_MS));
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: matches && /reduced-motion/.test(query), media: query }));
}

describe('IntroTerminal', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReducedMotion(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // @spec INTRO-001, INTRO-002
  it('types the greeting in glyphs, then redraws it in the reading font', () => {
    render(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    expect(greeting().textContent).toBe('');

    advance(CHAR_MS * GREETING.length);
    expect(greeting().textContent).toBe(GREETING);
    expect(greeting().querySelectorAll('.g')).toHaveLength(GREETING_LETTERS);
    expect(goButton()).toBeNull();

    advance(SWITCH_PAUSE_MS);
    expect(greeting().textContent).toBe(GREETING);
    expect(greeting().querySelectorAll('.g')).toHaveLength(0);
  });

  // @spec INTRO-001, INTRO-003, INTRO-004
  it('shows the Let\'s go button only once every line is typed, and reports the tap', async () => {
    const onDone = vi.fn();
    render(<IntroTerminal fontState="loaded" onDone={onDone} />);
    expect(goButton()).toBeNull();

    finishTyping();

    const terminal = document.querySelector('.terminal')!;
    for (const line of LINES) expect(terminal.textContent).toContain(line);
    expect(goButton()).not.toBeNull();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.click(goButton()!);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  // @spec INTRO-005
  it('finishes the text at once when the terminal is tapped while typing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    advance(CHAR_MS * 3);
    expect(greeting().textContent).toBe(GREETING.slice(0, 3));
    expect(goButton()).toBeNull();

    await user.click(document.querySelector('.terminal')!);

    expect(greeting().textContent).toBe(GREETING);
    expect(greeting().querySelectorAll('.g')).toHaveLength(0);
    expect(document.querySelector('.terminal')!.textContent).toContain(LINES[LINES.length - 1]);
    expect(goButton()).not.toBeNull();
  });

  // @spec INTRO-006
  it('shows only the cursor until the glyph font has loaded, then types', () => {
    const { rerender } = render(<IntroTerminal fontState="loading" onDone={() => {}} />);
    advance(CHAR_MS * 20);
    expect(document.querySelector('.cursor')).not.toBeNull();
    expect(greeting().textContent).toBe('');

    rerender(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    advance(CHAR_MS * 3);
    expect(greeting().textContent).toBe(GREETING.slice(0, 3));
  });

  // @spec INTRO-006
  it('types the greeting in the reading font when the glyph font failed', () => {
    render(<IntroTerminal fontState="failed" onDone={() => {}} />);
    advance(CHAR_MS * GREETING.length);
    expect(greeting().textContent).toBe(GREETING);
    expect(greeting().querySelectorAll('.g')).toHaveLength(0);
  });

  // @spec INTRO-007
  it('shows the whole text at once when the browser asks for reduced motion', () => {
    mockReducedMotion(true);
    render(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    expect(greeting().textContent).toBe(GREETING);
    expect(greeting().querySelectorAll('.g')).toHaveLength(0);
    expect(goButton()).not.toBeNull();
  });
});
