export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

/** The vertical extent of the page area; the popover stays inside it. */
export interface Area {
  top: number;
  bottom: number;
}

export interface Placement {
  left: number;
  top: number;
  /** True when the popover sits above the word because there was no room below. */
  above: boolean;
}

export const PEEK_GAP = 6;
export const PEEK_MARGIN = 8;

/**
 * Where the peek popover goes: centered directly under the word, kept within
 * the viewport's width, and above the word when it would run out of the page
 * area below. All boxes are in viewport coordinates.
 */
// @spec READ-010
export function peekPlacement(word: Box, popover: Size, viewport: Size, area: Area): Placement {
  const below = word.top + word.height + PEEK_GAP;
  const above = below + popover.height > area.bottom;
  const top = above ? word.top - PEEK_GAP - popover.height : below;

  const centered = word.left + word.width / 2 - popover.width / 2;
  const maxLeft = Math.max(PEEK_MARGIN, viewport.width - PEEK_MARGIN - popover.width);
  const left = Math.min(Math.max(centered, PEEK_MARGIN), maxLeft);

  return { left, top, above };
}
