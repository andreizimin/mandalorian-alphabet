import { EVERYDAY_WORDS, GALAXY_WORDS } from './wordPool';

describe('word pool', () => {
  // @spec QUIZ-024
  it('holds only lowercase single words of 3 to 6 letters a-z', () => {
    for (const word of [...EVERYDAY_WORDS, ...GALAXY_WORDS]) expect(word).toMatch(/^[a-z]{3,6}$/);
  });

  // @spec QUIZ-024
  it('has two non-overlapping groups with no duplicates', () => {
    expect(new Set(EVERYDAY_WORDS).size).toBe(EVERYDAY_WORDS.length);
    expect(new Set(GALAXY_WORDS).size).toBe(GALAXY_WORDS.length);
    expect(EVERYDAY_WORDS.filter((w) => GALAXY_WORDS.includes(w))).toEqual([]);
    expect(GALAXY_WORDS).toEqual(expect.arrayContaining(['jedi', 'mando', 'beskar', 'droid']));
  });

  // @spec QUIZ-024, QUIZ-010
  it('lets word questions start once E, T, A and O are learned', () => {
    const qualifying = EVERYDAY_WORDS.filter((w) => [...w].every((c) => 'etao'.includes(c)));
    expect(qualifying.length).toBeGreaterThanOrEqual(8);
  });
});
