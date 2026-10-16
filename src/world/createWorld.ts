import Phaser from 'phaser';
import { resolveAssetUrl } from '../assets/manifest';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../shell/viewport';
import type { GameBridge } from './GameBridge';
import { ManagedGame } from './ManagedGame';

export function createWorld(
  parent: HTMLDivElement,
  bridge: GameBridge,
  demo = false,
) {
  let unsubscribePresentation = () => {};
  class PlaceholderScene extends Phaser.Scene {
    constructor() {
      super('m0-placeholder');
    }

    preload() {
      if (demo) {
        for (const time of ['morning', 'evening', 'night'] as const)
          this.load.image(
            `demo.shop.${time}`,
            resolveAssetUrl(`demo.shop.${time}`),
          );
        this.load.once('loaderror', () => {
          parent.dataset.worldState = 'error';
        });
        return;
      }
      this.load.svg(
        'm0.world.reference',
        resolveAssetUrl('m0.world.reference'),
      );
      this.load.once('loaderror', () => {
        parent.dataset.worldState = 'error';
      });
    }

    create() {
      if (demo) {
        this.cameras.main.setBackgroundColor('#000000');
        const background = this.add.image(960, 540, 'demo.shop.morning');
        const placeholder = this.add.rectangle(
          960,
          570,
          230,
          280,
          0x171717,
          0.8,
        );
        const label = this.add
          .text(960, 570, '', {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '36px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 210 },
          })
          .setOrigin(0.5);
        unsubscribePresentation = bridge.subscribePresentation((view) => {
          const key = `demo.shop.${view.background}`;
          if (!this.textures.exists(key)) {
            parent.dataset.worldState = 'error';
            return;
          }
          background.setTexture(key);
          const source = this.textures.get(key).getSourceImage();
          const scale = Math.min(
            LOGICAL_WIDTH / source.width,
            LOGICAL_HEIGHT / source.height,
          );
          background.setScale(scale);
          placeholder.setVisible(view.characterLabel !== null);
          label
            .setVisible(view.characterLabel !== null)
            .setText(view.characterLabel ?? '');
        });
        parent.dataset.worldState = 'ready';
        return;
      }
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
    unsubscribePresentation();
    game.destroy(true);
    // destroy() is deferred to a frame, including when the page was hidden.
    if (game.isRunning && !game.loop.running) game.loop.wake();
  };
}
