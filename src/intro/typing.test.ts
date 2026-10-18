import {
  CHAR_MS,
  FINISHED,
  GREETING,
  LINES,
  LINE_PAUSE_MS,
  START,
  SWITCH_PAUSE_MS,
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
  it('greets with "Hello, adventurer!"', () => {
    expect(GREETING).toBe('Hello, adventurer!');
  });

  // @spec INTRO-003
  it('says the learner does not read Mando\'a yet and explains how they will learn', () => {
    const text = LINES.join(' ');
    expect(text).toMatch(/don't read Mando'a yet/);
    expect(text).toMatch(/real stories/);
    expect(text).toMatch(/one letter at a time/);
    expect(text).toMatch(/Next letter/);
    expect(text).toMatch(/peek/i);
    expect(text).toMatch(/quiz/i);
  });
});

describe('the typing schedule', () => {
  // @spec INTRO-002
  it('types the whole greeting in glyphs before anything else, then switches it to English', () => {
    const typed = steps(START, GREETING.length);
    expect(typed).toEqual({ greeting: GREETING.length, glyphs: true, lines: LINES.map(() => 0) });

    const switched = step(typed);
    expect(switched).toEqual({ greeting: GREETING.length, glyphs: false, lines: LINES.map(() => 0) });
  });

  // @spec INTRO-001, INTRO-003
  it('then types the English lines in order, one character at a time, until finished', () => {
    const afterSwitch = steps(START, GREETING.length + 1);
    const firstLine = steps(afterSwitch, LINES[0].length);
    expect(firstLine.lines[0]).toBe(LINES[0].length);
    expect(firstLine.lines.slice(1).every((n) => n === 0)).toBe(true);

    const total = GREETING.length + 1 + LINES.reduce((sum, line) => sum + line.length, 0);
    const end = steps(START, total);
    expect(end).toEqual(FINISHED);
    expect(isFinished(end)).toBe(true);
    expect(isFinished(steps(START, total - 1))).toBe(false);
    expect(step(FINISHED)).toEqual(FINISHED);
  });

  // @spec INTRO-001
  it('pauses after the greeting, after the switch and at the end of each line', () => {
    expect(delayAfter(START)).toBe(CHAR_MS);
    const typed = steps(START, GREETING.length);
    expect(delayAfter(typed)).toBe(SWITCH_PAUSE_MS);
    const switched = step(typed);
    expect(delayAfter(switched)).toBe(SWITCH_PAUSE_MS);
    expect(delayAfter(step(switched))).toBe(CHAR_MS);
    const lineDone = steps(switched, LINES[0].length);
    expect(delayAfter(lineDone)).toBe(LINE_PAUSE_MS);
    expect(delayAfter(FINISHED)).toBe(0);
  });
});
