/**
 * The intro terminal's script and typing schedule, as data and pure functions,
 * so the text and the order of events can be checked without timers.
 */

/** Typed first, every letter drawn as a glyph; it stays on screen while the rest is typed. */
export const GREETING = 'Hello, adventurer!';

/** Words in the English lines that are drawn in glyphs: a taste of the script inside the message. */
export const GLYPH_WORDS: readonly string[] = ["Mando'a", 'Mandalorian'];

/**
 * The lines typed under the glyph greeting, in order. The first is the greeting
 * in English; the rest explain the app.
 */
export const LINES: readonly string[] = [
  GREETING,
  "You don't read Mando'a yet. Nobody does on their first day.",
  "Here's how you'll learn it: you read real stories in plain English, and one letter at a time turns into Mandalorian.",
  "Tap Next letter when you're ready for a new one. Stuck on a glyph? Tap it to peek at the word underneath. Take the quiz whenever you want to test yourself.",
  "By the end, you'll read a whole page in Mandalorian.",
];

export const CHAR_MS = 28;
/** How long the glyph greeting stands alone before its English is typed beneath it. */
export const HOLD_MS = 2500;
export const LINE_PAUSE_MS = 450;

export interface Frame {
  /** How many characters of the glyph greeting are shown. */
  greeting: number;
  /** How many characters of each line are shown. */
  lines: readonly number[];
}

export const START: Frame = { greeting: 0, lines: LINES.map(() => 0) };
export const FINISHED: Frame = { greeting: GREETING.length, lines: LINES.map((line) => line.length) };

/** The index of the line being typed, or -1 when every line is complete. */
export function currentLine(frame: Frame): number {
  return frame.lines.findIndex((shown, i) => shown < LINES[i].length);
}

// @spec INTRO-001
export function isFinished(frame: Frame): boolean {
  return frame.greeting === GREETING.length && currentLine(frame) === -1;
}

/** One step of the schedule: the next greeting character, or the next character of the current line. */
// @spec INTRO-001, INTRO-002, INTRO-003
export function step(frame: Frame): Frame {
  if (frame.greeting < GREETING.length) return { ...frame, greeting: frame.greeting + 1 };
  const line = currentLine(frame);
  if (line === -1) return frame;
  return { ...frame, lines: frame.lines.map((shown, i) => (i === line ? shown + 1 : shown)) };
}

/** How long to wait after showing `frame` before the next step. */
// @spec INTRO-001, INTRO-002
export function delayAfter(frame: Frame): number {
  if (frame.greeting < GREETING.length) return CHAR_MS;
  const line = currentLine(frame);
  if (line === -1) return 0;
  if (frame.lines[line] === 0) return line === 0 ? HOLD_MS : LINE_PAUSE_MS;
  return CHAR_MS;
}
