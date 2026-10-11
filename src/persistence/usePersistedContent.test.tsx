import { act, renderHook } from '@testing-library/react';
import { addPasted, initialContent, openPassage } from '../content/reading';
import { CONTENT_KEY } from './contentSlice';
import { brokenStore, memoryStore } from './testStores';
import { usePersistedContent } from './usePersistedContent';

const paste = { id: 'p1', title: 'Mine', source: 'pasted' as const, paragraphs: ['hello there'] };

describe('usePersistedContent', () => {
  // @spec PERS-001
  it('restores the current passage, positions and pasted passages after a reload', () => {
    const store = memoryStore();
    const first = renderHook(() => usePersistedContent(store));
    act(() => first.result.current.update((c) => openPassage(addPasted(c, paste), 'island')));
    first.unmount();

    const reloaded = renderHook(() => usePersistedContent(store));

    expect(reloaded.result.current.content.currentId).toBe('island');
    expect(reloaded.result.current.content.pasted).toEqual([paste]);
  });

  // @spec PERS-005
  it('writes to storage immediately after each change', () => {
    const store = memoryStore();
    const { result } = renderHook(() => usePersistedContent(store));

    act(() => result.current.update((c) => openPassage(c, 'island')));

    expect(JSON.parse(store.getItem(CONTENT_KEY)!).currentId).toBe('island');
  });

  // @spec PERS-004
  it('keeps working in memory when storage is unavailable', () => {
    const { result } = renderHook(() => usePersistedContent(brokenStore()));
    act(() => result.current.update((c) => openPassage(c, 'island')));
    expect(result.current.content.currentId).toBe('island');
  });

  // @spec PERS-006
  it('starts fresh with a notice and a backup when saved content is unreadable', () => {
    const store = memoryStore({ [CONTENT_KEY]: '{"currentId":7}' });
    const { result } = renderHook(() => usePersistedContent(store));

    expect(result.current.content).toEqual(initialContent);
    expect(result.current.notice).toBe('unreadable');
    expect(store.getItem(`${CONTENT_KEY}:unreadable`)).toBe('{"currentId":7}');
  });

  // @spec PERS-003
  it('replaces and saves the whole content on import', () => {
    const store = memoryStore();
    const { result } = renderHook(() => usePersistedContent(store));
    const imported = addPasted(initialContent, paste);

    act(() => result.current.replace(imported));

    expect(result.current.content).toEqual(imported);
    expect(JSON.parse(store.getItem(CONTENT_KEY)!)).toEqual(imported);
  });
});
