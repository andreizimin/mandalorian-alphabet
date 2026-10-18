/**
 * The intro terminal's script and typing schedule, as data and pure functions,
 * so the text and the order of events can be checked without timers.
 */

/** Typed first, every letter drawn as a glyph, then redrawn in the reading font. */
export const GREETING = 'Hello, adventurer!';

/** The English lines, typed after the greeting has switched to English. */
export const LINES: readonly string[] = [
  "You don't read Mando'a yet. Nobody does on their first day.",
  "Here's how you'll learn it: you read real stories in plain English, and one letter at a time turns into Mandalorian.",
  "Tap Next letter when you're ready for a new one. Stuck on a glyph? Tap it to peek at the word underneath. Take the quiz whenever you want to test yourself.",
  "By the end, you'll read a whole page in Mandalorian.",
];

export const CHAR_MS = 28;
export const SWITCH_PAUSE_MS = 900;
export const LINE_PAUSE_MS = 450;

export interface Frame {
  /** How many characters of the greeting are shown. */
  greeting: number;
  /** The greeting is drawn in glyphs; false once it has been redrawn in the reading font. */
  glyphs: boolean;
  /** How many characters of each English line are shown. */
  lines: readonly number[];
}

export const START: Frame = { greeting: 0, glyphs: true, lines: LINES.map(() => 0) };
export const FINISHED: Frame = { greeting: GREETING.length, glyphs: false, lines: LINES.map((line) => line.length) };

/** The index of the English line being typed, or -1 when every line is complete. */
function currentLine(frame: Frame): number {
  return frame.lines.findIndex((shown, i) => shown < LINES[i].length);
}

// @spec INTRO-001
export function isFinished(frame: Frame): boolean {
  return !frame.glyphs && currentLine(frame) === -1;
}

/** One step of the schedule: the next greeting character, the switch, or the next English character. */
// @spec INTRO-001, INTRO-002, INTRO-003
export function step(frame: Frame): Frame {
  if (frame.greeting < GREETING.length) return { ...frame, greeting: frame.greeting + 1 };
  if (frame.glyphs) return { ...frame, glyphs: false };
  const line = currentLine(frame);
  if (line === -1) return frame;
  return { ...frame, lines: frame.lines.map((shown, i) => (i === line ? shown + 1 : shown)) };
}

/** How long to wait after showing `frame` before the next step. */
// @spec INTRO-001
export function delayAfter(frame: Frame): number {
  if (frame.greeting < GREETING.length) return CHAR_MS;
  if (frame.glyphs) return SWITCH_PAUSE_MS;
  const line = currentLine(frame);
  if (line === -1) return 0;
  if (frame.lines[line] === 0) return line === 0 ? SWITCH_PAUSE_MS : LINE_PAUSE_MS;
  return CHAR_MS;
}
