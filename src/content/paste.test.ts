import { MAX_PASTE_CHARS, parsePaste } from './paste';

const paragraphsOf = (text: string) => {
  const result = parsePaste(text);
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result.paragraphs;
};

describe('parsePaste', () => {
  // @spec TEXT-007
  it('splits on blank lines and joins hard-wrapped lines within a paragraph', () => {
    expect(paragraphsOf('First line\nwraps here.\n\nSecond para.')).toEqual(['First line wraps here.', 'Second para.']);
  });

  // @spec TEXT-007
  it('treats each line as a paragraph when there are no blank lines', () => {
    expect(paragraphsOf('One.\nTwo.\nThree.')).toEqual(['One.', 'Two.', 'Three.']);
  });

  // @spec TEXT-007
  it('collapses whitespace, drops empty paragraphs and handles Windows line endings', () => {
    expect(paragraphsOf('  a   b \t c  ')).toEqual(['a b c']);
    expect(paragraphsOf('\n\n\nA\n\n\n\nB\n\n')).toEqual(['A', 'B']);
    expect(paragraphsOf('A\r\n\r\nB')).toEqual(['A', 'B']);
  });

  // @spec TEXT-007
  it('titles the passage with the first six words of its first paragraph', () => {
    const long = parsePaste('The quick brown fox jumps over the lazy dog.\n\nMore.');
    const six = parsePaste('This is the way, said Din.');
    const short = parsePaste('Hello there');

    expect(long.ok && long.title).toBe('The quick brown fox jumps over…');
    expect(six.ok && six.title).toBe('This is the way, said Din.');
    expect(short.ok && short.title).toBe('Hello there');
  });

  // @spec TEXT-008
  it('refuses text with no letter a-z', () => {
    expect(parsePaste('')).toEqual({ ok: false, reason: 'no-letters' });
    expect(parsePaste('123 !! 42')).toEqual({ ok: false, reason: 'no-letters' });
    expect(parsePaste('été über')).toEqual({ ok: false, reason: 'no-letters' });
  });

  // @spec TEXT-008
  it('refuses text over 100,000 characters and accepts exactly the limit', () => {
    expect(MAX_PASTE_CHARS).toBe(100_000);
    expect(parsePaste('a'.repeat(100_001))).toEqual({ ok: false, reason: 'too-long' });
    expect(parsePaste('a'.repeat(100_000)).ok).toBe(true);
  });
});
