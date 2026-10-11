import { classifyGesture } from './gestures';

const width = 400; // edge zones: x < 60 and x > 340
const at = (x: number, y = 300) => ({ x, y });

describe('classifyGesture', () => {
  // @spec LAYOUT-007
  it('turns forward on a left swipe and back on a right swipe', () => {
    expect(classifyGesture({ start: at(300), end: at(200), width, onGlyph: false })).toBe('forward');
    expect(classifyGesture({ start: at(100), end: at(200), width, onGlyph: false })).toBe('back');
  });

  // @spec LAYOUT-007
  it('turns pages on swipes that start on a glyph', () => {
    expect(classifyGesture({ start: at(300), end: at(220), width, onGlyph: true })).toBe('forward');
  });

  // @spec LAYOUT-007
  it('ignores short or mostly vertical movements', () => {
    expect(classifyGesture({ start: at(300), end: at(260), width, onGlyph: false })).toBe('none');
    expect(classifyGesture({ start: at(300, 100), end: at(240, 180), width, onGlyph: false })).toBe('none');
  });

  // @spec LAYOUT-007
  it('turns forward on a tap in the right edge zone and back in the left one', () => {
    expect(classifyGesture({ start: at(380), end: at(382), width, onGlyph: false })).toBe('forward');
    expect(classifyGesture({ start: at(20), end: at(18), width, onGlyph: false })).toBe('back');
  });

  // @spec LAYOUT-007
  it('does nothing on a tap in the middle or on a glyph in an edge zone', () => {
    expect(classifyGesture({ start: at(200), end: at(201), width, onGlyph: false })).toBe('none');
    expect(classifyGesture({ start: at(380), end: at(380), width, onGlyph: true })).toBe('none');
  });

  // @spec LAYOUT-007
  it('treats movement between a tap and a swipe as nothing', () => {
    expect(classifyGesture({ start: at(380), end: at(360), width, onGlyph: false })).toBe('none');
  });
});
