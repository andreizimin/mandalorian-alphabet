import { MAX_TEXT_SIZE, MIN_TEXT_SIZE, initialSettings, stepTextSize, validateSettings } from './settings';

describe('text size setting', () => {
  // @spec LAYOUT-006
  it('defaults to 20 px within a 16 to 32 px range', () => {
    expect(initialSettings.textSize).toBe(20);
    expect([MIN_TEXT_SIZE, MAX_TEXT_SIZE]).toEqual([16, 32]);
  });

  // @spec LAYOUT-006
  it('steps by 2 px and stops at the limits', () => {
    expect(stepTextSize(initialSettings, 1).textSize).toBe(22);
    expect(stepTextSize(initialSettings, -1).textSize).toBe(18);
    const largest = { textSize: 32 };
    const smallest = { textSize: 16 };
    expect(stepTextSize(largest, 1)).toBe(largest);
    expect(stepTextSize(smallest, -1)).toBe(smallest);
  });
});

describe('validateSettings', () => {
  // @spec PERS-003, PERS-006
  it('accepts sizes on the 2 px grid within the range', () => {
    expect(validateSettings(initialSettings)).toBe(true);
    expect(validateSettings({ textSize: 16 })).toBe(true);
    expect(validateSettings({ textSize: 32 })).toBe(true);
  });

  // @spec PERS-003, PERS-006
  it.each<[string, unknown]>([
    ['null', null],
    ['a missing size', {}],
    ['a size below the range', { textSize: 14 }],
    ['a size above the range', { textSize: 34 }],
    ['a size off the 2 px grid', { textSize: 21 }],
    ['a size that is not a number', { textSize: '20' }],
  ])('rejects %s', (_label, value) => {
    expect(validateSettings(value)).toBe(false);
  });
});
