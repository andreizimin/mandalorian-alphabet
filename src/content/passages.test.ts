import { BUNDLED_PASSAGES } from './passages';

const words = (paragraphs: readonly string[]) => paragraphs.join(' ').split(/\s+/).filter(Boolean);

describe('bundled passages', () => {
  // @spec TEXT-001
  it('bundles Call of the Wild, Treasure Island and War of the Worlds, in that order', () => {
    expect(BUNDLED_PASSAGES.map((p) => p.title)).toEqual([
      expect.stringMatching(/call of the wild/i),
      expect.stringMatching(/treasure island/i),
      expect.stringMatching(/war of the worlds/i),
    ]);
    expect(new Set(BUNDLED_PASSAGES.map((p) => p.id)).size).toBe(3);
    expect(BUNDLED_PASSAGES.every((p) => p.source === 'bundled')).toBe(true);
  });

  // @spec TEXT-001
  it.each(BUNDLED_PASSAGES.map((p) => [p.title, p] as const))('%s contains every letter a-z', (_t, passage) => {
    const text = passage.paragraphs.join(' ').toLowerCase();
    const missing = [...'abcdefghijklmnopqrstuvwxyz'].filter((c) => !text.includes(c));
    expect(missing).toEqual([]);
  });

  // @spec TEXT-001
  it.each(BUNDLED_PASSAGES.map((p) => [p.title, p] as const))(
    '%s is a 3,000 to 5,000 word excerpt with clean paragraphs and no Gutenberg boilerplate',
    (_t, passage) => {
      const count = words(passage.paragraphs).length;
      expect(count).toBeGreaterThanOrEqual(3000);
      expect(count).toBeLessThanOrEqual(5000);
      expect(passage.paragraphs.join(' ')).not.toMatch(/gutenberg/i);
      for (const p of passage.paragraphs) {
        expect(p).toBe(p.trim());
        expect(p).not.toMatch(/\n|\s{2,}/);
        expect(p.length).toBeGreaterThan(0);
      }
    },
  );
});
