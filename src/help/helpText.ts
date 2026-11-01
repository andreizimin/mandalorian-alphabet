/**
 * The Help panel's text, as data, so a test can check that every reader
 * control is explained and the words can change without touching the panel.
 */

import { QUIZ_MIN_LETTERS, SESSION_LENGTH } from '../quiz/session';

/** What the app is and how it teaches. */
export const HELP_INTRO: readonly string[] = [
  'This app teaches you to read the Mandalorian alphabet by reading.',
  'You read real stories in plain English, and one letter at a time turns into its Mandalorian glyph. You learn each glyph from the words around it, until you can read a whole page in Mandalorian.',
];

export interface HelpEntry {
  /** The control or gesture, as the learner sees it. */
  name: string;
  /** What it does. */
  text: string;
}

/** One entry per reader control or gesture, in the order a learner meets them. */
// @spec HELP-001
export const HELP_CONTROLS: readonly HelpEntry[] = [
  {
    name: 'Next letter',
    text: 'Turns the next letter into a glyph. Take it when the current one feels easy; a hint tells you when you look ready.',
  },
  { name: 'Tap a glyph', text: 'Peeks at its word in English. Highlight some text to see all of it in English.' },
  { name: '← →, swipe or tap the page edge', text: 'Turns the page.' },
  // @spec HELP-011
  {
    name: 'Quiz',
    text: `A quick ${SESSION_LENGTH}-question check of the letters you have learned, once you have ${QUIZ_MIN_LETTERS}.`,
  },
  { name: 'Legend', text: 'The letters you have learned so far.' },
  { name: 'Step back', text: 'Takes away the newest letter if it came too soon.' },
  { name: 'Reset', text: 'Starts again from no letters.' },
  { name: 'Library', text: 'Pick another story, paste your own text, or export and import your progress.' },
  { name: 'A− A+ and appearance', text: 'Text size, and Auto, Light or Dark.' },
  { name: 'Feedback and Suggest a feature', text: 'Tell us what is wrong or what you would like.' },
];

/** Shown on phones only, where most controls wait in the menu. */
export const PHONE_NOTE = 'On a phone, the ⋯ key at the bottom holds the controls that are not in the bottom bar.';
