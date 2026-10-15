import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { FixtureSession } from '../narrative/fixtureSession';
import type { NarrativeView } from '../narrative/types';
import { Button } from './Button';

export default function NarrativeFixturePanel({ paused }: { paused: boolean }) {
  const [session, setSession] = useState<FixtureSession | null>(null);
  const [view, setView] = useState<NarrativeView | null>(null);
  const [loadError, setLoadError] = useState(false);
  const latestPause = useRef(paused);
  const region = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;
    void import('../narrative/fixtureSession')
      .then(({ createFixtureSession }) => {
        if (!active) return;
        const created = createFixtureSession();
        const unsubscribe = created.controller.subscribe((snapshot) => {
          if (active) setView(snapshot);
        });
        cleanup = () => {
          unsubscribe();
          created.controller.dispose();
        };
        created.controller.setPaused(latestPause.current);
        created.controller.start();
        setView(created.controller.getSnapshot());
        setSession(created);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    latestPause.current = paused;
    if (!session) return;
    session.controller.setPaused(paused);
    if (!paused) session.controller.start();
  }, [paused, session]);

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
      onKeyDown={onKeyDown}
    >
      <p>ชุดทดสอบระบบข้อความ — ไม่ใช่บทเกม</p>
      {loadError || view?.phase === 'error' ? (
        <p role="alert">
          ข้อมูลชุดทดสอบไม่ถูกต้อง กรุณาปิดแล้วเปิดฉากทดสอบใหม่
        </p>
      ) : null}
      {view?.line ? <p className="fixture-line">{view.line.text}</p> : null}
      {!view && !loadError ? <p>กำลังโหลดชุดทดสอบ</p> : null}
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
    </div>
  );
}
