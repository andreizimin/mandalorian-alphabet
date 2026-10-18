import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { browserFontRegistry, createAlphabet } from './alphabet/alphabet';
import { FontStatus } from './alphabet/FontStatus';
import { useFontState } from './alphabet/useFontState';
import { EndCard, Library } from './content/components';
import { useFeedbackWidget } from './feedback/useFeedbackWidget';
import { IntroTerminal } from './intro/IntroTerminal';
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
import { applyAppearance } from './layout/appearance';
import { BottomBar, MenuSheet, TitleBar, TopBar, type ReaderActions } from './layout/ReaderChrome';
import { appearanceOf, cycleAppearance, stepTextSize } from './layout/settings';
import { currentStage, isDevStage } from './stage';
import { DataPanel, StorageNotice } from './persistence/components';
import { buildExport, deliverExport } from './persistence/exportImport';
import { settingsSlice } from './persistence/settingsSlice';
import { localStore } from './persistence/storage';
import { usePersistedContent } from './persistence/usePersistedContent';
import { usePersistedProgress } from './persistence/usePersistedProgress';
import { usePersistedSlice } from './persistence/usePersistedSlice';
import { HintBanner, IntroCard, Legend } from './progression/components';
import { nextLetter, showIntro, visibleHint } from './progression/progression';
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
  const feedback = useFeedbackWidget();

  // @spec PROG-014
  const [view, setView] = useState<'intro' | 'reader' | 'library' | 'quiz'>(() =>
    showIntro(progress) ? 'intro' : 'reader',
  );
  const [introLetter, setIntroLetter] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void alphabet.start();
  }, [alphabet]);

  // @spec LAYOUT-017
  const appearance = appearanceOf(settings);
  useEffect(() => applyAppearance(document.documentElement, appearance), [appearance]);

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

  // @spec FEED-004
  const reading = view === 'reader' && !menuOpen && !introLetter && !ended && !feedback.isOpen;
  useArrowKeyPageTurns({ enabled: reading, onBack: back, onForward: forward });
  usePageGestures({ enabled: reading, onBack: back, onForward: forward });

  const actions: ReaderActions = {
    canAdvance: nextLetter(progress, order) !== null,
    canStepBack: progress.learned.length > 0,
    canTurnBack: pageIndex > 0,
    learnedCount: progress.learned.length,
    fontReady: fontState === 'loaded',
    textSize: settings.textSize,
    appearance,
    feedbackReady: feedback.ready,
    feedbackReason: feedback.reason,
    onAdvance: advance,
    onStepBack: () => dispatch({ type: 'stepBack' }),
    onReset: () => dispatch({ type: 'reset' }),
    onLegend: () => setLegendOpen((o) => !o),
    onLibrary: () => setView('library'),
    onQuiz: () => setView('quiz'),
    onTextSize: (direction) => settingsStore.update((s) => stepTextSize(s, direction)),
    onAppearance: () => settingsStore.update(cycleAppearance),
    onBack: back,
    onForward: forward,
    onFeedback: feedback.open,
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

      {view === 'intro' && (
        // @spec INTRO-004, INTRO-008
        <IntroTerminal
          fontState={fontState}
          onDone={() => {
            dispatch({ type: 'completeIntro' });
            setView('reader');
          }}
        />
      )}

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
          <div className="controls">
            <button type="button" onClick={() => setView('reader')}>
              ← Back to reading
            </button>
            {/* @spec INTRO-008 */}
            <button type="button" onClick={() => setView('intro')}>
              Replay intro
            </button>
          </div>
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
            <TitleBar
              title={passage.title}
              feedbackReady={feedback.ready}
              feedbackReason={feedback.reason}
              onFeedback={feedback.open}
              dev={isDevStage(currentStage())}
            />
            {legendOpen && <Legend learned={progress.learned} />}
            <HintBanner signals={visibleHint(progress)} onDismiss={() => dispatch({ type: 'dismissHint' })} />
          </header>

          <div className="page-area" ref={areaRef}>
            <div className="page-measurer" ref={measurerRef} aria-hidden="true" />
            {page && (
              <PassagePage
                paragraphs={pageBlocks(passage.paragraphs, page)}
                learnedSet={learnedSet}
                newestLetter={fontState === 'loaded' ? progress.learned[progress.learned.length - 1] : undefined}
                onPeek={(letter) => dispatch({ type: 'peek', letter })}
              />
            )}
          </div>

          <BottomBar {...actions} onMenu={() => setMenuOpen(true)} />
          {menuOpen && <MenuSheet {...actions} onClose={() => setMenuOpen(false)} />}
        </>
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
