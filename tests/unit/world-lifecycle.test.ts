import { describe, expect, it, vi } from 'vitest';
import { GameBridge } from '../../src/world/GameBridge';

const doubles = vi.hoisted(() => ({
  pause: vi.fn(),
  resume: vi.fn(),
  destroy: vi.fn(),
  wake: vi.fn(),
}));
vi.mock('phaser', () => ({
  default: {
    AUTO: 0,
    Scale: { NONE: 0 },
    Scene: class {},
    Game: class {
      pause = doubles.pause;
      resume = doubles.resume;
      destroy = doubles.destroy;
      loop = { running: false, wake: doubles.wake };
      isRunning = true;
    },
  },
}));
import { createWorld } from '../../src/world/createWorld';

describe('Phaser session ownership', () => {
  it('destroys a paused game once, wakes deferred cleanup and detaches bridge listeners', () => {
    vi.clearAllMocks();
    const parent = { dataset: {} } as HTMLDivElement;
    const bridge = new GameBridge();
    const destroy = createWorld(parent, bridge);
    expect(doubles.resume).toHaveBeenCalledTimes(1);
    bridge.setPaused(true);
    expect(doubles.pause).toHaveBeenCalledTimes(1);
    destroy();
    destroy();
    expect(doubles.destroy).toHaveBeenCalledExactlyOnceWith(true);
    expect(doubles.wake).toHaveBeenCalledTimes(1);
    bridge.setPaused(false);
    expect(doubles.resume).toHaveBeenCalledTimes(1);
    bridge.dispose();
  });
});
