/**
 * Registers the service worker and decides what a new version does to the page
 * on screen (offline LLD, "Updates"). Workbox lets a new version take control
 * as soon as it is downloaded; this module checks for one on every return to
 * the foreground and reloads into it only in the opening window.
 */

/** How long after opening, or returning to the foreground, a new version may still reload the page. */
export const OPENING_WINDOW_MS = 10_000;

/** Any of these since the opening means the learner has started, and the page is left alone. */
const INTERACTIONS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;

/** When the last automatic reload happened, so the reloaded page does not reload again. */
const RELOADED_AT_KEY = 'mando:update-reloaded-at';

export interface UpdateEnvironment {
  container: Pick<ServiceWorkerContainer, 'controller' | 'addEventListener'> & {
    register(url: string, options: RegistrationOptions): Promise<{ update(): Promise<unknown> }>;
  };
  document: Pick<Document, 'visibilityState' | 'addEventListener'>;
  window: Pick<Window, 'addEventListener'>;
  now(): number;
  reload(): void;
  session: Pick<Storage, 'getItem' | 'setItem'> | null;
}

function readReloadedAt(session: UpdateEnvironment['session']): number | null {
  try {
    const value = Number(session?.getItem(RELOADED_AT_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

// @spec OFF-004, OFF-009, OFF-010
export async function startUpdates(env: UpdateEnvironment): Promise<void> {
  // The first install also takes control; only a change from an earlier version counts as an update.
  let hadVersion = env.container.controller !== null;
  let openedAt = env.now();
  let interacted = false;
  const reloadedAt = readReloadedAt(env.session);
  let reloaded = reloadedAt !== null && openedAt - reloadedAt < OPENING_WINDOW_MS;

  for (const type of INTERACTIONS) {
    env.window.addEventListener(type, () => (interacted = true), { capture: true, passive: true });
  }

  env.container.addEventListener('controllerchange', () => {
    const inWindow = env.now() - openedAt <= OPENING_WINDOW_MS;
    if (hadVersion && inWindow && !interacted && !reloaded) {
      reloaded = true;
      try {
        env.session?.setItem(RELOADED_AT_KEY, String(env.now()));
      } catch {
        // Without session storage the once-per-opening guard still holds for this page.
      }
      env.reload();
    }
    hadVersion = true;
  });

  const registration = await env.container.register('/sw.js', { scope: '/' });
  // The browser's own check on page load is throttled, so the app asks on every opening.
  const check = () =>
    registration.update().catch(() => {
      // No connection or a server hiccup: keep the current version.
    });
  check();

  env.document.addEventListener('visibilitychange', () => {
    if (env.document.visibilityState !== 'visible') return;
    openedAt = env.now();
    interacted = false;
    reloaded = false;
    check();
  });
}

/** Starts update handling in a production build; the dev server has no service worker. */
export function startServiceWorkerUpdates(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  let session: Storage | null = null;
  try {
    session = window.sessionStorage;
  } catch {
    session = null;
  }
  void startUpdates({
    container: navigator.serviceWorker,
    document,
    window,
    now: () => Date.now(),
    reload: () => window.location.reload(),
    session,
  }).catch(() => {
    // Registration failed (private mode, unsupported): the app still runs online.
  });
}
