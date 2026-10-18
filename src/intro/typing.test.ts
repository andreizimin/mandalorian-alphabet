import {
  CHAR_MS,
  FINISHED,
  GLYPH_WORDS,
  GREETING,
  LINES,
  START,
  delayAfter,
  isFinished,
  isWaiting,
  step,
  tap,
  type Frame,
} from './typing';

function steps(from: Frame, count: number): Frame {
  let frame = from;
  for (let i = 0; i < count; i++) frame = step(frame);
  return frame;
}

describe('the intro script', () => {
  // @spec INTRO-002
  it('greets with "Hello, adventurer!", and repeats it in English as the first line', () => {
    expect(GREETING).toBe('Hello, adventurer!');
    expect(LINES[0]).toBe(GREETING);
  });

  // @spec INTRO-003
  it("says the learner does not read Mando'a yet and explains how they will learn", () => {
    const text = LINES.slice(1).join(' ');
    expect(text).toMatch(/don't read Mando'a yet/);
    expect(text).toMatch(/real stories/);
    expect(text).toMatch(/one letter at a time/);
    expect(text).toMatch(/Next letter/);
    expect(text).toMatch(/peek/i);
    expect(text).toMatch(/quiz/i);
  });

  // @spec INTRO-003
  it('sprinkles glyphs into the message: the Mandalorian words are drawn in glyphs and occur in the text', () => {
    expect(GLYPH_WORDS).toEqual(["Mando'a", 'Mandalorian']);
    for (const word of GLYPH_WORDS) expect(LINES.slice(1).join(' ')).toContain(word);
  });
});

describe('the typing schedule', () => {
  // @spec INTRO-002, INTRO-009
  it('types the whole glyph greeting, then waits for a tap instead of going on', () => {
    const typed = steps(START, GREETING.length);
    expect(typed).toEqual({ greeting: GREETING.length, lines: LINES.map(() => 0) });
    expect(isWaiting(typed)).toBe(true);
    expect(delayAfter(typed)).toBeNull();
    expect(step(typed)).toEqual(typed);
  });

  // @spec INTRO-005, INTRO-009
  it('a tap while waiting starts the next paragraph, which then types on its own', () => {
    const typed = steps(START, GREETING.length);
    const started = tap(typed);
    expect(started.lines[0]).toBe(1);
    expect(isWaiting(started)).toBe(false);
    expect(delayAfter(started)).toBe(CHAR_MS);

    const english = steps(started, GREETING.length - 1);
    expect(english.lines[0]).toBe(GREETING.length);
    expect(english.lines.slice(1).every((n) => n === 0)).toBe(true);
    expect(isWaiting(english)).toBe(true);
  });

  // @spec INTRO-005
  it('a tap while typing finishes the current paragraph only', () => {
    const partGreeting = steps(START, 3);
    const greeted = tap(partGreeting);
    expect(greeted).toEqual({ greeting: GREETING.length, lines: LINES.map(() => 0) });

    const partLine = steps(tap(greeted), 4);
    const lineDone = tap(partLine);
    expect(lineDone.lines[0]).toBe(LINES[0].length);
    expect(lineDone.lines[1]).toBe(0);
  });

  // @spec INTRO-001, INTRO-004
  it('reaches the end after a tap per paragraph, and stays there', () => {
    let frame = steps(START, GREETING.length);
    for (const line of LINES) {
      frame = tap(frame);
      frame = steps(frame, line.length - 1);
    }
    expect(frame).toEqual(FINISHED);
    expect(isFinished(frame)).toBe(true);
    expect(isWaiting(frame)).toBe(false);
    expect(delayAfter(frame)).toBeNull();
    expect(tap(FINISHED)).toEqual(FINISHED);
    expect(step(FINISHED)).toEqual(FINISHED);
  });

  // @spec INTRO-001
  it('types characters evenly within a paragraph', () => {
    expect(delayAfter(START)).toBe(CHAR_MS);
    expect(delayAfter(steps(START, 5))).toBe(CHAR_MS);
  });
});
