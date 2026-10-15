import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
import type { FixtureSession } from '../narrative/fixtureSession';
import type { NarrativeView } from '../narrative/types';
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
  const [session, setSession] = useState<FixtureSession | null>(null);
  const [loadError, setLoadError] = useState(false);
  const latestPause = useRef(paused || !visible);
  const createSession = useRef<(() => FixtureSession) | null>(null);
  const ownedSession = useRef<FixtureSession | null>(null);

  useEffect(() => {
    let active = true;
    void import('../narrative/fixtureSession')
      .then(({ createFixtureSession }) => {
        if (!active) return;
        createSession.current = createFixtureSession;
        const created = createFixtureSession();
        ownedSession.current = created;
        created.controller.setPaused(latestPause.current);
        created.controller.start();
        setSession(created);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
      ownedSession.current?.controller.dispose();
      ownedSession.current = null;
      createSession.current = null;
    };
  }, []);

  useEffect(() => {
    latestPause.current = paused || !visible;
    if (!session) return;
    session.controller.setPaused(paused || !visible);
    if (!paused && visible) session.controller.start();
  }, [paused, visible, session]);

  function newRun() {
    if (!createSession.current) return;
    const next = createSession.current();
    ownedSession.current?.controller.dispose();
    ownedSession.current = next;
    next.controller.setPaused(latestPause.current);
    next.controller.start();
    setSession(next);
  }

  if (!visible) return null;
  if (loadError) return <p role="alert">ไม่สามารถเปิดชุดทดสอบระบบข้อความ</p>;
  if (!session) return <p>กำลังโหลดชุดทดสอบ</p>;
  return (
    <FixtureView
      key={session.controller.getSnapshot().sessionId}
      session={session}
      paused={paused}
      newRun={newRun}
    />
  );
}

function FixtureView({
  session,
  paused,
  newRun,
}: {
  session: FixtureSession;
  paused: boolean;
  newRun: () => void;
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
    if (view && session && !paused) session.controller.continue(view);
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
                    session?.controller.choose(view, choice.index);
                }}
              >
                {choice.text}
              </Button>
            ))
          : null}
      </div>
      {view?.phase === 'ended' ? <p>จบชุดทดสอบ</p> : null}
      <Button disabled={paused} onClick={newRun}>
        เริ่มรอบทดสอบใหม่
      </Button>
    </div>
  );
}
