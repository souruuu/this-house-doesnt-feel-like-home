import type Phaser from 'phaser';
import type { DemoWorldView } from './GameBridge';
import type { DemoCharacterId, DemoStagePosition } from './demoCharacterCues';
import { demoCharacterLayout } from './demoStage';

type Phase = 'stable' | 'entering' | 'exiting' | 'gap';
interface Slot {
  readonly position: DemoStagePosition;
  readonly image: Phaser.GameObjects.Image;
  character: DemoCharacterId | null;
  phase: Phase;
}

// Disposable Phaser view. It neither reads Story/store nor emits narrative input.
export class DemoCharacterStage {
  private readonly slots: Slot[];
  private timers: Phaser.Time.TimerEvent[] = [];
  private generation = 0;
  private paused = false;
  private disposed = false;
  private key = '';
  private latest: DemoWorldView | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly parent: HTMLElement,
  ) {
    this.slots = (['left', 'right'] as const).map((position) => ({
      position,
      image: scene.add
        .image(0, 0, 'demo.character.som')
        .setOrigin(0, 1)
        .setDepth(10)
        .setVisible(false),
      character: null,
      phase: 'stable',
    }));
  }

  private cancel() {
    this.generation++;
    for (const timer of this.timers) timer.remove(false);
    this.timers = [];
    for (const slot of this.slots) this.scene.tweens.killTweensOf(slot.image);
  }

  private target(position: DemoStagePosition) {
    return this.latest?.layout === 'gameplay'
      ? (this.latest.characterStage?.characters.find(
          (item) => item.position === position,
        )?.character ?? null)
      : null;
  }

  private place(slot: Slot, character: DemoCharacterId) {
    const layout = demoCharacterLayout(this.latest?.viewportScale ?? 1);
    const image = slot.image.setTexture(`demo.character.${character}`);
    image.setScale(layout.height / image.height);
    image.setPosition(
      slot.position === 'left'
        ? layout.left
        : layout.right - image.displayWidth,
      layout.bottom,
    );
    slot.character = character;
  }

  private settle() {
    for (const slot of this.slots) {
      const target = this.target(slot.position);
      if (target) this.place(slot, target);
      slot.character = target;
      slot.phase = 'stable';
      slot.image.setAlpha(1).setVisible(target !== null);
    }
    this.publish();
  }

  present(view: DemoWorldView) {
    if (this.disposed) return;
    this.latest = view;
    const key = JSON.stringify([
      view.layout,
      view.characterStage,
      view.reducedMotion,
      view.viewportScale,
    ]);
    if (key === this.key) return;
    this.key = key;
    this.cancel();
    if (this.paused || view.reducedMotion || view.layout !== 'gameplay') {
      this.settle();
      return;
    }
    const generation = this.generation;
    const current = () => !this.disposed && generation === this.generation;
    for (const slot of this.slots) {
      const target = this.target(slot.position);
      if (slot.character === target) {
        if (target) this.place(slot, target);
        slot.image.setAlpha(1).setVisible(target !== null);
        slot.phase = 'stable';
        continue;
      }
      const enter = () => {
        if (!current()) return;
        if (!target) {
          slot.character = null;
          slot.phase = 'stable';
          slot.image.setVisible(false);
          this.publish();
          return;
        }
        this.place(slot, target);
        const x = slot.image.x;
        slot.phase = 'entering';
        slot.image
          .setPosition(x - 18, slot.image.y)
          .setAlpha(0)
          .setVisible(true);
        this.scene.tweens.add({
          targets: slot.image,
          x,
          alpha: 1,
          duration: 260,
          ease: 'Sine.Out',
          onComplete: () => {
            if (!current()) return;
            slot.phase = 'stable';
            this.publish();
          },
        });
        this.publish();
      };
      if (slot.image.visible && slot.character !== null) {
        slot.phase = 'exiting';
        this.scene.tweens.add({
          targets: slot.image,
          alpha: 0,
          duration: 220,
          ease: 'Sine.In',
          onComplete: () => {
            if (!current()) return;
            slot.character = null;
            slot.image.setVisible(false);
            if (target) {
              slot.phase = 'gap';
              this.timers.push(this.scene.time.delayedCall(80, enter));
            } else slot.phase = 'stable';
            this.publish();
          },
        });
      } else enter();
    }
    this.publish();
  }

  setPaused(paused: boolean) {
    if (this.disposed || this.paused === paused) return;
    this.paused = paused;
    this.cancel();
    // Cancel presentation work, then keep one coherent latest static stage.
    // Resuming never replays an old enter/exit callback or starts a timer.
    this.settle();
  }

  private publish() {
    if (this.disposed) return;
    // Private renderer QA metadata under WorldHost's aria-hidden subtree. No
    // character names, tooltip, live announcement or player-visible debug UI.
    this.parent.dataset.worldCharacterStage = JSON.stringify({
      generation: this.generation,
      context: this.latest?.characterStage?.contextKey ?? '',
      paused: this.paused,
      slots: this.slots.map((slot) => {
        const bounds = slot.image.getBounds();
        return {
          position: slot.position,
          character: slot.character,
          visible: slot.image.visible,
          phase: slot.phase,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      }),
    });
  }

  dispose() {
    if (this.disposed) return;
    this.cancel();
    this.disposed = true;
    for (const slot of this.slots) slot.image.destroy();
    delete this.parent.dataset.worldCharacterStage;
  }
}
