import { useState } from 'react';
import { parsePaste } from './paste';
import type { Passage } from './types';

const PASTE_ERRORS = {
  'no-letters': 'There are no English letters to read in that text.',
  'too-long': "That text is longer than 100,000 characters, so it can't be saved.",
} as const;

// @spec TEXT-002, TEXT-006, TEXT-007, TEXT-008, TEXT-009
export function Library({
  bundled,
  pasted,
  onOpen,
  onDelete,
  onPaste,
}: {
  bundled: readonly Passage[];
  pasted: readonly Passage[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onPaste: (passage: { title: string; paragraphs: string[] }) => void;
}) {
  const [confirming, setConfirming] = useState<Passage | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function save() {
    const result = parsePaste(text);
    if (!result.ok) {
      setError(PASTE_ERRORS[result.reason]);
      return;
    }
    setError(null);
    setText('');
    onPaste({ title: result.title, paragraphs: result.paragraphs });
  }

  return (
    <section className="library" aria-label="Library">
      <ul className="passage-list" aria-label="Passages">
        {[...bundled, ...pasted].map((p) => (
          <li key={p.id}>
            <button type="button" className="passage-open" aria-label={`Open ${p.title}`} onClick={() => onOpen(p.id)}>
              {p.title}
            </button>
            {p.source === 'pasted' && (
              <button type="button" aria-label={`Delete ${p.title}`} onClick={() => setConfirming(p)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {confirming && (
        <div className="controls" role="group" aria-label="Confirm delete">
          <span>Delete “{confirming.title}”?</span>
          <button
            type="button"
            onClick={() => {
              onDelete(confirming.id);
              setConfirming(null);
            }}
          >
            Yes, delete
          </button>
          <button type="button" onClick={() => setConfirming(null)}>
            Cancel
          </button>
        </div>
      )}

      <div className="paste-form">
        <label htmlFor="paste-text">Paste text</label>
        <textarea id="paste-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        {error && (
          <p role="alert" className="data-error">
            {error}
          </p>
        )}
        <button type="button" className="primary" onClick={save}>
          Save and read
        </button>
      </div>
    </section>
  );
}

// @spec TEXT-012
export function EndCard({ title, onNext, onLibrary }: { title: string; onNext: () => void; onLibrary: () => void }) {
  return (
    <div role="dialog" aria-label="End of passage" className="card">
      <p>You finished {title}.</p>
      <div className="controls">
        <button type="button" className="primary" onClick={onNext}>
          Next passage
        </button>
        <button type="button" onClick={onLibrary}>
          Library
        </button>
      </div>
    </div>
  );
}
