import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent,
} from 'react';
import type { NarrativeView } from '../../narrative/types';
import { DemoControl, type DemoInputGuard } from '../DemoControl';

export function DialoguePanel({
  view,
  speaker,
  text,
  lineKey,
  revealing,
  paused,
  guard,
  choicesRef,
  autoEnabled,
  autoExecution,
  onAuto,
  onContinue,
  onChoose,
  onHome,
  returnLabel,
}: {
  view: NarrativeView;
  speaker: string;
  text: string;
  lineKey: string;
  revealing: boolean;
  paused: boolean;
  guard: DemoInputGuard;
  choicesRef: RefObject<HTMLDivElement | null>;
  autoEnabled: boolean;
  autoExecution: string;
  onAuto(): void;
  onContinue(): void;
  onChoose(index: number): void;
  onHome(): void;
  returnLabel: string;
}) {
  const [notice, setNotice] = useState(0);
  const [committed, setCommitted] = useState<{
    id: string;
    index: number;
    token: string;
  } | null>(null);
  const gesture = useRef<{
    pointer: number;
    x: number;
    y: number;
    token: string;
    valid: boolean;
  } | null>(null);
  const lastActivation = useRef(-Infinity);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(0), 2200);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!committed) return;
    // Brief, input-locked confirmation; never advance Ink to manufacture feedback.
    const timer = setTimeout(() => {
      if (!paused && guard.isAllowed() && guard.getToken() === committed.token)
        onChoose(committed.index);
      setCommitted(null);
    }, 100);
    return () => clearTimeout(timer);
  }, [committed, paused, guard, onChoose]);
  const safe = () =>
    !paused &&
    view.phase === 'line' &&
    guard.isAllowed() &&
    guard.getToken() === guard.token &&
    document.hasFocus();
  function begin(event: PointerEvent<HTMLDivElement>) {
    gesture.current = null;
    if (event.button !== 0 || !event.isPrimary || !safe()) return;
    if (window.getSelection()?.toString()) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, input, a, [data-dialogue-interactive]')) return;
    const scroll = target.closest<HTMLElement>('.demo-text-scroll');
    if (
      scroll &&
      scroll.scrollHeight > scroll.clientHeight &&
      event.clientX >= scroll.getBoundingClientRect().right - 14
    )
      return;
    gesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      token: guard.token,
      valid: true,
    };
  }
  if (view.phase === 'error')
    return (
      <div className="demo-dialogue" role="alert">
        <p>ไม่สามารถดำเนินเรื่องต่อได้ กรุณากลับหน้าหลัก</p>
        <DemoControl {...guard} onActivate={onHome}>
          กลับหน้าหลัก
        </DemoControl>
      </div>
    );
  // D-5: three visible line kinds. Quotes/plates are presentation only (CSS),
  // never added to the approved text content.
  const lineKind = !speaker
    ? 'narration'
    : view.presentation.speaker === 'player'
      ? 'player'
      : 'speech';
  const canAuto =
    ['line', 'choice'].includes(view.phase) &&
    view.presentation.sceneId !== 'DEMO_END';
  return (
    <>
      {view.phase === 'choice' ? (
        <div className="demo-choice-region" aria-label="พื้นที่ตัวเลือก">
          <div
            className="demo-choices"
            ref={choicesRef}
            role="group"
            aria-label="ตัวเลือก"
          >
            {view.choices.map((choice) => (
              <DemoControl
                key={choice.id}
                data-demo-choice={choice.id}
                disabled={paused || committed !== null}
                data-committed={committed?.id === choice.id}
                {...guard}
                onActivate={() => {
                  if (!committed)
                    setCommitted({
                      id: choice.id,
                      index: choice.index,
                      token: guard.token,
                    });
                }}
                onKeyDown={(event) => {
                  if (
                    ![
                      'ArrowDown',
                      'ArrowRight',
                      'ArrowUp',
                      'ArrowLeft',
                    ].includes(event.key)
                  )
                    return;
                  event.preventDefault();
                  if (event.repeat) return;
                  const buttons =
                    choicesRef.current?.querySelectorAll<HTMLButtonElement>(
                      'button',
                    );
                  const direction =
                    event.key === 'ArrowDown' || event.key === 'ArrowRight'
                      ? 1
                      : -1;
                  buttons?.[
                    (choice.index + direction + view.choices.length) %
                      view.choices.length
                  ]?.focus();
                }}
              >
                <span className="demo-choice-mark" aria-hidden="true">
                  ›
                </span>
                <span>{choice.text}</span>
              </DemoControl>
            ))}
          </div>
        </div>
      ) : null}
      <div
        className={`demo-dialogue${view.phase === 'choice' ? ' demo-dialogue--choice' : ''}`}
        data-has-speaker={Boolean(speaker)}
        data-line-kind={lineKind}
        data-ending={view.presentation.sceneId === 'DEMO_END'}
        data-can-continue={!paused && view.phase === 'line'}
        onPointerDown={begin}
        onPointerMove={(event) => {
          const press = gesture.current;
          if (
            press &&
            (Math.abs(event.clientX - press.x) > 6 ||
              Math.abs(event.clientY - press.y) > 6)
          )
            press.valid = false;
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onScrollCapture={() => {
          gesture.current = null;
        }}
        onClick={(event) => {
          const press = gesture.current;
          gesture.current = null;
          if (
            (event.target as HTMLElement).closest(
              'button, input, a, [data-dialogue-interactive]',
            )
          )
            return;
          if (
            !press?.valid ||
            event.detail !== 1 ||
            press.token !== guard.token ||
            !safe()
          )
            return;
          if (
            window.getSelection()?.toString() ||
            performance.now() - lastActivation.current < 200
          )
            return;
          lastActivation.current = performance.now();
          onContinue();
        }}
      >
        {speaker ? (
          <header className="demo-speaker-header">
            <p className="demo-speaker">{speaker}</p>
          </header>
        ) : null}
        <div
          className="demo-text-scroll"
          tabIndex={0}
          aria-label="ข้อความที่เลื่อนได้"
          key={lineKey}
        >
          <p className="demo-text" aria-hidden="true">
            {text}
          </p>
        </div>
        <span className="demo-sr-only" role="status" aria-live="polite">
          {view.line?.text}
        </span>
        <footer className="demo-dialogue-footer" aria-label="ควบคุมบทสนทนา">
          <DemoControl
            {...guard}
            className="demo-auto"
            disabled={paused || !canAuto}
            aria-label="Auto"
            aria-pressed={autoEnabled}
            data-auto-execution={autoExecution}
            aria-description={
              autoExecution === 'waiting-choice'
                ? 'Auto เปิดอยู่ — รอการเลือก'
                : autoEnabled
                  ? 'Auto เปิดอยู่'
                  : 'Auto ปิดอยู่'
            }
            onActivate={onAuto}
          >
            <span className="demo-auto-mark" aria-hidden="true" />
            Auto
            {autoExecution === 'waiting-choice' ? (
              <small className="demo-auto-wait">รอเลือก</small>
            ) : null}
          </DemoControl>
          <span id="demo-skip-reason" className="demo-sr-only">
            Skip ยังไม่พร้อม รอการอนุมัติระบบประวัติข้อความที่อ่านแล้ว
          </span>
          <DemoControl
            {...guard}
            className="demo-skip"
            disabled={paused}
            aria-disabled="true"
            aria-describedby="demo-skip-reason"
            aria-label="Skip — ยังไม่พร้อม"
            onActivate={() => setNotice((previous) => previous + 1)}
          >
            Skip
          </DemoControl>
          {notice ? (
            <span className="demo-skip-notice" role="status">
              ยังไม่พร้อมใช้งาน
            </span>
          ) : null}
          {view.phase === 'ended' ? (
            <DemoControl
              {...guard}
              className="demo-continue demo-return-menu vn-back-main"
              onActivate={onHome}
            >
              {returnLabel}
            </DemoControl>
          ) : (
            <DemoControl
              {...guard}
              className="demo-continue"
              disabled={paused || view.phase !== 'line'}
              aria-label="อ่านต่อ"
              title={revealing ? 'แสดงข้อความทั้งหมด' : 'อ่านต่อ'}
              onActivate={onContinue}
            >
              <span aria-hidden="true">▶</span>
            </DemoControl>
          )}
        </footer>
      </div>
    </>
  );
}
