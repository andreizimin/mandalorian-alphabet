import {
  CHAR_MS,
  FINISHED,
  GLYPH_WORDS,
  GREETING,
  HOLD_MS,
  LINES,
  LINE_PAUSE_MS,
  START,
  delayAfter,
  isFinished,
  step,
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
  // @spec INTRO-002
  it('types the whole glyph greeting before anything else, then holds it before the English starts', () => {
    const typed = steps(START, GREETING.length);
    expect(typed).toEqual({ greeting: GREETING.length, lines: LINES.map(() => 0) });
    expect(delayAfter(typed)).toBe(HOLD_MS);

    const english = steps(typed, GREETING.length);
    expect(english.greeting).toBe(GREETING.length);
    expect(english.lines[0]).toBe(GREETING.length);
    expect(english.lines.slice(1).every((n) => n === 0)).toBe(true);
  });

  // @spec INTRO-001, INTRO-003
  it('then types the lines in order, one character at a time, until finished', () => {
    const total = GREETING.length + LINES.reduce((sum, line) => sum + line.length, 0);
    const end = steps(START, total);
    expect(end).toEqual(FINISHED);
    expect(isFinished(end)).toBe(true);
    expect(isFinished(steps(START, total - 1))).toBe(false);
    expect(step(FINISHED)).toEqual(FINISHED);
  });

  // @spec INTRO-001
  it('pauses at the end of each line, and types characters evenly otherwise', () => {
    expect(delayAfter(START)).toBe(CHAR_MS);
    const typed = steps(START, GREETING.length);
    expect(delayAfter(step(typed))).toBe(CHAR_MS);
    const firstLineDone = steps(typed, LINES[0].length);
    expect(delayAfter(firstLineDone)).toBe(LINE_PAUSE_MS);
    expect(delayAfter(FINISHED)).toBe(0);
  });
});
