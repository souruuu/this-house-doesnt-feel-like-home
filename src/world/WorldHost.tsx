import { useEffect, useRef } from 'react';
import { GameBridge, type DemoWorldView } from './GameBridge';

export function WorldHost({
  paused,
  presentation,
  demo = false,
}: {
  paused: boolean;
  presentation?: DemoWorldView;
  demo?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<GameBridge | null>(null);
  useEffect(() => {
    const host = hostRef.current!;
    // Each effect owns a separate parent, so delayed Phaser destruction cannot remove a new canvas.
    const parent = document.createElement('div');
    host.append(parent);
    const bridge = new GameBridge();
    bridgeRef.current = bridge;
    let active = true;
    let destroy: (() => void) | undefined;
    void import('./createWorld')
      .then(({ createWorld }) => {
        if (active) destroy = createWorld(parent, bridge, demo);
      })
      .catch(() => {
        if (active) parent.dataset.worldState = 'error';
      });
    return () => {
      active = false;
      bridgeRef.current = null;
      destroy?.();
      bridge.dispose();
      parent.remove();
    };
  }, [demo]);
  useEffect(() => {
    if (presentation) bridgeRef.current?.setPresentation(presentation);
  }, [presentation, demo]);
  useEffect(() => {
    bridgeRef.current?.setPaused(paused);
  }, [paused]);
  return <div ref={hostRef} className="world-host" aria-hidden="true" />;
}
