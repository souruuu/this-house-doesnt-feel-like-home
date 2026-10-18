import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react';

type SegmentText = (text: string) => readonly string[];

export function segmentDialogue(text: string): readonly string[] {
  // Instant fallback preserves Thai clusters when segmentation is unavailable.
  if (typeof Intl.Segmenter !== 'function') return [text];
  return Array.from(
    new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text),
    (part) => part.segment,
  );
}

interface RevealConfig {
  key: string;
  text: string;
  instant: boolean;
  reducedMotion: boolean;
  paused: boolean;
  active: boolean;
  speed?: number;
}

export function createDialogueReveal(segment: SegmentText = segmentDialogue) {
  let config: RevealConfig | null = null;
  let clusters: readonly string[] = [];
  let budget = 0;
  let count = 0;
  let snapshot: Readonly<{
    key: string;
    text: string;
    revealing: boolean;
    count: number;
  }> = Object.freeze({
    key: '',
    text: '',
    revealing: false,
    count: 0,
  });
  const listeners = new Set<() => void>();
  function publish() {
    const next = {
      key: config?.key ?? '',
      text: clusters.slice(0, count).join(''),
      revealing: count < clusters.length,
      count,
    };
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
    snapshot = Object.freeze(next);
    listeners.forEach((listener) => listener());
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    configure(next: RevealConfig) {
      if (config?.key !== next.key || config.text !== next.text) {
        clusters = segment(next.text);
        budget = 0;
        count = 0;
      }
      config = next;
      if (
        next.instant ||
        next.reducedMotion ||
        !next.active ||
        clusters.length <= 1
      )
        count = clusters.length;
      publish();
    },
    step(milliseconds: number) {
      if (
        !config ||
        config.paused ||
        !config.active ||
        !Number.isFinite(milliseconds) ||
        milliseconds <= 0
      )
        return;
      const speed = config.speed ?? 40;
      budget +=
        (milliseconds * (Number.isFinite(speed) && speed > 0 ? speed : 40)) /
        1000;
      count = Math.max(count, Math.min(clusters.length, Math.floor(budget)));
      publish();
    },
    finish(key: string) {
      if (
        config?.key !== key ||
        config.paused ||
        !config.active ||
        count >= clusters.length
      )
        return false;
      count = clusters.length;
      publish();
      return true;
    },
  };
}

export function useDialogueReveal(config: RevealConfig) {
  const [reveal] = useState(() => createDialogueReveal());
  const snapshot = useSyncExternalStore(reveal.subscribe, reveal.getSnapshot);
  const {
    key,
    text,
    instant,
    reducedMotion,
    paused,
    active,
    speed = 40,
  } = config;
  useLayoutEffect(() => {
    reveal.configure({
      key,
      text,
      instant,
      reducedMotion,
      paused,
      active,
      speed,
    });
  }, [reveal, key, text, instant, reducedMotion, paused, active, speed]);
  useEffect(() => {
    if (paused || instant || reducedMotion || !active) return;
    let cancelled = false;
    let previous: number | null = null;
    let frame = 0;
    function tick(now: number) {
      if (cancelled) return;
      if (previous !== null) reveal.step(now - previous);
      previous = now;
      if (reveal.getSnapshot().revealing) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [reveal, key, text, instant, reducedMotion, paused, active]);
  return {
    text:
      snapshot.key === key
        ? snapshot.text
        : instant || reducedMotion
          ? text
          : '',
    revealing: snapshot.key === key && snapshot.revealing,
    finish: () => reveal.finish(key),
  };
}
