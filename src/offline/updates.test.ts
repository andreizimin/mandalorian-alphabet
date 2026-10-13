import { OPENING_WINDOW_MS, startUpdates, type UpdateEnvironment } from './updates';

/** A fake browser: event targets for the container, document and window, a clock and a session store. */
function fakeBrowser({ controlled = true, session = new Map<string, string>() } = {}) {
  let time = 0;
  let visibility: DocumentVisibilityState = 'visible';
  const update = vi.fn(() => Promise.resolve());
  const container = Object.assign(new EventTarget(), {
    controller: controlled ? ({} as ServiceWorker) : null,
    register: vi.fn(async () => ({ update })),
  });
  // defineProperty, not Object.assign: a getter must stay live to report the current visibility.
  const document = Object.defineProperty(new EventTarget(), 'visibilityState', { get: () => visibility }) as EventTarget & {
    visibilityState: DocumentVisibilityState;
  };
  const window = new EventTarget();
  const reload = vi.fn();
  const env: UpdateEnvironment = {
    container,
    document,
    window,
    now: () => time,
    reload,
    session: { getItem: (k) => session.get(k) ?? null, setItem: (k, v) => void session.set(k, v) },
  };
  return {
    env,
    update,
    reload,
    session,
    container,
    at: (ms: number) => (time = ms),
    takeControl: () => container.dispatchEvent(new Event('controllerchange')),
    background: () => {
      visibility = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    },
    foreground: () => {
      visibility = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
    },
    interact: (type: string) => window.dispatchEvent(new Event(type)),
  };
}

describe('updates', () => {
  // @spec OFF-004
  it('registers the service worker for the whole app', async () => {
    const b = fakeBrowser();
    await startUpdates(b.env);
    expect(b.container.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  // @spec OFF-004
  it('checks for a new version on opening and whenever the app returns to the foreground', async () => {
    const b = fakeBrowser();
    await startUpdates(b.env);
    expect(b.update).toHaveBeenCalledTimes(1);
    b.background();
    expect(b.update).toHaveBeenCalledTimes(1);
    b.foreground();
    expect(b.update).toHaveBeenCalledTimes(2);
    b.background();
    b.foreground();
    expect(b.update).toHaveBeenCalledTimes(3);
  });

  // @spec OFF-004
  it('ignores a failed check, as when there is no connection', async () => {
    const b = fakeBrowser();
    b.update.mockImplementation(() => Promise.reject(new Error('offline')));
    await startUpdates(b.env);
    expect(() => b.foreground()).not.toThrow();
    await Promise.resolve();
  });

  // @spec OFF-009
  it('reloads once when a new version takes control in the opening window, before any interaction', async () => {
    const b = fakeBrowser();
    await startUpdates(b.env);
    b.at(OPENING_WINDOW_MS - 1);
    b.takeControl();
    expect(b.reload).toHaveBeenCalledTimes(1);
  });

  // @spec OFF-010
  it('leaves the page alone when the new version arrives after the opening window', async () => {
    const b = fakeBrowser();
    await startUpdates(b.env);
    b.at(OPENING_WINDOW_MS + 1);
    b.takeControl();
    expect(b.reload).not.toHaveBeenCalled();
  });

  // @spec OFF-010
  it.each(['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'])(
    'leaves the page alone once the learner has interacted (%s)',
    async (type) => {
      const b = fakeBrowser();
      await startUpdates(b.env);
      b.at(1_000);
      b.interact(type);
      b.at(2_000);
      b.takeControl();
      expect(b.reload).not.toHaveBeenCalled();
    },
  );

  // @spec OFF-010
  it('never reloads for the first install', async () => {
    const b = fakeBrowser({ controlled: false });
    await startUpdates(b.env);
    b.at(1_000);
    b.takeControl();
    expect(b.reload).not.toHaveBeenCalled();
  });

  // @spec OFF-009
  it('opens a new window, with no interaction yet, on each return to the foreground', async () => {
    const b = fakeBrowser();
    await startUpdates(b.env);
    b.at(1_000);
    b.interact('pointerdown');
    b.at(60_000);
    b.background();
    b.foreground();
    b.at(60_000 + OPENING_WINDOW_MS - 1);
    b.takeControl();
    expect(b.reload).toHaveBeenCalledTimes(1);
  });

  // @spec OFF-009
  it('reloads at most once per opening, even across the reload itself', async () => {
    const session = new Map<string, string>();
    const first = fakeBrowser({ session });
    await startUpdates(first.env);
    first.at(2_000);
    first.takeControl();
    first.takeControl();
    expect(first.reload).toHaveBeenCalledTimes(1);

    // The reloaded page starts its own window, but a second deploy landing in it does not reload again.
    const second = fakeBrowser({ session });
    second.at(3_000);
    await startUpdates(second.env);
    second.at(5_000);
    second.takeControl();
    expect(second.reload).not.toHaveBeenCalled();
  });
});
