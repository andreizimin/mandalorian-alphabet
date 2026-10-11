import { useEffect, useMemo, useReducer, useState } from 'react';
import { browserFontRegistry, createAlphabet } from './alphabet/alphabet';
import { FontStatus } from './alphabet/FontStatus';
import { useFontState } from './alphabet/useFontState';
import { Controls, HintBanner, IntroCard, Legend, WelcomeCard } from './progression/components';
import { initialProgress, nextLetter, progressReducer, showWelcome, visibleHint } from './progression/progression';
import { PassagePage } from './reader/PassagePage';
import './app.css';

// Temporary until the content and layout segments land: a fixed three-page
// passage that cycles, turned with a plain "Next page" button.
const DEMO_PAGES = [
  [
    'The bounty hunter walked out into the cold desert night. His armor was beskar, and he kept his helmet on.',
    'This is the way, he said, and the child looked up at him with wide, dark eyes.',
  ],
  [
    'They crossed the dunes before dawn. The ship waited where they had left it, half buried in sand.',
    'Inside, the child pressed every button it could reach, and the hunter pretended not to notice.',
  ],
  [
    'By noon the twin suns were high and the air shimmered over the rocks. Something moved in the canyon below.',
    'He drew his blaster, slowly, and told the child to stay in the ship. The child did not stay in the ship.',
  ],
];

export function App() {
  const alphabet = useMemo(() => createAlphabet({ registry: browserFontRegistry }), []);
  const fontState = useFontState(alphabet);
  const [progress, dispatch] = useReducer(progressReducer, initialProgress);
  const [page, setPage] = useState(0);
  const [introLetter, setIntroLetter] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    void alphabet.start();
  }, [alphabet]);

  const order = alphabet.order();
  const learnedSet = useMemo(
    () => new Set(fontState === 'loaded' ? progress.learned : []),
    [fontState, progress.learned],
  );
  const paragraphs = DEMO_PAGES[page];

  function advance() {
    const letter = nextLetter(progress, order);
    if (!letter) return;
    dispatch({ type: 'advance', order });
    setIntroLetter(letter);
  }

  function turnPage() {
    dispatch({ type: 'pageRead' });
    setPage((p) => (p + 1) % DEMO_PAGES.length);
  }

  return (
    <main className="reader">
      <FontStatus alphabet={alphabet} />
      <Controls
        canAdvance={nextLetter(progress, order) !== null}
        canStepBack={progress.learned.length > 0}
        onAdvance={advance}
        onStepBack={() => dispatch({ type: 'stepBack' })}
        onReset={() => dispatch({ type: 'reset' })}
      />
      <button type="button" className="legend-toggle" onClick={() => setLegendOpen((o) => !o)}>
        Legend ({progress.learned.length})
      </button>
      {legendOpen && <Legend learned={progress.learned} />}
      <HintBanner signals={visibleHint(progress)} onDismiss={() => dispatch({ type: 'dismissHint' })} />
      {showWelcome(progress) && <WelcomeCard onDismiss={() => dispatch({ type: 'dismissWelcome' })} />}
      {introLetter && (
        <IntroCard letter={introLetter} passageText={paragraphs.join(' ')} onClose={() => setIntroLetter(null)} />
      )}
      <PassagePage
        paragraphs={paragraphs}
        learnedSet={learnedSet}
        onPeek={(letter) => dispatch({ type: 'peek', letter })}
      />
      <button type="button" className="next-page" onClick={turnPage}>
        Next page →
      </button>
    </main>
  );
}
