import { act, renderHook } from '@testing-library/react';
import { initialContent } from '../content/reading';
import { initialSettings, stepTextSize } from '../layout/settings';
import { initialProgress } from '../progression/progression';
import { buildExport, parseImport } from './exportImport';
import { settingsSlice, SETTINGS_KEY } from './settingsSlice';
import { memoryStore } from './testStores';
import { usePersistedSlice } from './usePersistedSlice';

describe('settings slice', () => {
  // @spec PERS-001, PERS-005, LAYOUT-006
  it('saves text size immediately and restores it after a reload', () => {
    const store = memoryStore();
    const first = renderHook(() => usePersistedSlice(store, settingsSlice));
    act(() => first.result.current.update((s) => stepTextSize(s, 1)));
    expect(JSON.parse(store.getItem(SETTINGS_KEY)!)).toEqual({ textSize: 22 });
    first.unmount();

    const reloaded = renderHook(() => usePersistedSlice(store, settingsSlice));
    expect(reloaded.result.current.value.textSize).toBe(22);
  });
});

describe('settings in export and import', () => {
  const data = { progress: initialProgress, content: initialContent, settings: { textSize: 26 } };

  // @spec PERS-002
  it('includes settings in the export', () => {
    expect(JSON.parse(buildExport(data, new Date()).json).settings).toEqual({ textSize: 26 });
  });

  // @spec PERS-003
  it('imports valid settings', () => {
    expect(parseImport(buildExport(data, new Date()).json)).toEqual({ ok: true, data });
  });

  // @spec PERS-007
  it('rejects an export with invalid settings', () => {
    const bad = JSON.stringify({ app: 'script-ramp', version: 1, progress: initialProgress, settings: { textSize: 99 } });
    expect(parseImport(bad)).toEqual({ ok: false });
  });

  // @spec PERS-003
  it('still imports an older export without settings', () => {
    const old = JSON.stringify({ app: 'script-ramp', version: 1, progress: initialProgress });
    expect(parseImport(old)).toEqual({ ok: true, data: { progress: initialProgress } });
    expect(initialSettings.textSize).toBe(20);
  });
});
