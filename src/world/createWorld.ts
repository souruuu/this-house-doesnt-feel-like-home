import Phaser from 'phaser';
import { resolveAssetUrl } from '../assets/manifest';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../shell/viewport';
import type { GameBridge } from './GameBridge';
import { ManagedGame } from './ManagedGame';

export function createWorld(parent: HTMLDivElement, bridge: GameBridge) {
  class PlaceholderScene extends Phaser.Scene {
    constructor() {
      super('m0-placeholder');
    }

    preload() {
      this.load.svg(
        'm0.world.reference',
        resolveAssetUrl('m0.world.reference'),
      );
      this.load.once('loaderror', () => {
        parent.dataset.worldState = 'error';
      });
    }

    create() {
      if (!this.textures.exists('m0.world.reference')) return;
      this.add.image(0, 0, 'm0.world.reference').setOrigin(0);
      parent.dataset.worldState = 'ready';
    }
  }

  const game = new ManagedGame({
    type: Phaser.AUTO,
    parent,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    scale: { mode: Phaser.Scale.NONE },
    scene: PlaceholderScene,
    audio: { noAudio: true }, // No audio assets/default channels in M0; U-03 stays open.
    input: { keyboard: false, mouse: false, touch: false },
    banner: false,
  });
  const unsubscribe = bridge.subscribePause((paused) => {
    if (paused) game.pause();
    else game.resume();
    parent.dataset.worldPaused = String(paused);
  });
  let destroyed = false;
  return () => {
    if (destroyed) return;
    destroyed = true;
    unsubscribe();
    game.destroy(true);
    // destroy() is deferred to a frame, including when the page was hidden.
    if (game.isRunning && !game.loop.running) game.loop.wake();
  };
}
