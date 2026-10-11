export const MAX_PASTE_CHARS = 100_000;
const TITLE_WORDS = 6;

export type PasteResult =
  | { ok: true; title: string; paragraphs: string[] }
  | { ok: false; reason: 'no-letters' | 'too-long' };

// @spec TEXT-007, TEXT-008
export function parsePaste(text: string): PasteResult {
  if (text.length > MAX_PASTE_CHARS) return { ok: false, reason: 'too-long' };
  if (!/[a-z]/i.test(text)) return { ok: false, reason: 'no-letters' };

  const normalized = text.replace(/\r\n?/g, '\n');
  const hasBlankLines = /\n[ \t]*\n/.test(normalized.trim());
  const chunks = hasBlankLines ? normalized.split(/\n[ \t]*\n/) : normalized.split('\n');
  const paragraphs = chunks.map((c) => c.replace(/\s+/g, ' ').trim()).filter(Boolean);

  const firstWords = paragraphs[0].split(' ');
  const title = firstWords.slice(0, TITLE_WORDS).join(' ') + (firstWords.length > TITLE_WORDS ? '…' : '');
  return { ok: true, title, paragraphs };
}
