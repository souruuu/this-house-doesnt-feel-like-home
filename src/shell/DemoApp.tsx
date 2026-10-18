import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import {
  createDemoSession,
  demoReferences,
  type DemoSession,
} from '../narrative/demoSession.ts';
import type { NarrativeView } from '../narrative/types.ts';
import { DemoControl } from '../ui/DemoControl';
import { WorldHost } from '../world/WorldHost.tsx';
import type { DemoWorldView } from '../world/GameBridge.ts';
import { fitViewport } from './viewport.ts';
import { demoGameplayLayout } from '../world/demoStage.ts';
import { resolveDemoCharacters } from '../world/demoCharacterCues';
import { DialoguePanel } from '../ui/demo/DialoguePanel';
import { useDemoPlayback } from '../ui/demo/useDemoPlayback';
import { useDayTransition } from '../ui/demo/useDayTransition';
import { useDialogueReveal } from '../ui/useDialogueReveal.ts';
import { MainMenu } from '../ui/demo/MainMenu';
import { OptionsScreen } from '../ui/demo/OptionsScreen';
import { InfoScreen } from '../ui/demo/InfoScreen';
import { PauseMenu } from '../ui/demo/PauseMenu';
import {
  createDemoPreferences,
  type DemoPanel,
} from '../ui/demo/demoPreferences';

const noSubscribe = () => () => {};
const noSnapshot = () => null;
const names: Record<string, string> = {
  girl: 'เด็กหญิง',
  boy: 'เด็กชาย',
  awning_boy: 'เด็กชายที่ชายคา',
  manao: 'มะนาว',
  som: 'ส้ม',
  nut: 'นัท',
  kan: 'กันต์',
  none: '',
  player: 'เจ้าของร้าน',
};
// characterLabel stays null: D-5 removed the on-stage speaker chip.
const initialWorld: DemoWorldView = {
  background: 'morning',
  characterLabel: null,
};

function worldView(
  view: NarrativeView | null,
  session: DemoSession | null,
): DemoWorldView {
  if (!view || !session || view.presentation.sceneId === 'DEMO_END')
    return initialWorld;
  const scene = view.presentation.sceneId;
  return {
    background:
      scene === 'SC-D3-02' || scene === 'SC-D3-03'
        ? 'night'
        : scene.endsWith('-03')
          ? 'evening'
          : 'morning',
    characterLabel: null,
    characterStage: {
      contextKey: `${view.sessionId}/${scene}`,
      characters: resolveDemoCharacters(view),
    },
  };
}

