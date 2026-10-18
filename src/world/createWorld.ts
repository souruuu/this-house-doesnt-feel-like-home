import Phaser from 'phaser';
import { resolveAssetUrl } from '../assets/manifest';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../shell/viewport';
import type { GameBridge } from './GameBridge';
import { ManagedGame } from './ManagedGame';
import { DemoCharacterStage } from './DemoCharacterStage';
import {
  DEMO_OCCLUSION,
  DEMO_STAGE_ART,
  DEMO_TABLE_POLYGON,
  demoStageArt,
  type DemoStageTime,
} from './demoStage';

export function createWorld(
  parent: HTMLDivElement,
  bridge: GameBridge,
  demo = false,
) {
  let unsubscribePresentation = () => {};
  let characterStage: DemoCharacterStage | undefined;
  let worldPaused = false;
  class PlaceholderScene extends Phaser.Scene {
    constructor() {
      super('m0-placeholder');
    }

    preload() {
      if (demo) {
        const base = import.meta.env.BASE_URL;
        for (const art of new Set(
          Object.values(demoStageArt).map((item) => item.texture),
        ))
          this.load.image(
            art,
            base +
              Object.values(demoStageArt).find((item) => item.texture === art)!
                .path,
          );
        for (const character of ['som', 'manao', 'nut', 'kant'] as const)
          this.load.image(
            `demo.character.${character}`,
            resolveAssetUrl(`demo.character.${character}`),
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

    // Counter occlusion without new art: the untouched stage image is drawn
    // again, clipped to the table polygon, above the character layer. The
    // time-of-day tint is baked in so the table matches the tinted background.
    private foreground(time: DemoStageTime) {
      const { texture, tint } = demoStageArt[time];
      const key = `${texture}.table-mask.${time}`;
      if (this.textures.exists(key)) return key;
      const source = this.textures.get(texture).getSourceImage() as
        HTMLImageElement | HTMLCanvasElement;
      const canvas = this.textures.createCanvas(
        key,
        DEMO_STAGE_ART.width,
        DEMO_STAGE_ART.height,
      )!;
      const context = canvas.getContext();
      context.beginPath();
      DEMO_TABLE_POLYGON.forEach(([x, y], index) =>
        index ? context.lineTo(x, y) : context.moveTo(x, y),
      );
      context.closePath();
      context.clip();
      context.drawImage(
        source,
        0,
        0,
        DEMO_STAGE_ART.width,
        DEMO_STAGE_ART.height,
      );
      if (tint) {
        context.globalCompositeOperation = tint.blend;
        context.fillStyle = `rgb(${tint.color >> 16} ${(tint.color >> 8) & 255} ${tint.color & 255} / ${tint.alpha})`;
        context.fillRect(0, 0, DEMO_STAGE_ART.width, DEMO_STAGE_ART.height);
      }
      canvas.refresh();
      return key;
    }

    create() {
      if (demo) {
        this.cameras.main.setBackgroundColor('#000000');
        const background = this.add
          .image(960, 540, demoStageArt.morning.texture)
          .setDisplaySize(DEMO_STAGE_ART.width, DEMO_STAGE_ART.height);
        characterStage = new DemoCharacterStage(this, parent);
        characterStage.setPaused(worldPaused);
        const table = this.add
          .image(960, 540, this.foreground('morning'))
          .setDepth(15);
        // Evening/night tint on the background only: below the characters
        // (depth 10); the table foreground carries the same tint.
        const tint = this.add
          .rectangle(960, 540, DEMO_STAGE_ART.width, DEMO_STAGE_ART.height)
          .setDepth(1)
          .setBlendMode(Phaser.BlendModes.MULTIPLY)
          .setVisible(false);
        // No speaker chip on the stage (D-5): names live only on the dialogue.
        parent.dataset.worldCharacterCue = '';
        unsubscribePresentation = bridge.subscribePresentation((view) => {
          const art = demoStageArt[view.background];
          if (!this.textures.exists(art.texture)) {
            parent.dataset.worldState = 'error';
            return;
          }
          background.setTexture(art.texture);
          table
            .setTexture(this.foreground(view.background))
            .setVisible(
              DEMO_OCCLUSION === 'mask' && view.layout === 'gameplay',
            );
          if (art.tint)
            tint.setFillStyle(art.tint.color, art.tint.alpha).setVisible(true);
          else tint.setVisible(false);
          characterStage?.present(view);
          parent.dataset.worldStage = JSON.stringify({
            time: view.background,
            texture: art.texture,
            tint: art.tint
              ? { color: art.tint.color, alpha: art.tint.alpha }
              : null,
            occlusion: DEMO_OCCLUSION,
          });
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
    worldPaused = paused;
    characterStage?.setPaused(paused);
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
    characterStage?.dispose();
    game.destroy(true);
    // destroy() is deferred to a frame, including when the page was hidden.
    if (game.isRunning && !game.loop.running) game.loop.wake();
  };
}
