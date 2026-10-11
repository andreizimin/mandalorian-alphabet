import { useState, type ChangeEvent } from 'react';
import { parseImport, type LearnerData } from './exportImport';
import type { StorageNoticeKind } from './usePersistedSlice';

// @spec PERS-002, PERS-003, PERS-007
export function DataPanel({ onExport, onImport }: { onExport: () => void; onImport: (data: LearnerData) => void }) {
  const [pending, setPending] = useState<LearnerData | null>(null);
  const [error, setError] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const result = parseImport(await file.text());
    setError(!result.ok);
    setPending(result.ok ? result.data : null);
  }

  return (
    <section className="data-panel" aria-label="Your data">
      <div className="data-actions">
        <button type="button" onClick={onExport}>
          Export progress
        </button>
        <label className="file-button">
          Import progress
          <input type="file" accept=".json,application/json" onChange={handleFile} />
        </label>
      </div>
      {error && (
        <p role="alert" className="data-error">
          That file is not a Script Ramp export, so nothing was changed.
        </p>
      )}
      {pending && (
        <div className="controls" role="group" aria-label="Confirm import">
          <span>Replace your progress with this file?</span>
          <button
            type="button"
            onClick={() => {
              onImport(pending);
              setPending(null);
            }}
          >
            Yes, replace
          </button>
          <button type="button" onClick={() => setPending(null)}>
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}

const NOTICE_TEXT: Record<StorageNoticeKind, string> = {
  unavailable: "This browser won't let the app store data, so your progress won't be saved.",
  unreadable: "Your saved progress couldn't be read, so you're starting fresh. A copy was kept on this device.",
};

// @spec PERS-004, PERS-006
export function StorageNotice({ notice, onDismiss }: { notice: StorageNoticeKind | null; onDismiss: () => void }) {
  if (!notice) return null;
  return (
    <div role="status" className="hint">
      <span>{NOTICE_TEXT[notice]}</span>
      {notice === 'unreadable' && (
        <button type="button" aria-label="Dismiss notice" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
