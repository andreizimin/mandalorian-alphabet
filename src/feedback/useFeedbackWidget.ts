import { useCallback, useEffect, useState } from 'react';

/**
 * The minimum widget version this app needs, in the URL. The platform caches widget.js for a
 * year under one shared address, so an unversioned URL could serve a stale widget cached by
 * another app; a versioned URL is a different cache entry.
 */
export const FEEDBACK_SCRIPT_URL = 'https://feedback.andreizimin.com/widget.js?v=1.1.1';
export const FEEDBACK_PROJECT = 'learn-mandalorian';
export const FEEDBACK_ACCENT = '#8a5a2b';
/** The element the widget renders into; events from inside its shadow DOM arrive targeted at it. */
export const FEEDBACK_HOST_ID = 'feedback-widget-host';

export const REASON_OFFLINE = 'Feedback needs a connection';
export const REASON_OUTDATED = 'Feedback is unavailable right now';

interface FeedbackWidgetApi {
  open(): void;
  close(): void;
  isOpen(): boolean;
  version: string;
  project: string;
}

declare global {
  interface Window {
    FeedbackWidget?: FeedbackWidgetApi;
  }
}

function addWidgetScript(): HTMLScriptElement {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${FEEDBACK_SCRIPT_URL}"]`);
  if (existing) return existing;
  const script = document.createElement('script');
  script.src = FEEDBACK_SCRIPT_URL;
  script.async = true;
  script.dataset.project = FEEDBACK_PROJECT;
  script.dataset.launcher = 'none';
  script.dataset.accent = FEEDBACK_ACCENT;
  document.body.append(script);
  return script;
}

/** Loads the shared feedback widget and reports whether it is ready and whether its form is open. */
// @spec FEED-001, FEED-002, FEED-003, FEED-004, FEED-005
export function useFeedbackWidget() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.FeedbackWidget);
  const [isOpen, setIsOpen] = useState(false);
  const [outdated, setOutdated] = useState(false);

  useEffect(() => {
    const onReady = () => setReady(true);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    window.addEventListener('feedback:ready', onReady);
    window.addEventListener('feedback:open', onOpen);
    window.addEventListener('feedback:close', onClose);
    // Once the script has run, the API tells current widgets from old ones. An old widget (before
    // 1.1.0) has no host API and draws its own floating button, so it is hidden.
    const onLoad = () => {
      if (window.FeedbackWidget) {
        setReady(true);
        return;
      }
      document.getElementById(FEEDBACK_HOST_ID)?.style.setProperty('display', 'none');
      setOutdated(true);
    };
    const script = addWidgetScript();
    script.addEventListener('load', onLoad);
    if (window.FeedbackWidget) setReady(true);
    return () => {
      script.removeEventListener('load', onLoad);
      window.removeEventListener('feedback:ready', onReady);
      window.removeEventListener('feedback:open', onOpen);
      window.removeEventListener('feedback:close', onClose);
    };
  }, []);

  const open = useCallback(() => window.FeedbackWidget?.open(), []);

  return { ready, isOpen, open, reason: outdated ? REASON_OUTDATED : REASON_OFFLINE };
}
