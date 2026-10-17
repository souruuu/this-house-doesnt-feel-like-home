import Phaser from 'phaser';
import { resolveAssetUrl } from '../assets/manifest';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../shell/viewport';
import type { GameBridge } from './GameBridge';
import { ManagedGame } from './ManagedGame';
import {
  containArtwork,
  demoMenuPortrait,
  demoGameplayLayout,
} from './demoStage';

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
        const cue = this.add.graphics();
        const label = this.add
          .text(0, 0, '', {
            fontFamily: "'Leelawadee UI', Tahoma, sans-serif",
            fontSize: '30px',
            color: '#f4f0e7',
          })
          .setOrigin(0, 0.5);
        unsubscribePresentation = bridge.subscribePresentation((view) => {
          const key = `demo.shop.${view.background}`;
          if (!this.textures.exists(key)) {
            parent.dataset.worldState = 'error';
            return;
          }
          background.setTexture(key);
          const source = this.textures.get(key).getSourceImage();
          const fitted = containArtwork(source.width, source.height);
          const x = view.layout === 'menu' ? demoMenuPortrait.x : fitted.x;
          this.cameras.main.setBackgroundColor(
            view.layout === 'menu' ? '#101d2d' : '#000000',
          );
          background
            .setPosition(x + fitted.width / 2, fitted.y + fitted.height / 2)
            .setScale(fitted.scale);
          const placement = demoGameplayLayout(view.viewportScale ?? 1).cue;
          const visible =
            view.layout !== 'menu' &&
            placement !== null &&
            view.characterLabel !== null;
          cue.clear().setVisible(visible);
          label.setVisible(visible);
          parent.dataset.worldCharacterCue = visible
            ? view.characterLabel!
            : '';
          if (visible && placement) {
            label
              .setText(view.characterLabel!)
              .setFontSize(placement.fontSize)
              .setPosition(
                placement.x + 20,
                placement.y + placement.height / 2,
              );
            cue
              .fillStyle(0x1c2b33, 0.94)
              .lineStyle(2, 0x86a5a8)
              .fillRoundedRect(
                placement.x,
                placement.y,
                label.width + 40,
                placement.height,
                8,
              )
              .strokeRoundedRect(
                placement.x,
                placement.y,
                label.width + 40,
                placement.height,
                8,
              );
          }
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
