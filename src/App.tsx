import { useEffect, useMemo, useRef, useState } from 'react';
import { browserFontRegistry, createAlphabet } from './alphabet/alphabet';
import { FontStatus } from './alphabet/FontStatus';
import { useFontState } from './alphabet/useFontState';
import { EndCard, Library } from './content/components';
import { pageBlocks, pageIndexFor } from './content/paginate';
import { BUNDLED_PASSAGES } from './content/passages';
import {
  addPasted,
  deletePasted,
  nextBundledId,
  openPassage,
  positionOf,
  resolveCurrentId,
  turnBack,
  turnForward,
} from './content/reading';
import { usePagination } from './content/usePagination';
import { PageTurnBar, useArrowKeyPageTurns } from './layout/pageTurning';
import { DataPanel, StorageNotice } from './persistence/components';
import { buildExport, deliverExport } from './persistence/exportImport';
import { localStore } from './persistence/storage';
import { usePersistedContent } from './persistence/usePersistedContent';
import { usePersistedProgress } from './persistence/usePersistedProgress';
import { Controls, HintBanner, IntroCard, Legend, WelcomeCard } from './progression/components';
import { nextLetter, showWelcome, visibleHint } from './progression/progression';
import { QuizButton, QuizScreen } from './quiz/QuizScreen';
import { EVERYDAY_WORDS, GALAXY_WORDS } from './quiz/wordPool';
import { PassagePage } from './reader/PassagePage';
import './app.css';

const FIRST_BUNDLED_ID = BUNDLED_PASSAGES[0].id;

export function App() {
  const alphabet = useMemo(() => createAlphabet({ registry: browserFontRegistry }), []);
  const fontState = useFontState(alphabet);
  const progressStore = usePersistedProgress(localStore);
  const contentStore = usePersistedContent(localStore);
  const { progress, dispatch } = progressStore;
  const { content, update } = contentStore;

  const [view, setView] = useState<'reader' | 'library' | 'quiz'>('reader');
  const [introLetter, setIntroLetter] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void alphabet.start();
  }, [alphabet]);

  const order = alphabet.order();
  const currentId = resolveCurrentId(content, BUNDLED_PASSAGES);
  const passage = [...BUNDLED_PASSAGES, ...content.pasted].find((p) => p.id === currentId)!;
  const learnedSet = useMemo(
    () => new Set(fontState === 'loaded' ? progress.learned : []),
    [fontState, progress.learned],
  );
  const pages = usePagination(passage.paragraphs, learnedSet, areaRef, measurerRef, `${fontState}:${progress.learned.join('')}`);
  const pageIndex = pageIndexFor(pages, positionOf(content, currentId));
  const page = pages[pageIndex];

  function advance() {
    const letter = nextLetter(progress, order);
    if (!letter) return;
    dispatch({ type: 'advance', order });
    setIntroLetter(letter);
  }

  function forward() {
    if (pages.length === 0) return;
    const result = turnForward(content, currentId, pages);
    update(() => result.state);
    if (result.pageRead) dispatch({ type: 'pageRead' });
    if (result.ended) setEnded(true);
  }

  function back() {
    setEnded(false);
    update((c) => turnBack(c, currentId, pages));
  }

  function open(id: string) {
    update((c) => openPassage(c, id));
    setEnded(false);
    setView('reader');
  }

  useArrowKeyPageTurns({ enabled: view === 'reader', onBack: back, onForward: forward });

  const notice = progressStore.notice ?? contentStore.notice;
  const dismissNotice = () => {
    progressStore.dismissNotice();
    contentStore.dismissNotice();
  };

  return (
    <main className="reader">
      <FontStatus alphabet={alphabet} />
      <StorageNotice notice={notice} onDismiss={dismissNotice} />

      {view === 'quiz' ? (
        <QuizScreen
          learned={progress.learned}
          quizByLetter={progress.quizByLetter}
          order={order}
          everyday={EVERYDAY_WORDS}
          galaxy={GALAXY_WORDS}
          onRecord={(answers) => dispatch({ type: 'quizAnswers', answers })}
          onExit={() => setView('reader')}
        />
      ) : view === 'library' ? (
        <>
          <button type="button" onClick={() => setView('reader')}>
            ← Back to reading
          </button>
          <Library
            bundled={BUNDLED_PASSAGES}
            pasted={content.pasted}
            onOpen={open}
            onDelete={(id) => update((c) => deletePasted(c, id, FIRST_BUNDLED_ID))}
            onPaste={(p) => {
              update((c) => addPasted(c, { id: `pasted-${Date.now()}`, source: 'pasted', ...p }));
              setEnded(false);
              setView('reader');
            }}
          />
          <DataPanel
            onExport={() => void deliverExport(buildExport({ progress, content }, new Date()))}
            onImport={(data) => {
              progressStore.replace(data.progress);
              if (data.content) contentStore.replace(data.content);
            }}
          />
        </>
      ) : (
        <>
          <header className="reader-header">
            <Controls
              canAdvance={nextLetter(progress, order) !== null}
              canStepBack={progress.learned.length > 0}
              onAdvance={advance}
              onStepBack={() => dispatch({ type: 'stepBack' })}
              onReset={() => dispatch({ type: 'reset' })}
            />
            <div className="controls">
              <button type="button" onClick={() => setLegendOpen((o) => !o)}>
                Legend ({progress.learned.length})
              </button>
              <button type="button" onClick={() => setView('library')}>
                Library
              </button>
              <QuizButton
                learnedCount={progress.learned.length}
                fontReady={fontState === 'loaded'}
                onOpen={() => setView('quiz')}
              />
              <span className="passage-title">{passage.title}</span>
            </div>
            {legendOpen && <Legend learned={progress.learned} />}
            <HintBanner signals={visibleHint(progress)} onDismiss={() => dispatch({ type: 'dismissHint' })} />
          </header>

          <div className="page-area" ref={areaRef}>
            <div className="page-measurer" ref={measurerRef} aria-hidden="true" />
            {page && (
              <PassagePage
                paragraphs={pageBlocks(passage.paragraphs, page)}
                learnedSet={learnedSet}
                onPeek={(letter) => dispatch({ type: 'peek', letter })}
              />
            )}
          </div>

          <PageTurnBar canBack={pageIndex > 0} onBack={back} onForward={forward} />
        </>
      )}

      {view === 'reader' && showWelcome(progress) && (
        <div className="overlay">
          <WelcomeCard onDismiss={() => dispatch({ type: 'dismissWelcome' })} />
        </div>
      )}
      {view === 'reader' && introLetter && (
        <div className="overlay">
          <IntroCard
            letter={introLetter}
            passageText={passage.paragraphs.join(' ')}
            onClose={() => setIntroLetter(null)}
          />
        </div>
      )}
      {view === 'reader' && ended && (
        <div className="overlay">
          <EndCard
            title={passage.title}
            onNext={() => open(nextBundledId(BUNDLED_PASSAGES, currentId))}
            onLibrary={() => {
              setEnded(false);
              setView('library');
            }}
          />
        </div>
      )}
    </main>
  );
}
