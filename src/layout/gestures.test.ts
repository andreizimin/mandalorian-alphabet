import { renderHook } from '@testing-library/react';
import { classifyGesture, usePageGestures } from './gestures';

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

describe('usePageGestures and the feedback widget', () => {
  // jsdom has no PointerEvent; a MouseEvent with the pointer event type carries the coordinates.
  function tapRightEdge(target: Element) {
    const init = { bubbles: true, clientX: window.innerWidth - 5, clientY: 300, button: 0 };
    target.dispatchEvent(new MouseEvent('pointerdown', init));
    target.dispatchEvent(new MouseEvent('pointerup', init));
  }

  // @spec FEED-004
  it('turns pages from the page itself but never from inside the feedback widget', () => {
    const onBack = vi.fn();
    const onForward = vi.fn();
    renderHook(() => usePageGestures({ enabled: true, onBack, onForward }));
    const page = document.createElement('div');
    const host = document.createElement('div');
    host.id = 'feedback-widget-host';
    document.body.append(page, host);

    tapRightEdge(host);
    expect(onForward).not.toHaveBeenCalled();

    tapRightEdge(page);
    expect(onForward).toHaveBeenCalledTimes(1);
    page.remove();
    host.remove();
  });
});
