import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
import { usePageGestures } from './layout/gestures';
import { useArrowKeyPageTurns } from './layout/pageTurning';
import { BottomBar, MenuSheet, TopBar, type ReaderActions } from './layout/ReaderChrome';
import { stepTextSize } from './layout/settings';
import { DataPanel, StorageNotice } from './persistence/components';
import { buildExport, deliverExport } from './persistence/exportImport';
import { settingsSlice } from './persistence/settingsSlice';
import { localStore } from './persistence/storage';
import { usePersistedContent } from './persistence/usePersistedContent';
import { usePersistedProgress } from './persistence/usePersistedProgress';
import { usePersistedSlice } from './persistence/usePersistedSlice';
import { HintBanner, IntroCard, Legend, WelcomeCard } from './progression/components';
import { nextLetter, showWelcome, visibleHint } from './progression/progression';
import { QuizScreen } from './quiz/QuizScreen';
import { EVERYDAY_WORDS, GALAXY_WORDS } from './quiz/wordPool';
import { PassagePage } from './reader/PassagePage';
import './app.css';

const FIRST_BUNDLED_ID = BUNDLED_PASSAGES[0].id;

export function App() {
  const alphabet = useMemo(() => createAlphabet({ registry: browserFontRegistry }), []);
  const fontState = useFontState(alphabet);
  const progressStore = usePersistedProgress(localStore);
  const contentStore = usePersistedContent(localStore);
  const settingsStore = usePersistedSlice(localStore, settingsSlice);
  const { progress, dispatch } = progressStore;
  const { content, update } = contentStore;
  const settings = settingsStore.value;

  const [view, setView] = useState<'reader' | 'library' | 'quiz'>('reader');
  const [introLetter, setIntroLetter] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
  const pages = usePagination(
    passage.paragraphs,
    learnedSet,
    areaRef,
    measurerRef,
    `${fontState}:${progress.learned.join('')}:${settings.textSize}`,
  );
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

  const reading = view === 'reader' && !menuOpen && !introLetter && !ended && !showWelcome(progress);
  useArrowKeyPageTurns({ enabled: reading, onBack: back, onForward: forward });
  usePageGestures({ enabled: reading, onBack: back, onForward: forward });

  const actions: ReaderActions = {
    canAdvance: nextLetter(progress, order) !== null,
    canStepBack: progress.learned.length > 0,
    canTurnBack: pageIndex > 0,
    learnedCount: progress.learned.length,
    fontReady: fontState === 'loaded',
    textSize: settings.textSize,
    onAdvance: advance,
    onStepBack: () => dispatch({ type: 'stepBack' }),
    onReset: () => dispatch({ type: 'reset' }),
    onLegend: () => setLegendOpen((o) => !o),
    onLibrary: () => setView('library'),
    onQuiz: () => setView('quiz'),
    onTextSize: (direction) => settingsStore.update((s) => stepTextSize(s, direction)),
    onBack: back,
    onForward: forward,
  };

  const notice = progressStore.notice ?? contentStore.notice ?? settingsStore.notice;
  const dismissNotice = () => {
    progressStore.dismissNotice();
    contentStore.dismissNotice();
    settingsStore.dismissNotice();
  };

  return (
    <main className="reader" style={{ '--text-size': `${settings.textSize}px` } as CSSProperties}>
      <FontStatus alphabet={alphabet} />
      <StorageNotice notice={notice} onDismiss={dismissNotice} />

      {view === 'quiz' && (
        <QuizScreen
          learned={progress.learned}
          quizByLetter={progress.quizByLetter}
          order={order}
          everyday={EVERYDAY_WORDS}
          galaxy={GALAXY_WORDS}
          onRecord={(answers) => dispatch({ type: 'quizAnswers', answers })}
          onExit={() => setView('reader')}
        />
      )}

      {view === 'library' && (
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
            onExport={() => void deliverExport(buildExport({ progress, content, settings }, new Date()))}
            onImport={(data) => {
              progressStore.replace(data.progress);
              if (data.content) contentStore.replace(data.content);
              if (data.settings) settingsStore.set(data.settings);
            }}
          />
        </>
      )}

      {view === 'reader' && (
        <>
          <header className="reader-header">
            <TopBar {...actions} />
            <p className="passage-title">{passage.title}</p>
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

          <BottomBar {...actions} onMenu={() => setMenuOpen(true)} />
          {menuOpen && <MenuSheet {...actions} onClose={() => setMenuOpen(false)} />}
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
