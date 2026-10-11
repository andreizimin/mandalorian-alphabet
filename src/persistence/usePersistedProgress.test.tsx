import { act, renderHook } from '@testing-library/react';
import { FREQUENCY_ORDER } from '../alphabet/alphabet';
import { initialProgress, showWelcome } from '../progression/progression';
import { PROGRESS_KEY } from './progressSlice';
import { brokenStore, memoryStore } from './testStores';
import { usePersistedProgress } from './usePersistedProgress';

const advance = { type: 'advance', order: FREQUENCY_ORDER } as const;

describe('usePersistedProgress', () => {
  // @spec PERS-001, PROG-014
  it('restores progress, including the welcome card being seen, after a reload', () => {
    const store = memoryStore();
    const first = renderHook(() => usePersistedProgress(store));
    act(() => {
      first.result.current.dispatch({ type: 'dismissWelcome' });
      first.result.current.dispatch(advance);
      first.result.current.dispatch({ type: 'peek', letter: 'e' });
    });
    first.unmount();

    const reloaded = renderHook(() => usePersistedProgress(store));

    expect(reloaded.result.current.progress.learned).toEqual(['e']);
    expect(reloaded.result.current.progress.peeksByLetter).toEqual({ e: 1 });
    expect(showWelcome(reloaded.result.current.progress)).toBe(false);
  });

  // @spec PERS-005
  it('writes to storage immediately after each change', () => {
    const store = memoryStore();
    const { result } = renderHook(() => usePersistedProgress(store));

    act(() => result.current.dispatch(advance));
    expect(JSON.parse(store.getItem(PROGRESS_KEY)!).learned).toEqual(['e']);

    act(() => result.current.dispatch(advance));
    expect(JSON.parse(store.getItem(PROGRESS_KEY)!).learned).toEqual(['e', 't']);
  });

  // @spec PERS-004
  it('runs on in-memory state and raises the unavailable notice when storage does not work', () => {
    const { result } = renderHook(() => usePersistedProgress(brokenStore()));

    expect(result.current.notice).toBe('unavailable');
    act(() => result.current.dispatch(advance));
    expect(result.current.progress.learned).toEqual(['e']);
  });

  // @spec PERS-006
  it('starts fresh with a dismissible notice and a backup when saved progress is unreadable', () => {
    const store = memoryStore({ [PROGRESS_KEY]: '{"learned":["e","e"]}' });
    const { result } = renderHook(() => usePersistedProgress(store));

    expect(result.current.progress).toEqual(initialProgress);
    expect(result.current.notice).toBe('unreadable');
    expect(store.getItem(`${PROGRESS_KEY}:unreadable`)).toBe('{"learned":["e","e"]}');

    act(() => result.current.dismissNotice());
    expect(result.current.notice).toBeNull();
  });

  // @spec PERS-003
  it('replaces and saves the whole progress on import', () => {
    const store = memoryStore();
    const { result } = renderHook(() => usePersistedProgress(store));
    const imported = { ...initialProgress, learned: ['e', 't', 'a'], welcomeSeen: true };

    act(() => result.current.replace(imported));

    expect(result.current.progress).toEqual(imported);
    expect(JSON.parse(store.getItem(PROGRESS_KEY)!)).toEqual(imported);
  });
});
