import { useEffect, useState, useSyncExternalStore } from 'react';
import type { NarrativeRequest, NarrativeView } from '../../narrative/types';

interface Clock {
  set(callback: () => void, milliseconds: number): unknown;
  clear(handle: unknown): void;
}

// A single UI-owned intention, never a narrative loop or a durable state owner.
export function createAutoForward(
  clock: Clock = {
    set: (callback, delay) => setTimeout(callback, delay),
    clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  },
) {
  let enabled = false;
  let generation = 0;
  let pending: unknown = null;
  const listeners = new Set<() => void>();
  function cancelPending() {
    generation++;
    if (pending !== null) clock.clear(pending);
    pending = null;
  }
  function setEnabled(next: boolean) {
    cancelPending();
    if (enabled === next) return;
    enabled = next;
    listeners.forEach((notify) => notify());
  }
  return {
    getSnapshot: () => enabled,
    subscribe(notify: () => void) {
      listeners.add(notify);
      return () => {
        listeners.delete(notify);
      };
    },
    enable: () => setEnabled(true),
    stop: () => setEnabled(false),
    cancelPending,
    schedule(delay: number, isCurrent: () => boolean, advance: () => boolean) {
      cancelPending();
      if (!enabled) return;
      const expected = generation;
      pending = clock.set(() => {
        if (!enabled || generation !== expected) return;
        pending = null;
        generation++; // Consume before any callback can synchronously reenter.
        // D-6: a stale or suspended moment never turns Auto off; the hook
        // re-arms a full delay when the view or the blocking state changes.
        if (isCurrent()) advance();
      }, delay);
    },
  };
}

interface Controller {
  getSnapshot(): NarrativeView;
  continue(request: NarrativeRequest): boolean;
}

export function useDemoPlayback({
  controller,
  view,
  blocked,
  revealing,
  delaySeconds,
  resetKey = '',
}: {
  controller: Controller | undefined;
  view: NarrativeView | null;
  blocked: boolean;
  revealing: boolean;
  delaySeconds: number;
  // Changes (e.g. viewport size) restart the full delay without stopping Auto.
  resetKey?: string;
}) {
  const [auto] = useState(createAutoForward);
  const enabled = useSyncExternalStore(auto.subscribe, auto.getSnapshot);
  useEffect(() => {
    // Auto ends only at the end of the demo (or via its own button).
    if (
      !controller ||
      !view ||
      !['line', 'choice'].includes(view.phase) ||
      view.presentation.sceneId === 'DEMO_END'
    ) {
      auto.stop();
      return;
    }
    // Pause, panels, blur, hidden tab, resize and fullscreen only suspend:
    // the pending timer is dropped and a full delay restarts afterwards.
    if (blocked) {
      auto.cancelPending();
      return;
    }
    if (enabled && view.phase === 'line' && !revealing && !view.paused) {
      auto.schedule(
        delaySeconds * 1000,
        () => {
          const live = controller.getSnapshot();
          return (
            !document.hidden &&
            document.hasFocus() &&
            !live.paused &&
            live.phase === 'line' &&
            live.sessionId === view.sessionId &&
            live.revision === view.revision &&
            live.line?.id === view.line?.id
          );
        },
        () => controller.continue(view),
      );
    }
    return auto.cancelPending;
  }, [
    auto,
    controller,
    view,
    enabled,
    blocked,
    revealing,
    delaySeconds,
    resetKey,
  ]);
  useEffect(() => auto.stop, [auto, view?.sessionId]);
  const execution = blocked
    ? 'paused'
    : view?.phase === 'ended' ||
        view?.phase === 'error' ||
        view?.presentation.sceneId === 'DEMO_END'
      ? 'stopped'
      : !enabled
        ? 'off'
        : view?.phase === 'choice'
          ? 'waiting-choice'
          : 'playing';
  return { enabled, execution, enable: auto.enable, stop: auto.stop };
}
