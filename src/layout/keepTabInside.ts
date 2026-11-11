/**
 * Moves Tab and Shift+Tab through a dialog's own keys, wrapping at both ends, so focus never reaches
 * the page behind. Every press is handled here rather than left to the browser, because Safari's
 * default Tab skips buttons and would carry focus out of the dialog.
 */
export function keepTabInside(e: KeyboardEvent, dialog: HTMLElement | null) {
  if (!dialog) return;
  const keys = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled])')];
  if (keys.length === 0) return;
  e.preventDefault();
  const at = keys.indexOf(document.activeElement as HTMLElement);
  const next = at === -1 ? (e.shiftKey ? keys.length - 1 : 0) : (at + (e.shiftKey ? -1 : 1) + keys.length) % keys.length;
  keys[next].focus();
}

/** Moves focus to the first key in the dialog that is not disabled. */
export function focusFirstKey(dialog: HTMLElement | null) {
  dialog?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
}
