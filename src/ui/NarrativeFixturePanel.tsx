import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
import type { FixtureSession } from '../narrative/fixtureSession';
import type { NarrativeView } from '../narrative/types';
import type { FixtureRuntime } from '../narrative/FixtureRuntime';
import { saveSlots } from '../save/SaveRepository';
import { Button } from './Button';

// This owner stays mounted when the fixture view/world is closed. React view
// subscriptions may remount without replacing the active playthrough.
export default function NarrativeFixturePanel({
  paused,
  visible,
}: {
  paused: boolean;
  visible: boolean;
}) {
  const [runtime, setRuntime] = useState<FixtureRuntime | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    let created: FixtureRuntime | undefined;
    void import('../narrative/fixtureSession')
      .then(({ createFixtureRuntime }) => {
        if (!active) return;
        created = createFixtureRuntime();
        setRuntime(created);
        void created.initialize();
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
      created?.dispose();
    };
  }, []);

  useEffect(() => {
    void runtime?.setEnvironment(paused || !visible);
  }, [paused, visible, runtime]);

  if (!visible) return null;
  if (loadError) return <p role="alert">ไม่สามารถเปิดชุดทดสอบระบบข้อความ</p>;
  if (!runtime) return <p>กำลังโหลดชุดทดสอบ</p>;
  return <RuntimeView runtime={runtime} paused={paused} />;
}

function RuntimeView({
  runtime,
  paused,
}: {
  runtime: FixtureRuntime;
  paused: boolean;
}) {
  const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot);
  const unavailable =
    state.busy || !!state.confirmation || state.phase === 'blocked';
  const labels = {
    autosave: 'อัตโนมัติ',
    'manual-1': 'ช่อง 1',
    'manual-2': 'ช่อง 2',
    'manual-3': 'ช่อง 3',
  };
  const safe =
    state.session &&
    ['line', 'choice'].includes(state.session.controller.getSnapshot().phase);
  return (
    <div
      data-runtime-phase={state.phase}
      data-runtime-busy={String(state.busy)}
      data-feedback={state.feedback.status}
      data-read-history={state.readLineIds.join(',')}
    >
      <section aria-label="จัดการจุดบันทึกทดสอบ" className="narrative-fixture">
        <p>จุดบันทึกสำหรับ QA — ไม่ใช่เมนูเกมฉบับเผยแพร่</p>
        <p role="status" aria-label="สถานะจุดบันทึกทดสอบ">
          {state.busy ? 'กำลังดำเนินการ… ' : ''}
          {state.feedback.message}
        </p>
        <div className="ui-actions">
          <Button
            disabled={
              unavailable ||
              paused ||
              state.phase !== 'awaiting-decision' ||
              state.slots.autosave?.status !== 'valid'
            }
            onClick={() => void runtime.resume()}
          >
            เล่นต่อจาก Autosave
          </Button>
          <Button
            disabled={unavailable || paused || state.phase === 'checking'}
            onClick={() => void runtime.newRun()}
          >
            เริ่มรอบทดสอบใหม่
          </Button>
          <Button
            disabled={unavailable || state.phase === 'checking'}
            onClick={() => void runtime.inspect()}
          >
            ตรวจช่องบันทึก
          </Button>
          <Button
            disabled={unavailable || !safe}
            onClick={() => void runtime.retrySave()}
          >
            ลองบันทึก Autosave อีกครั้ง
          </Button>
        </div>
        {saveSlots.map((slot) => (
          <div
            key={slot}
            className="ui-actions"
            data-slot={slot}
            data-slot-status={state.slots[slot]?.status ?? 'checking'}
          >
            <span>
              {labels[slot]}: {state.slots[slot]?.status ?? 'checking'}
              {state.slots[slot]?.status === 'valid'
                ? ` — ${state.slots[slot].envelope.narrative.checkpoint.line.id}`
                : ''}
            </span>
            {slot !== 'autosave' ? (
              <>
                <Button
                  disabled={unavailable || !safe}
                  onClick={() => void runtime.manualSave(slot)}
                >
                  บันทึก {labels[slot]}
                </Button>
                <Button
                  disabled={
                    unavailable ||
                    paused ||
                    state.slots[slot]?.status !== 'valid'
                  }
                  onClick={() => void runtime.manualLoad(slot)}
                >
                  โหลด {labels[slot]}
                </Button>
              </>
            ) : null}
          </div>
        ))}
        {state.confirmation ? (
          <div role="dialog" aria-label="ยืนยันแทนที่จุดบันทึก">
            <p>
              {state.confirmation.kind === 'load'
                ? 'การเล่นต่อจากช่องนี้จะใช้ Autosave แทนรอบเดิมเมื่อถึงจุดบันทึกถัดไป'
                : 'ยืนยันให้ข้อมูลของรอบนี้แทนที่ช่องบันทึกเดิมหรือไม่'}
            </p>
            <Button
              disabled={state.busy || paused}
              onClick={() => void runtime.confirm()}
            >
              ยืนยันแทนที่
            </Button>
            <Button disabled={state.busy} onClick={() => runtime.cancel()}>
              ยกเลิก
            </Button>
          </div>
        ) : null}
      </section>
      {state.session && state.phase === 'active' ? (
        <FixtureView
          key={state.session.controller.getSnapshot().sessionId}
          session={state.session}
          runtime={runtime}
          paused={paused || state.busy || !!state.confirmation}
        />
      ) : null}
    </div>
  );
}

