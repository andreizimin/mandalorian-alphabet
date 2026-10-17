import { applyAppearance } from './appearance';

describe('applyAppearance', () => {
  // @spec LAYOUT-017
  it('marks the document root with a chosen appearance', () => {
    const root = document.createElement('html');
    applyAppearance(root, 'dark');
    expect(root.dataset.appearance).toBe('dark');
    applyAppearance(root, 'light');
    expect(root.dataset.appearance).toBe('light');
  });

  // @spec LAYOUT-005, LAYOUT-017
  it('removes the mark for Auto, so the system appearance applies', () => {
    const root = document.createElement('html');
    applyAppearance(root, 'dark');
    applyAppearance(root, 'system');
    expect(root.hasAttribute('data-appearance')).toBe(false);
  });
});
