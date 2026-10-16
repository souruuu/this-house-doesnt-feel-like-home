import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  createDemoSession,
  demoReferences,
  type DemoSession,
} from '../narrative/demoSession.ts';
import type { NarrativeView } from '../narrative/types.ts';
import { Button } from '../ui/Button.tsx';
import { WorldHost } from '../world/WorldHost.tsx';
import type { DemoWorldView } from '../world/GameBridge.ts';
import { fitViewport } from './viewport.ts';

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
  const actor =
    scene === 'SC-D1-01' || scene === 'SC-D2-01'
      ? 'manao'
      : scene === 'SC-D1-02' || scene === 'SC-D2-02' || scene === 'SC-D3-01'
        ? 'som'
        : scene === 'SC-D1-03'
          ? (view.line?.id.match(/D103-L(\d+)/)?.[1] ?? '000') >= '008'
            ? 'kan'
            : 'nut'
          : scene === 'SC-D2-03' || scene === 'SC-D3-02'
            ? 'nut'
            : scene === 'SC-D3-03'
              ? 'kan'
              : null;
  const flags = session.store.getState().flags;
  // A name-disclosure line still uses its approved anonymous label; only the next line may use the name.
  const disclosure = {
    manao: 'demo.D101-L007',
    som: 'demo.D102-L007',
    nut: 'demo.D103-L004',
    kan: 'demo.D303-L010A',
  };
  let label: string | null = null;
  if (actor) {
    const learned =
      flags[`${actor}_name`] && view.line?.id !== disclosure[actor];
    label = learned
      ? names[actor]
      : actor === 'kan'
        ? names.awning_boy
        : actor === 'nut'
          ? names.boy
          : names.girl;
  }
  // End-of-day montage has no child still in the shop.
  if (
    /D103-L01[1-4]|D203-L00[89]|D203-L010|D301-L012|D302-L010|D303-L01[2-5]/.test(
      view.line?.id ?? '',
    )
  )
    label = null;
  return {
    background:
      scene === 'SC-D3-02' || scene === 'SC-D3-03'
        ? 'night'
        : scene.endsWith('-03')
          ? 'evening'
          : 'morning',
    characterLabel: label,
  };
}

