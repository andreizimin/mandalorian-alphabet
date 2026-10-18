import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroTerminal } from './IntroTerminal';
import { CHAR_MS, GREETING, LINES } from './typing';

const GREETING_LETTERS = GREETING.replace(/[^a-z]/gi, '').length;
const greeting = () => document.querySelector('.intro-greeting')!;
const english = () => document.querySelector('.intro-greeting-english');
const prompt = () => document.querySelector('.intro-continue');
const terminal = () => document.querySelector('.terminal')!;
const goButton = () => screen.queryByRole('button', { name: /let's go/i });

/**
 * Each step arms the next timer only after React has committed the step, so the
 * clock is advanced one character at a time, as it would tick in a browser.
 */
function advance(ms: number) {
  for (let i = 0; i < Math.ceil(ms / CHAR_MS); i++) act(() => vi.advanceTimersByTime(CHAR_MS));
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: matches && /reduced-motion/.test(query), media: query }));
}

describe('IntroTerminal', () => {
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockReducedMotion(false);
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Taps through every paragraph: finish the current one, start the next, until Let's go shows. */
  async function tapThrough() {
    for (let i = 0; i < 20 && !goButton(); i++) await user.click(terminal());
  }

  // @spec INTRO-001, INTRO-002, INTRO-009
  it('types the greeting in glyphs, then waits for a tap; its English types beneath while the glyphs stay', async () => {
    render(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    expect(greeting().textContent).toBe('');
    expect(prompt()).toBeNull();

    advance(CHAR_MS * GREETING.length);
    expect(greeting().textContent).toBe(GREETING);
    expect(greeting().querySelectorAll('.g')).toHaveLength(GREETING_LETTERS);
    expect(english()).toBeNull();
    expect(prompt()).not.toBeNull();

    advance(CHAR_MS * 200); // time alone brings nothing more
    expect(english()).toBeNull();

    await user.click(terminal());
    expect(prompt()).toBeNull();
    advance(CHAR_MS * GREETING.length);
    expect(english()!.textContent).toBe(GREETING);
    expect(english()!.querySelectorAll('.g')).toHaveLength(0);
    expect(greeting().querySelectorAll('.g')).toHaveLength(GREETING_LETTERS);
    expect(prompt()).not.toBeNull();
    expect(goButton()).toBeNull();
  });

  // @spec INTRO-005
  it('a tap while a paragraph is typing finishes that paragraph only', async () => {
    render(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    advance(CHAR_MS * 3);
    expect(greeting().textContent).toBe(GREETING.slice(0, 3));

    await user.click(terminal());
    expect(greeting().textContent).toBe(GREETING);
    expect(english()).toBeNull();

    await user.click(terminal()); // starts the English greeting
    advance(CHAR_MS * 4);
    await user.click(terminal()); // finishes it
    expect(english()!.textContent).toBe(GREETING);
    expect(document.querySelectorAll('.terminal p.intro-line')).toHaveLength(0);
    expect(goButton()).toBeNull();
  });

  // @spec INTRO-001, INTRO-003, INTRO-004, INTRO-009
  it("shows the Let's go button only once every paragraph has been brought by a tap, and reports the tap", async () => {
    const onDone = vi.fn();
    render(<IntroTerminal fontState="loaded" onDone={onDone} />);
    advance(CHAR_MS * 2000);
    expect(goButton()).toBeNull(); // the greeting waits forever on its own

    await tapThrough();

    for (const line of LINES) expect(terminal().textContent).toContain(line);
    expect(prompt()).toBeNull();
    expect(goButton()).not.toBeNull();

    await user.click(goButton()!);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  // @spec INTRO-003
  it("draws Mando'a and Mandalorian in glyphs inside the English lines, and nothing else", async () => {
    render(<IntroTerminal fontState="loaded" onDone={() => {}} />);
    await tapThrough();

    const lines = Array.from(document.querySelectorAll('.terminal p.intro-line'));
    const glyphWords = lines.flatMap((p) => Array.from(p.querySelectorAll('[role="img"]')).map((w) => w.getAttribute('aria-label')));
    expect(new Set(glyphWords)).toEqual(new Set(["Mando'a", 'Mandalorian']));
    expect(glyphWords.length).toBeGreaterThanOrEqual(3);
    for (const p of lines) {
      for (const g of p.querySelectorAll('.g')) expect(g.closest('[role="img"]')).not.toBeNull();
    }
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
    expect(greeting().querySelectorAll('.g')).toHaveLength(GREETING_LETTERS);
    expect(english()!.textContent).toBe(GREETING);
    expect(goButton()).not.toBeNull();
  });
});
