import { useCallback, useEffect, useState } from 'react';

export const FEEDBACK_SCRIPT_URL = 'https://feedback.andreizimin.com/widget.js';
export const FEEDBACK_PROJECT = 'learn-mandalorian';
export const FEEDBACK_ACCENT = '#8a5a2b';
/** The element the widget renders into; events from inside its shadow DOM arrive targeted at it. */
export const FEEDBACK_HOST_ID = 'feedback-widget-host';

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

function addWidgetScript() {
  if (document.querySelector(`script[src="${FEEDBACK_SCRIPT_URL}"]`)) return;
  const script = document.createElement('script');
  script.src = FEEDBACK_SCRIPT_URL;
  script.async = true;
  script.dataset.project = FEEDBACK_PROJECT;
  script.dataset.launcher = 'none';
  script.dataset.accent = FEEDBACK_ACCENT;
  document.body.append(script);
}

/** Loads the shared feedback widget and reports whether it is ready and whether its form is open. */
// @spec FEED-001, FEED-002, FEED-003, FEED-004
export function useFeedbackWidget() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.FeedbackWidget);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onReady = () => setReady(true);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    window.addEventListener('feedback:ready', onReady);
    window.addEventListener('feedback:open', onOpen);
    window.addEventListener('feedback:close', onClose);
    addWidgetScript();
    if (window.FeedbackWidget) setReady(true);
    return () => {
      window.removeEventListener('feedback:ready', onReady);
      window.removeEventListener('feedback:open', onOpen);
      window.removeEventListener('feedback:close', onClose);
    };
  }, []);

  const open = useCallback(() => window.FeedbackWidget?.open(), []);

  return { ready, isOpen, open };
}
