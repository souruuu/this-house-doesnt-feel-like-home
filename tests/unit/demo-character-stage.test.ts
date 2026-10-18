import { describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type Phaser from 'phaser';
import { createDemoSession } from '../../src/narrative/demoSession';
import type { NarrativeView } from '../../src/narrative/types';
import {
  demoCharacterCues,
  resolveDemoCharacters,
} from '../../src/world/demoCharacterCues';
import { DemoCharacterStage } from '../../src/world/DemoCharacterStage';
import {
  demoCharacterLayout,
  demoGameplayLayout,
} from '../../src/world/demoStage';
import type { DemoWorldView } from '../../src/world/GameBridge';
import provenance from '../../src/assets/demo-character-provenance.json';
import references from '../../narrative/production/references.json';

function play(decisions: Record<string, string | undefined>) {
  const session = createDemoSession();
  session.controller.start();
  const views: NarrativeView[] = [];
  for (let i = 0; i < 300; i++) {
    const view = session.controller.getSnapshot();
    views.push(view);
    const state = session.store.getState();
    for (let copy = 0; copy < 5; copy++) resolveDemoCharacters(view);
    expect(session.store.getState()).toBe(state);
    if (view.phase === 'ended') {
      session.controller.dispose();
      return views;
    }
    if (view.phase === 'line') session.controller.continue(view);
    else if (view.phase === 'choice') {
      const group = view.choices[0].id.slice(0, -2);
      const choice = view.choices.find((item) =>
        item.id.endsWith(`-${decisions[group] ?? 'A'}`),
      )!;
      session.controller.choose(view, choice.index);
    } else throw new Error(view.error ?? view.phase);
  }
  throw new Error('Story did not end');
}

describe('approved character participation, not speaker inference', () => {
  it('uses only existing scene/line IDs with explicit entry/exit evidence', () => {
    for (const cue of demoCharacterCues) {
      for (const id of [...cue.visibleLines, cue.entry, cue.exit])
        expect(references.lines[id as keyof typeof references.lines]).toBe(
          cue.scene,
        );
      expect(cue.visibleLines).toContain(cue.entry);
      expect(cue.visibleLines).not.toContain(cue.exit);
    }
  });
  it.each([
    { 'demo.D202-C01': 'A', 'demo.D303-C02': 'A' },
    {
      'demo.D103-C01': 'B',
      'demo.D202-C01': 'B',
      'demo.D202-C02': 'A',
      'demo.D303-C02': 'B',
    },
    { 'demo.D202-C01': 'B', 'demo.D202-C02': 'B' },
  ])(
    'preserves canonical choice branches, narrator presence and domain state: %j',
    (decisions) => {
      const views = play(decisions);
      const line = (id: string) =>
        views.find((v) => v.phase === 'line' && v.line?.id === `demo.${id}`)!;
      expect(line('D101-L004').presentation.speaker).toBe('none');
      expect(resolveDemoCharacters(line('D101-L004'))).toEqual([
        { character: 'manao', position: 'left' },
      ]);
      const choice = views.find((v) =>
        v.choices.some((c) => c.id === 'demo.D101-C01-A'),
      )!;
      expect(resolveDemoCharacters(choice)).toEqual(
        resolveDemoCharacters(line('D101-L004')),
      );
      expect(resolveDemoCharacters(line('D101-L001'))).toEqual([]);
      expect(resolveDemoCharacters(line('D101-L010'))).toEqual([]);
      for (const id of ['D103-L008', 'D103-L009', 'D103-L011'])
        expect(resolveDemoCharacters(line(id))).toEqual([]);
      expect(resolveDemoCharacters(line('D303-L001'))).toEqual([
        { character: 'kant', position: 'left' },
      ]);
      expect(resolveDemoCharacters(line('D303-L012'))).toEqual([]);
      expect(
        new Set(
          views.flatMap((v) =>
            resolveDemoCharacters(v).map((c) => c.character),
          ),
        ),
      ).toEqual(new Set(['manao', 'som', 'nut', 'kant']));
      expect(views.every((v) => resolveDemoCharacters(v).length <= 1)).toBe(
        true,
      );
      expect(
        views
          .filter(
            (v) =>
              v.phase === 'line' &&
              v.line?.id.startsWith('demo.D303-') &&
              ![
                'demo.D303-L010A',
                'demo.D303-L011A',
                'demo.D303-L012',
                'demo.D303-L013',
                'demo.D303-L014',
                'demo.D303-L015',
              ].includes(v.line.id),
          )
          .every(
            (v) =>
              !v.line!.text.includes('กันต์') &&
              v.presentation.speaker !== 'kan',
          ),
      ).toBe(true);
      const sample = line('D101-L003');
      expect(resolveDemoCharacters({ ...sample, phase: 'error' })).toEqual([]);
      expect(
        resolveDemoCharacters({
          ...sample,
          presentation: { ...sample.presentation, sceneId: 'UNKNOWN' },
        }),
      ).toEqual([]);
      expect(
        resolveDemoCharacters({
          ...sample,
          line: { ...sample.line!, id: 'demo.UNKNOWN' },
        }),
      ).toEqual([]);
    },
  );
  it.each([1, 2 / 3, 390 / 1080])(
    'anchors the sprite to the artwork, independent of viewport scale %s',
    (scale) => {
      const stage = demoCharacterLayout;
      const gameplay = demoGameplayLayout(scale);
      expect(gameplay.dialogue.y).toBeGreaterThan(665); // table back edge
      if (!gameplay.compact)
        expect(stage.baseline).toBeLessThan(gameplay.dialogue.y);
      expect(stage.baseline - stage.height).toBeGreaterThan(100);
      expect(stage.center.left + stage.height / 2).toBeLessThan(
        gameplay.choice.x,
      );
      expect(stage.height / 1080).toBeGreaterThanOrEqual(0.4);
      expect(stage.height / 1080).toBeLessThanOrEqual(0.47);
    },
  );
  it('ships four original RGBA PNGs byte-for-byte and no unverified stage layers', () => {
    expect(provenance.entries).toHaveLength(19);
    const admitted = provenance.entries.filter((r) => r.runtimePath !== null);
    expect(admitted).toHaveLength(4);
    for (const asset of admitted) {
      const bytes = readFileSync(asset.runtimePath!);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(
        asset.sha256,
      );
      expect(bytes.readUInt32BE(16)).toBe(asset.dimensions[0]);
      expect(bytes.readUInt32BE(20)).toBe(asset.dimensions[1]);
      expect(bytes[25]).toBe(6); // PNG IHDR truecolor + alpha, not palette P.
    }
    expect(
      provenance.entries.filter((r) => r.runtimePath === null),
    ).toHaveLength(15);
  });
});

// Focused callback-boundary test of our own disposable view. Real Phaser
// rendering/tween behavior is covered separately by production-browser tests.
function renderer() {
  class Image {
    x = 0;
    y = 0;
    width = 500;
    height = 600;
    scale = 1;
    alpha = 1;
    visible = false;
    destroyed = false;
    get displayWidth() {
      return this.width * this.scale;
    }
    setOrigin() {
      return this;
    }
    setDepth() {
      return this;
    }
    setTexture() {
      if (this.destroyed) throw Error('Stale image mutation');
      return this;
    }
    setVisible(v: boolean) {
      this.visible = v;
      return this;
    }
    setAlpha(v: number) {
      this.alpha = v;
      return this;
    }
    setScale(v: number) {
      this.scale = v;
      return this;
    }
    setPosition(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    }
    getBounds() {
      return {
        x: this.x,
        y: this.y - this.height * this.scale,
        width: this.displayWidth,
        height: this.height * this.scale,
      };
    }
    destroy() {
      this.destroyed = true;
    }
  }
  const images: Image[] = [];
  const tweens: { onComplete: () => void }[] = [];
  const timers: { callback: () => void; remove: ReturnType<typeof vi.fn> }[] =
    [];
  const scene = {
    add: {
      image: () => {
        const image = new Image();
        images.push(image);
        return image;
      },
    },
    tweens: {
      add: (config: { onComplete: () => void }) => {
        tweens.push(config);
      },
      killTweensOf: vi.fn(),
    },
    time: {
      delayedCall: (_delay: number, callback: () => void) => {
        const timer = { callback, remove: vi.fn() };
        timers.push(timer);
        return timer;
      },
    },
  };
  const parent = { dataset: {} } as HTMLElement;
  const stage = new DemoCharacterStage(
    scene as unknown as Phaser.Scene,
    parent,
  );
  const snapshot = () => JSON.parse(parent.dataset.worldCharacterStage!);
  const present = (
    character: 'som' | 'manao' | 'nut',
    context = character,
  ): DemoWorldView => ({
    layout: 'gameplay',
    background: 'morning',
    characterLabel: null,
    characterStage: {
      contextKey: context,
      characters: [{ character, position: 'left' }],
    },
  });
  return { stage, images, tweens, timers, scene, parent, snapshot, present };
}
describe('character view cancellation boundaries', () => {
  it('rejects stale exit/gap/enter callbacks after replacement and dispose', () => {
    const r = renderer();
    r.stage.present(r.present('manao'));
    const oldEnter = r.tweens[0].onComplete;
    r.stage.present(r.present('som'));
    oldEnter();
    expect(r.snapshot().slots[0].phase).toBe('exiting');
    r.tweens[1].onComplete();
    expect(r.snapshot().slots[0].phase).toBe('gap');
    r.stage.present(r.present('nut'));
    r.timers[0].callback(); // Simulate an already-queued stale callback, despite removal.
    expect(r.timers[0].remove).toHaveBeenCalledWith(false);
    expect(r.snapshot().slots[0].character).toBe('nut');
    const afterDispose = r.tweens.at(-1)!.onComplete;
    r.stage.dispose();
    r.stage.dispose();
    afterDispose();
    expect(r.parent.dataset.worldCharacterStage).toBeUndefined();
    expect(r.images.every((image) => image.destroyed)).toBe(true);
  });
  it('settles on pause, never replays on resume and does not restart duplicate projections', () => {
    const r = renderer(),
      view = r.present('manao');
    r.stage.present(view);
    r.stage.present({ ...view });
    expect(r.tweens).toHaveLength(1);
    r.stage.setPaused(true);
    r.tweens[0].onComplete();
    expect(r.snapshot().slots[0]).toMatchObject({
      character: 'manao',
      phase: 'stable',
      visible: true,
    });
    r.stage.setPaused(false);
    expect(r.tweens).toHaveLength(1);
    r.stage.present({ ...r.present('nut'), reducedMotion: true });
    expect(r.snapshot().slots[0]).toMatchObject({
      character: 'nut',
      phase: 'stable',
    });
    expect(r.tweens).toHaveLength(1);
    r.stage.present({ ...view, layout: 'menu' });
    expect(
      r.snapshot().slots.every((slot: { visible: boolean }) => !slot.visible),
    ).toBe(true);
    r.stage.dispose();
  });
});