function FixtureView({
  session,
  paused,
  runtime,
}: {
  session: FixtureSession;
  paused: boolean;
  runtime: FixtureRuntime;
}) {
  const view: NarrativeView = useSyncExternalStore(
    session.controller.subscribe,
    session.controller.getSnapshot,
  );
  const domain = useSyncExternalStore(
    session.store.subscribe,
    session.store.getState,
  );
  const region = useRef<HTMLDivElement>(null);

  function continueLine() {
    if (view && session && !paused) void runtime.continue(view);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return;
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }
    if (paused || !view || !session) return;
    if (
      view.phase === 'choice' &&
      ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    ) {
      const buttons = Array.from(
        region.current?.querySelectorAll<HTMLButtonElement>('[data-choice]') ??
          [],
      );
      if (!buttons.length) return;
      const index = buttons.findIndex(
        (button) => button === document.activeElement,
      );
      const direction = ['ArrowDown', 'ArrowRight'].includes(event.key)
        ? 1
        : -1;
      const next =
        index < 0
          ? direction > 0
            ? 0
            : buttons.length - 1
          : (index + direction + buttons.length) % buttons.length;
      buttons[next].focus();
      event.preventDefault();
      return;
    }
    if (
      (event.target as HTMLElement).closest(
        'button, input, select, textarea, [role="dialog"]',
      )
    )
      return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      continueLine();
    }
  }

  return (
    <div
      className="narrative-fixture"
      ref={region}
      role="region"
      aria-label="ทดสอบระบบข้อความ"
      tabIndex={0}
      data-fixture-phase={view?.phase ?? 'loading'}
      data-session={view?.sessionId}
      data-line-id={view?.line?.id}
      data-notifications={session?.notificationCount() ?? 0}
      data-run={domain.runId}
      data-effects={domain.effectCount}
      data-ledger={domain.committedEventIds.join(',')}
      onKeyDown={onKeyDown}
    >
      <p>ชุดทดสอบระบบข้อความ — ไม่ใช่บทเกม</p>
      {view.phase === 'error' ? (
        <p role="alert">ข้อมูลชุดทดสอบไม่ถูกต้อง กรุณาเริ่มรอบทดสอบใหม่</p>
      ) : null}
      {view?.line ? <p className="fixture-line">{view.line.text}</p> : null}
      <div className="ui-actions">
        {view?.phase === 'line' ? (
          <Button
            disabled={paused}
            onClick={(event) => {
              if (event.detail <= 1) continueLine();
            }}
          >
            อ่านต่อ
          </Button>
        ) : null}
        {view?.phase === 'choice'
          ? view.choices.map((choice) => (
              <Button
                key={choice.id}
                data-choice={choice.id}
                disabled={paused}
                onClick={(event) => {
                  if (!paused && event.detail <= 1)
                    void runtime.choose(view, choice.index);
                }}
              >
                {choice.text}
              </Button>
            ))
          : null}
      </div>
      {view?.phase === 'ended' ? <p>จบชุดทดสอบ</p> : null}
    </div>
  );
}
