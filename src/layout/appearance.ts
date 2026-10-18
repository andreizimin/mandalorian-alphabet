import type { Appearance } from './settings';

/**
 * Applies the appearance setting to the document root. Light and Dark set
 * `data-appearance`, which the stylesheet uses to select the color tokens and
 * `color-scheme`; Auto removes it, so the system appearance applies.
 */
// @spec LAYOUT-005, LAYOUT-017
export function applyAppearance(root: HTMLElement, appearance: Appearance) {
  if (appearance === 'system') delete root.dataset.appearance;
  else root.dataset.appearance = appearance;
}
