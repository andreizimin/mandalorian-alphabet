import { peekPlacement, selectionPlacement } from './peekPlacement';

const word = { left: 200, top: 300, width: 60, height: 24 };
const popover = { width: 100, height: 40 };
const screen = { width: 400, height: 800 };
const area = { top: 100, bottom: 700 };

describe('peekPlacement', () => {
  // @spec READ-010
  it('centers the popover directly under the word', () => {
    expect(peekPlacement(word, popover, screen, area)).toEqual({ left: 180, top: 330, above: false });
  });

  // @spec READ-010
  it('keeps the popover within the viewport at the left and right edges', () => {
    expect(peekPlacement({ ...word, left: 0 }, popover, screen, area).left).toBe(8);
    expect(peekPlacement({ ...word, left: 380 }, popover, screen, area).left).toBe(400 - 8 - 100);
  });

  // @spec READ-010
  it('puts the popover above the word when there is no room below within the page area', () => {
    const lastLine = { ...word, top: 670 };
    expect(peekPlacement(lastLine, popover, screen, area)).toEqual({ left: 180, top: 670 - 6 - 40, above: true });
  });
});

describe('selectionPlacement', () => {
  const first = { left: 100, top: 300, width: 200, height: 24 };
  const last = { left: 0, top: 324, width: 80, height: 24 };

  // @spec READ-011
  it('sits above the first line of the selection, centered on it', () => {
    expect(selectionPlacement(first, last, popover, screen, area)).toEqual({ left: 150, top: 300 - 6 - 40, above: true });
  });

  // @spec READ-011
  it('drops below the last line when there is no room above within the page area', () => {
    const atTop = { ...first, top: 110 };
    const lastOfThat = { ...last, top: 134 };
    expect(selectionPlacement(atTop, lastOfThat, popover, screen, area)).toEqual({ left: 150, top: 134 + 24 + 6, above: false });
  });

  // @spec READ-011
  it('keeps the popover within the viewport', () => {
    expect(selectionPlacement({ ...first, left: 350 }, last, popover, screen, area).left).toBe(400 - 8 - 100);
  });
});
