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
import {
  demoPortrait,
  demoMenuPortrait,
  demoGameplayLayout,
  demoCharacterLayout,
} from '../world/demoStage.ts';
import { resolveDemoCharacters } from '../world/demoCharacterCues';
import { DialoguePanel } from '../ui/demo/DialoguePanel';
import { useDemoPlayback } from '../ui/demo/useDemoPlayback';
import { useDayTransition } from '../ui/demo/useDayTransition';
import { useDialogueReveal } from '../ui/useDialogueReveal.ts';
import { MainMenu } from '../ui/demo/MainMenu';
import { OptionsScreen } from '../ui/demo/OptionsScreen';
import { InfoScreen } from '../ui/demo/InfoScreen';
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
    characterLabel:
      view.phase === 'line' && view.presentation.speaker !== 'player'
        ? names[view.presentation.speaker] || null
        : null,
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
  const [portrait, setPortrait] = useState(false);
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
      viewportScale: bounds.scale || 1,
      reducedMotion,
    }),
    [view, session, bounds.scale, reducedMotion],
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
  });
  const scale = bounds.scale || 1;
  const gameplay = demoGameplayLayout(scale);
  const characterLayout = demoCharacterLayout(scale);
  const overlayStyle: CSSProperties & {
    [key: `--${'demo' | 'vn'}-${string}`]: string;
  } = {
    '--demo-art-left': `${demoPortrait.x}px`,
    '--demo-art-width': `${demoPortrait.width}px`,
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
    '--vn-choice-top': `${gameplay.choiceTop}px`,
    '--vn-choice-height': `${gameplay.choiceBottom - gameplay.choiceTop}px`,
    '--vn-menu-font': `${Math.max(42, 22 / scale)}px`,
    '--vn-menu-art-left': `${demoMenuPortrait.x}px`,
    '--vn-menu-art-width': `${demoMenuPortrait.width}px`,
    '--vn-heading-font': `${Math.max(80, 28 / scale)}px`,
    '--vn-stage-choice-left': `${characterLayout.choiceLeft}px`,
    '--vn-stage-choice-width': `${characterLayout.choiceWidth}px`,
  };

  useEffect(() => {
    const orientation = window.matchMedia(
      '(orientation: portrait) and (any-pointer: coarse)',
    );
    const measure = () => {
      invalidateInput();
      stopAuto();
      const rect = shellRef.current!.getBoundingClientRect();
      setBounds(fitViewport(rect.width, rect.height));
      setPortrait(orientation.matches);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(shellRef.current!);
    orientation.addEventListener('change', measure);
    measure();
    const visibility = () => {
      invalidateInput();
      if (document.hidden) stopAuto();
      setHidden(document.hidden);
    };
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changeMotion = () => {
      invalidateInput();
      stopAuto();
      setSystemReducedMotion(motion.matches);
    };
    const blur = () => {
      invalidateInput();
      stopAuto();
      setFocused(false);
    };
    const focus = () => setFocused(true);
    const display = () => {
      invalidateInput();
      stopAuto();
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
        stopAuto();
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
    stopAuto();
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
    stopAuto();
    if (reveal.finish()) return;
    session.controller.continue(view);
  }
  function openPause() {
    invalidateInput();
    stopAuto();
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
    stopAuto();
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
      data-compact={scale < 0.6}
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
              <div className="demo-pause-backdrop">
                <div
                  className="demo-pause"
                  ref={pauseRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="พักเกม"
                  onKeyDown={trapFocus}
                >
                  <h2>พักเกม</h2>
                  <DemoControl {...inputProps} onActivate={closePause}>
                    เล่นต่อ
                  </DemoControl>
                  <DemoControl
                    data-open-options
                    {...inputProps}
                    onActivate={() => openPanel('options')}
                  >
                    Options
                  </DemoControl>
                  <label className="demo-instant">
                    <input
                      type="checkbox"
                      checked={instant}
                      onChange={(event) =>
                        setPreferences((previous) => ({
                          ...previous,
                          instant: event.target.checked,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.repeat && event.key === ' ')
                          event.preventDefault();
                      }}
                    />
                    แสดงข้อความทันที
                  </label>
                  <p className="demo-setting-note">
                    Auto หยุดเมื่อพักเกมและต้องเปิดใหม่หลังเล่นต่อ ·
                    ปิดแสดงข้อความทันทีเพื่ออ่านทีละช่วง
                    {reducedMotion
                      ? ' · อุปกรณ์ตั้งค่าลดการเคลื่อนไหว จะแสดงข้อความทันที'
                      : ''}
                  </p>
                  <div className="demo-pause-footer">
                    <p>กลับหน้าหลักแล้วความคืบหน้ารอบนี้จะหาย</p>
                    <DemoControl
                      className="vn-back-main"
                      {...inputProps}
                      onActivate={home}
                    >
                      กลับหน้าหลัก
                    </DemoControl>
                  </div>
                </div>
              </div>
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
          <p>กรุณาหมุนอุปกรณ์เป็นแนวนอนเพื่อเล่น</p>
          <p>พักการแสดงผลไว้แล้ว</p>
        </div>
      ) : null}
    </div>
  );
}
