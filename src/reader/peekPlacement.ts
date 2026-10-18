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

  return { left: clampLeft(word, popover, viewport), top, above };
}

function clampLeft(anchor: Box, popover: Size, viewport: Size): number {
  const centered = anchor.left + anchor.width / 2 - popover.width / 2;
  const maxLeft = Math.max(PEEK_MARGIN, viewport.width - PEEK_MARGIN - popover.width);
  return Math.min(Math.max(centered, PEEK_MARGIN), maxLeft);
}

/**
 * Where the selection popover goes: above the selection's first line, centered
 * on it, or below its last line when there is no room above within the page
 * area; kept within the viewport's width.
 */
// @spec READ-011
export function selectionPlacement(first: Box, last: Box, popover: Size, viewport: Size, area: Area): Placement {
  const aboveTop = first.top - PEEK_GAP - popover.height;
  const above = aboveTop >= area.top;
  const top = above ? aboveTop : last.top + last.height + PEEK_GAP;
  return { left: clampLeft(first, popover, viewport), top, above };
}