export function DemoApp() {
  const shellRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const previousPhase = useRef('');
  const liveInputGeneration = useRef(0);
  const [inputGeneration, setInputGeneration] = useState(0);
  const invalidateInput = useCallback(() => {
    liveInputGeneration.current++;
    setInputGeneration(liveInputGeneration.current);
  }, []);
  const [session, setSession] = useState<DemoSession | null>(null);
  const [bounds, setBounds] = useState(() =>
    fitViewport(window.innerWidth, window.innerHeight),
  );
  const [portraitTouch, setPortraitTouch] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(
    () => window.matchMedia('(pointer: coarse)').matches,
  );
  const [hidden, setHidden] = useState(document.hidden);
  const [userPaused, setUserPaused] = useState(false);
  const [preferences, setPreferences] = useState(createDemoPreferences);
  const [panel, setPanel] = useState<DemoPanel | null>(null);
  const panelReturnFocus = useRef<HTMLElement | null>(null);
  const [focused, setFocused] = useState(document.hasFocus());
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );
  const instant = preferences.instant;
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [fullscreenMessage, setFullscreenMessage] = useState('');
  const reducedMotion = systemReducedMotion || preferences.reduceMotion;
  // Responsive rule (Owner 2026-10-18): mouse windows scale the 1920x1080
  // design uniformly; only touch landscape below 0.6 uses the compact layout
  // (targets >= 44 css px); a stage below 0.28 or touch portrait shows a guard.
  const stageScale = bounds.scale || 1;
  const tooSmall = stageScale < 0.28;
  const portrait = portraitTouch || tooSmall;
  const touchCompact = coarsePointer && stageScale < 0.6;
  const uiScale = touchCompact ? stageScale : 1;
  const view = useSyncExternalStore(
    session?.controller.subscribe ?? noSubscribe,
    session?.controller.getSnapshot ?? noSnapshot,
  );
  const day = view?.presentation.sceneId.match(/^SC-D([123])-/)?.[1];
  const transitionDay = useDayTransition(view?.sessionId, day);
  const paused =
    userPaused ||
    portrait ||
    hidden ||
    !focused ||
    panel !== null ||
    Boolean(transitionDay);
  const presentation = useMemo<DemoWorldView>(
    () => ({
      ...worldView(view, session),
      layout:
        !session || view?.presentation.sceneId === 'NOTICE'
          ? 'menu'
          : 'gameplay',
      viewportScale: uiScale,
      reducedMotion,
    }),
    [view, session, uiScale, reducedMotion],
  );
  const lineKey = `${view?.sessionId ?? 'menu'}/${view?.presentation.sceneId ?? ''}/${view?.line?.id ?? ''}`;
  const reveal = useDialogueReveal({
    key: lineKey,
    text: view?.line?.text ?? '',
    instant,
    reducedMotion,
    paused,
    active: view?.phase === 'line',
    speed: preferences.textSpeed,
  });
  const {
    stop: stopAuto,
    enable: enableAuto,
    enabled: autoEnabled,
    execution: autoExecution,
  } = useDemoPlayback({
    controller: session?.controller,
    view,
    blocked: paused,
    revealing: reveal.revealing,
    delaySeconds: preferences.autoForwardSeconds,
    resetKey: `${bounds.width}x${bounds.height}`,
  });
  const scale = uiScale;
  const gameplay = demoGameplayLayout(scale);
  const overlayStyle: CSSProperties & {
    [key: `--${'demo' | 'vn'}-${string}`]: string;
  } = {
    '--demo-body-size': `${Math.max(36, 17 / scale)}px`,
    '--demo-control-font': `${Math.max(30, 16 / scale)}px`,
    '--demo-small-size': `${Math.max(28, 14 / scale)}px`,
    '--demo-control-size': `${Math.max(72, 44 / scale)}px`,
    '--demo-check-size': `${Math.max(28, 20 / scale)}px`,
    '--demo-dialogue-height': `${Math.max(300, 156 / scale)}px`,
    '--demo-choice-dialogue-height': `${Math.max(180, 90 / scale)}px`,
    '--vn-footnote-size': `${Math.max(22, 12 / scale)}px`,
    '--vn-dialogue-left': `${gameplay.dialogue.x}px`,
    '--vn-dialogue-top': `${gameplay.dialogue.y}px`,
    '--vn-dialogue-width': `${gameplay.dialogue.width}px`,
    '--vn-dialogue-height': `${gameplay.dialogue.height}px`,
    '--vn-body-size': `${gameplay.bodySize}px`,
    '--vn-speaker-size': `${gameplay.speakerSize}px`,
    '--vn-footer-height': `${gameplay.footerHeight}px`,
    '--vn-choice-left': `${gameplay.choice.x}px`,
    '--vn-choice-width': `${gameplay.choice.width}px`,
    '--vn-choice-top': `${gameplay.choice.top}px`,
    '--vn-choice-height': `${gameplay.choice.bottom - gameplay.choice.top}px`,
    '--vn-choice-dialogue-top': `${gameplay.choiceDialogue.y}px`,
    '--vn-choice-dialogue-height': `${gameplay.choiceDialogue.height}px`,
    '--vn-menu-font': `${Math.max(42, 22 / scale)}px`,
    '--vn-heading-font': `${Math.max(80, 28 / scale)}px`,
  };

  useEffect(() => {
    const orientation = window.matchMedia(
      '(orientation: portrait) and (any-pointer: coarse)',
    );
    const pointer = window.matchMedia('(pointer: coarse)');
    const measure = () => {
      invalidateInput();
      const rect = shellRef.current!.getBoundingClientRect();
      setBounds(fitViewport(rect.width, rect.height));
      setPortraitTouch(orientation.matches);
      setCoarsePointer(pointer.matches);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(shellRef.current!);
    orientation.addEventListener('change', measure);
    pointer.addEventListener('change', measure);
    measure();
    const visibility = () => {
      invalidateInput();
      setHidden(document.hidden);
    };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changeMotion = () => {
      invalidateInput();
      setSystemReducedMotion(motion.matches);
    };
    const blur = () => {
      invalidateInput();
      setFocused(false);
    };
    const focus = () => setFocused(true);
    const display = () => {
      invalidateInput();
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', changeMotion);
    window.addEventListener('blur', blur);
    window.addEventListener('focus', focus);
    document.addEventListener('fullscreenchange', display);
    return () => {
      observer.disconnect();
      orientation.removeEventListener('change', measure);
      pointer.removeEventListener('change', measure);
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', changeMotion);
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
      document.removeEventListener('fullscreenchange', display);
    };
  }, [stopAuto, invalidateInput]);
  useEffect(() => {
    const escape = (event: globalThis.KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.repeat &&
        session &&
        !portrait &&
        !panel
      ) {
        event.preventDefault();

        if (!userPaused && document.activeElement instanceof HTMLElement)
          returnFocus.current = document.activeElement;
        invalidateInput();
        setUserPaused(!userPaused);
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [session, portrait, userPaused, panel, stopAuto, invalidateInput]);
  useEffect(() => {
    session?.controller.setPaused(paused);
  }, [session, paused]);
  useEffect(
    () => () => {
      session?.controller.dispose();
    },
    [session],
  );
  useLayoutEffect(() => {
    if (portrait || panel) return;
    if (panelReturnFocus.current) {
      const target = panelReturnFocus.current;
      panelReturnFocus.current = null;
      if (target.isConnected && !target.closest('[inert]')) target.focus();
      else if (userPaused)
        pauseRef.current
          ?.querySelector<HTMLElement>('[data-open-options]')
          ?.focus();
      return;
    }
    if (userPaused)
      pauseRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    else if (returnFocus.current) {
      const target = returnFocus.current;
      returnFocus.current = null;
      if (target.isConnected && !target.closest('[inert]')) target.focus();
      else narrativeRef.current?.focus();
    }
  }, [userPaused, portrait, panel]);
  useLayoutEffect(() => {
    if (paused) return;
    if (
      view?.phase === 'choice' &&
      !choicesRef.current?.contains(document.activeElement)
    )
      choicesRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    else if (
      view?.phase === 'line' &&
      (previousPhase.current === 'choice' || previousPhase.current === '')
    )
      narrativeRef.current
        ?.querySelector<HTMLButtonElement>('.demo-continue')
        ?.focus();
    previousPhase.current = view?.phase ?? '';
  }, [view?.phase, view?.sessionId, paused]);

  function token() {
    const live = session?.controller.getSnapshot();
    return `${liveInputGeneration.current}/${live?.sessionId ?? 'menu'}/${live?.revision ?? 0}/${userPaused}/${portrait}/${hidden}/${focused}/${panel}/${transitionDay ?? ''}`;
  }
  const renderedToken = `${inputGeneration}/${view?.sessionId ?? 'menu'}/${view?.revision ?? 0}/${userPaused}/${portrait}/${hidden}/${focused}/${panel}/${transitionDay ?? ''}`;
  const inputProps = {
    token: renderedToken,
    getToken: token,
    isAllowed: () => !portrait && !hidden && focused && !transitionDay,
  };
  function openPanel(next: DemoPanel) {
    invalidateInput();
    // WebKit pointer clicks need not focus buttons. Restore the known opener,
    // rather than an unrelated previously focused control.
    const opener = session
      ? pauseRef.current?.querySelector<HTMLElement>('[data-open-options]')
      : shellRef.current?.querySelector<HTMLElement>(
          `[data-menu-entry="${next[0].toUpperCase()}${next.slice(1)}"]`,
        );
    panelReturnFocus.current =
      opener ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setPanel(next);
  }
  function closePanel() {
    invalidateInput();
    setPanel(null);
  }
  function start() {
    invalidateInput();
    stopAuto();
    const next = createDemoSession();
    next.controller.start();
    setSession(next);
    setUserPaused(false);
  }
  function home() {
    invalidateInput();
    stopAuto();
    session?.controller.dispose();
    setSession(null);
    setUserPaused(false);
    returnFocus.current = null;
  }
  function advance() {
    if (
      !session ||
      !view ||
      paused ||
      !document.hasFocus() ||
      view.phase !== 'line'
    )
      return;
    if (reveal.finish()) return;
    session.controller.continue(view);
  }
  function openPause() {
    invalidateInput();
    if (document.activeElement instanceof HTMLElement)
      returnFocus.current = document.activeElement;

    setUserPaused(true);
  }
  function closePause() {
    invalidateInput();
    setUserPaused(false);
  }
  async function fullscreen(mode?: 'windowed' | 'fullscreen') {
    invalidateInput();
    setFullscreenMessage('');
    try {
      if (mode === 'windowed') {
        if (document.fullscreenElement) await document.exitFullscreen();
        return;
      }
      if (mode === 'fullscreen' && document.fullscreenElement) return;
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shellRef.current?.requestFullscreen)
        await shellRef.current.requestFullscreen();
      else setFullscreenMessage('อุปกรณ์นี้ไม่รองรับการแสดงเต็มจอ');
    } catch {
      setFullscreenMessage('ไม่สามารถแสดงเต็มจอได้ ใช้งานในหน้าต่างต่อได้');
    }
  }
  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    const targets = pauseRef.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled)',
    );
    if (!targets?.length) return;
    const first = targets[0],
      last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <div
      className="game-shell demo-shell"
      ref={shellRef}
      data-paused={paused}
      data-menu-screen={!session}
      data-panel-open={panel !== null}
      data-pause-open={userPaused}
      data-compact={touchCompact}
      data-viewport-guard={
        portraitTouch ? 'rotate' : tooSmall ? 'small' : 'none'
      }
      data-reduced-motion={reducedMotion}
      data-stage-character={Boolean(
        presentation.characterStage?.characters.length,
      )}
    >
      <div
        className="viewport-frame"
        style={{ width: bounds.width, height: bounds.height }}
      >
        <div
          className="logical-stage"
          style={{ transform: `scale(${bounds.scale})` }}
        >
          <WorldHost demo paused={paused} presentation={presentation} />
          <div
            className="ui-overlay demo-overlay"
            style={overlayStyle}
            inert={portrait}
          >
            <div className="demo-main-surface" inert={paused}>
              {!session ? (
                <MainMenu
                  guard={inputProps}
                  onStart={start}
                  onOpen={openPanel}
                  activePanel={panel}
                />
              ) : (
                <section
                  ref={narrativeRef}
                  className="demo-narrative"
                  aria-label="บทสนทนา"
                  tabIndex={0}
                  inert={paused}
                  data-phase={view?.phase}
                  data-line-id={view?.line?.id ?? ''}
                  data-scene-id={view?.presentation.sceneId}
                  data-run-id={session.store.getState().runId}
                  data-view-revision={view?.revision}
                  data-revealing={reveal.revealing}
                  data-auto={autoEnabled}
                  data-auto-execution={autoExecution}
                  data-transition={transitionDay ?? ''}
                  onKeyDown={(event) => {
                    if (
                      event.target instanceof HTMLElement &&
                      (event.target.closest('button, input') ||
                        (event.key === ' ' &&
                          event.target.closest('.demo-text-scroll')))
                    )
                      return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      if (!event.repeat) advance();
                    }
                  }}
                >
                  {day ? (
                    <div className="demo-day" aria-live="polite">
                      <span>วันที่</span> {day}
                    </div>
                  ) : null}
                  <DialoguePanel
                    view={view!}
                    speaker={names[view?.presentation.speaker ?? 'none'] || ''}
                    text={reveal.text}
                    lineKey={lineKey}
                    revealing={reveal.revealing}
                    paused={paused}
                    guard={inputProps}
                    choicesRef={choicesRef}
                    autoEnabled={autoEnabled}
                    autoExecution={autoExecution}
                    onAuto={() => (autoEnabled ? stopAuto() : enableAuto())}
                    onContinue={advance}
                    onChoose={(index) => {
                      if (!paused && view)
                        session.controller.choose(view, index);
                    }}
                    onHome={home}
                    returnLabel={demoReferences.ui.returnToMenu}
                  />
                </section>
              )}
              <div className="demo-toolbar">
                {session ? (
                  <DemoControl {...inputProps} onActivate={openPause}>
                    พัก
                  </DemoControl>
                ) : null}
                <DemoControl
                  {...inputProps}
                  onActivate={() => void fullscreen()}
                >
                  เต็มจอ
                </DemoControl>
              </div>
            </div>
            {transitionDay ? (
              <div
                className="demo-day-transition"
                role="status"
                aria-live="polite"
                data-day-transition={transitionDay}
              >
                <div className="demo-day-card">วันที่ {transitionDay}</div>
              </div>
            ) : null}
            {userPaused && !panel ? (
              <PauseMenu
                pauseRef={pauseRef}
                guard={inputProps}
                reducedMotion={reducedMotion}
                onKeyDown={trapFocus}
                onResume={closePause}
                onOptions={() => openPanel('options')}
                onHome={home}
              />
            ) : null}
            {panel === 'options' ? (
              <OptionsScreen
                preferences={preferences}
                onChange={setPreferences}
                guard={inputProps}
                onClose={closePanel}
                fromPause={Boolean(session)}
                fullscreen={isFullscreen}
                onDisplay={(mode) => void fullscreen(mode)}
                displayMessage={fullscreenMessage}
                systemReduced={systemReducedMotion}
              />
            ) : panel ? (
              <InfoScreen
                page={panel}
                guard={inputProps}
                onClose={closePanel}
              />
            ) : null}
            {fullscreenMessage && panel !== 'options' ? (
              <p role="status" className="demo-message">
                {fullscreenMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {portrait ? (
        <div className="rotate-prompt" role="alert">
          <div className="rotate-prompt-card">
            <p className="rotate-prompt-title">
              {portraitTouch
                ? 'กรุณาหมุนอุปกรณ์เป็นแนวนอนเพื่อเล่น'
                : 'ขยายหน้าต่างให้ใหญ่ขึ้นเพื่อเล่นต่อ'}
            </p>
            <p>พักการแสดงผลไว้แล้ว เกมจะเล่นต่อเองเมื่อหน้าจอพอดี</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
