import { useEffect, useMemo, useState } from 'react';
import { browserFontRegistry, createAlphabet } from './alphabet/alphabet';
import { FontStatus } from './alphabet/FontStatus';
import { useFontState } from './alphabet/useFontState';
import { PassagePage } from './reader/PassagePage';
import './app.css';

// Temporary until the progression and content segments land: a fixed passage
// and the first five letters of the default order as the learned set.
const DEMO_PARAGRAPHS = [
  'The bounty hunter walked out into the cold desert night. His armor was beskar, and he kept his helmet on.',
  'This is the way, he said, and the child looked up at him with wide, dark eyes.',
];
const DEMO_LEARNED_COUNT = 5;

export function App() {
  const alphabet = useMemo(() => createAlphabet({ registry: browserFontRegistry }), []);
  const fontState = useFontState(alphabet);
  const [, setPeeks] = useState(0);

  useEffect(() => {
    void alphabet.start();
  }, [alphabet]);

  const learnedSet = useMemo(
    () => new Set(fontState === 'loaded' ? alphabet.order().slice(0, DEMO_LEARNED_COUNT) : []),
    [alphabet, fontState],
  );

  return (
    <main className="reader">
      <FontStatus alphabet={alphabet} />
      <PassagePage paragraphs={DEMO_PARAGRAPHS} learnedSet={learnedSet} onPeek={() => setPeeks((n) => n + 1)} />
    </main>
  );
}
