import { afterEach, expect, it, vi } from 'vitest';
import { createAutoForward } from '../../src/ui/demo/useDemoPlayback';
import { createDemoSession } from '../../src/narrative/demoSession';

afterEach(() => vi.useRealTimers());

it('arms one full delay only when explicitly enabled and consumes before reentry', () => {
  vi.useFakeTimers();
  const auto = createAutoForward();
  const advance = vi.fn(() => true);
  auto.schedule(1000, () => true, advance);
  vi.advanceTimersByTime(2000);
  expect(advance).not.toHaveBeenCalled();
  auto.enable();
  auto.schedule(2000, () => true, advance);
  vi.advanceTimersByTime(1999);
  expect(advance).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(advance).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(10000);
  expect(advance).toHaveBeenCalledTimes(1);
  auto.stop();
});

it('a superseded callback cannot advance or disable a newly enabled operation', () => {
  const callbacks: (() => void)[] = [];
  const auto = createAutoForward({
    set: (cb) => {
      callbacks.push(cb);
      return cb;
    },
    clear() {},
  });
  const old = vi.fn(() => true),
    fresh = vi.fn(() => true);
  auto.enable();
  auto.schedule(1000, () => true, old);
  auto.stop(); // Disposal/pause/manual input synchronously revokes the timer.
  auto.enable();
  auto.schedule(1000, () => true, fresh);
  callbacks[0]();
  expect(old).not.toHaveBeenCalled();
  expect(auto.getSnapshot()).toBe(true);
  callbacks[1]();
  callbacks[1](); // Reentrant delivery of the same intention is consumed.
  expect(fresh).toHaveBeenCalledTimes(1);
});

it('rejects an invalidated live guard at the physical continue boundary', () => {
  vi.useFakeTimers();
  const auto = createAutoForward(),
    advance = vi.fn(() => true);
  let safe = true;
  auto.enable();
  auto.schedule(1000, () => safe, advance);
  safe = false;
  vi.advanceTimersByTime(1000);
  expect(advance).not.toHaveBeenCalled();
  expect(auto.getSnapshot()).toBe(false);
});

it('restarts the entire delay without catch-up when timing is changed', () => {
  vi.useFakeTimers();
  const auto = createAutoForward(),
    advance = vi.fn(() => true);
  auto.enable();
  auto.schedule(1000, () => true, advance);
  vi.advanceTimersByTime(900);
  auto.schedule(2000, () => true, advance);
  vi.advanceTimersByTime(1999);
  expect(advance).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(advance).toHaveBeenCalledTimes(1);
});

it('uses the real controller guard: a manually consumed request cannot replay facts', () => {
  vi.useFakeTimers();
  const session = createDemoSession();
  session.controller.start();
  for (
    let i = 0;
    i < 80 && session.controller.getSnapshot().line?.id !== 'demo.D101-L007';
    i++
  ) {
    const view = session.controller.getSnapshot();
    if (view.phase === 'line') session.controller.continue(view);
    else if (view.phase === 'choice') session.controller.choose(view, 0);
    else throw new Error('Unexpected controller phase');
  }
  const request = session.controller.getSnapshot();
  expect(request.line?.id).toBe('demo.D101-L007');
  const ledger = session.store.getState().committedEventIds;
  const auto = createAutoForward();
  auto.enable();
  auto.schedule(
    1000,
    () => true,
    () => session.controller.continue(request),
  );
  session.controller.continue(request); // Manual interaction wins the same request.
  const live = session.controller.getSnapshot();
  vi.advanceTimersByTime(1000);
  expect(auto.getSnapshot()).toBe(false);
  expect(session.controller.getSnapshot()).toBe(live);
  expect(session.store.getState().committedEventIds).toEqual(ledger);
  session.controller.dispose();
});

it('waiting for a manual choice cancels execution while preserving ON intent', () => {
  vi.useFakeTimers();
  const auto = createAutoForward(),
    advance = vi.fn(() => true);
  auto.enable();
  auto.schedule(1000, () => true, advance);
  auto.cancelPending(); // Choice boundary pauses execution, not user intent.
  vi.advanceTimersByTime(5000);
  expect(advance).not.toHaveBeenCalled();
  expect(auto.getSnapshot()).toBe(true);
  auto.schedule(2000, () => true, advance); // Fresh revealed line after manual choice.
  vi.advanceTimersByTime(1999);
  expect(advance).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(advance).toHaveBeenCalledTimes(1);
});

it('a delivered choice-wait timer cannot consume a new line timer', () => {
  const callbacks: (() => void)[] = [];
  const auto = createAutoForward({
    set(cb) {
      callbacks.push(cb);
      return cb;
    },
    clear() {},
  });
  const advance = vi.fn(() => true);
  auto.enable();
  auto.schedule(1000, () => true, advance);
  auto.cancelPending();
  auto.schedule(2000, () => true, advance);
  callbacks[0]();
  expect(advance).not.toHaveBeenCalled();
  callbacks[1]();
  callbacks[1]();
  expect(advance).toHaveBeenCalledTimes(1);
});