export function DemoApp() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<DemoSession | null>(null);
  const [bounds, setBounds] = useState(() =>
    fitViewport(window.innerWidth, window.innerHeight),
  );
  const [portrait, setPortrait] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [userPaused, setUserPaused] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState('');
  const paused = userPaused || portrait || hidden;
  const view = useSyncExternalStore(
    session?.controller.subscribe ?? noSubscribe,
    session?.controller.getSnapshot ?? noSnapshot,
  );
  const presentation = worldView(view, session);

  useEffect(() => {
    const query = window.matchMedia(
      '(orientation: portrait) and (any-pointer: coarse)',
    );
    const measure = () => {
      const rect = shellRef.current!.getBoundingClientRect();
      setBounds(fitViewport(rect.width, rect.height));
      setPortrait(query.matches);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(shellRef.current!);
    query.addEventListener('change', measure);
    measure();
    const visibility = () => setHidden(document.hidden);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.repeat && session && !portrait) {
        event.preventDefault();
        setUserPaused((value) => !value);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('keydown', escape);
    return () => {
      observer.disconnect();
      query.removeEventListener('change', measure);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', escape);
    };
  }, [session, portrait]);

  useEffect(() => {
    session?.controller.setPaused(paused);
  }, [session, paused]);
  useEffect(
    () => () => {
      session?.controller.dispose();
    },
    [session],
  );

  function start() {
    const next = createDemoSession();
    next.controller.start();
    setSession(next);
    setUserPaused(false);
  }
  function home() {
    session?.controller.dispose();
    setSession(null);
    setUserPaused(false);
  }
  function advance() {
    if (!session || !view || paused || !document.hasFocus()) return;
    session.controller.continue(view);
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shellRef.current?.requestFullscreen)
        await shellRef.current.requestFullscreen();
      else setFullscreenMessage('อุปกรณ์นี้ไม่รองรับการแสดงเต็มจอ');
    } catch {
      setFullscreenMessage('ไม่สามารถแสดงเต็มจอได้ ใช้งานในหน้าต่างต่อได้');
    }
  }
  const day = view?.presentation.sceneId.match(/^SC-D([123])-/)?.[1];
  return (
    <div className="game-shell demo-shell" ref={shellRef} data-paused={paused}>
      <div
        className="viewport-frame"
        style={{ width: bounds.width, height: bounds.height }}
      >
        <div
          className="logical-stage"
          style={{ transform: `scale(${bounds.scale})` }}
        >
          <WorldHost demo paused={paused} presentation={presentation} />
          <div className="ui-overlay demo-overlay" inert={portrait}>
            {!session ? (
              <section className="demo-menu" aria-label="หน้าหลัก">
                <h1>บ้านที่ไม่รู้สึกเหมือนบ้าน</h1>
                <p>ช่วงทดลองเล่น วันที่ 1–3</p>
                <Button onClick={start}>เริ่มเกม</Button>
                <p className="demo-disclaimer">
                  เดโมนี้ยังไม่บันทึกความคืบหน้า
                  การรีเฟรชหรือปิดหน้าจะเริ่มเล่นใหม่
                </p>
              </section>
            ) : (
              <section
                className="demo-narrative"
                aria-label="บทสนทนา"
                tabIndex={0}
                inert={paused}
                data-phase={view?.phase}
                data-line-id={view?.line?.id ?? ''}
                data-scene-id={view?.presentation.sceneId}
                data-run-id={session.store.getState().runId}
                onKeyDown={(event) => {
                  if (event.repeat) {
                    event.preventDefault();
                    return;
                  }
                  if (
                    (event.key === 'Enter' || event.key === ' ') &&
                    !(
                      event.target instanceof HTMLElement &&
                      event.target.closest('button')
                    )
                  ) {
                    event.preventDefault();
                    advance();
                  }
                }}
              >
                {day ? (
                  <div className="demo-day" aria-live="polite">
                    วันที่ {day}
                  </div>
                ) : null}
                {view?.phase === 'choice' ? (
                  <div
                    className="demo-choices"
                    role="group"
                    aria-label="ตัวเลือก"
                  >
                    {view.choices.map((choice) => (
                      <Button
                        key={choice.id}
                        data-demo-choice={choice.id}
                        disabled={paused}
                        onKeyDown={(event) => {
                          if (event.repeat) event.preventDefault();
                        }}
                        onClick={(event) => {
                          if (
                            event.detail <= 1 &&
                            !paused &&
                            document.hasFocus()
                          )
                            session.controller.choose(view, choice.index);
                        }}
                      >
                        {choice.text}
                      </Button>
                    ))}
                  </div>
                ) : null}
                {view?.phase !== 'error' ? (
                  <div className="demo-dialogue">
                    <p className="demo-speaker">
                      {names[view?.presentation.speaker ?? 'none']}
                    </p>
                    <p className="demo-text" aria-live="polite">
                      {view?.line?.text}
                    </p>
                    {view?.phase === 'line' ? (
                      <Button
                        disabled={paused}
                        onKeyDown={(event) => {
                          if (event.repeat) event.preventDefault();
                        }}
                        onClick={(event) => {
                          if (event.detail <= 1) advance();
                        }}
                      >
                        อ่านต่อ
                      </Button>
                    ) : null}
                    {view?.phase === 'ended' ? (
                      <Button onClick={home}>
                        {demoReferences.ui.returnToMenu}
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="demo-dialogue" role="alert">
                    <p>ไม่สามารถดำเนินเรื่องต่อได้ กรุณากลับหน้าหลัก</p>
                    <Button onClick={home}>กลับหน้าหลัก</Button>
                  </div>
                )}
              </section>
            )}
            <div className="demo-toolbar">
              {session && !userPaused ? (
                <Button onClick={() => setUserPaused(true)}>พัก</Button>
              ) : null}
              <Button onClick={() => void fullscreen()}>เต็มจอ</Button>
            </div>
            {userPaused ? (
              <div
                className="demo-pause"
                role="dialog"
                aria-modal="true"
                aria-label="พักเกม"
              >
                <h2>พักเกม</h2>
                <Button autoFocus onClick={() => setUserPaused(false)}>
                  เล่นต่อ
                </Button>
                <p>กลับหน้าหลักแล้วความคืบหน้ารอบนี้จะหาย</p>
                <Button onClick={home}>กลับหน้าหลัก</Button>
              </div>
            ) : null}
            {fullscreenMessage ? (
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
