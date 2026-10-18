import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  containArtwork,
  DEMO_OCCLUSION,
  DEMO_STAGE_ART,
  DEMO_TABLE_POLYGON,
  demoCharacterLayout,
  demoGameplayLayout,
  demoStageArt,
} from '../../src/world/demoStage';

// UI Phase 2 (Owner D-1, 2026-10-18): one 16:9 counter composition.
describe('16:9 demo stage', () => {
  it('ships the artist counter_day.png byte-for-byte at 1920x1080', () => {
    const bytes = readFileSync('public/assets/demo/stage/counter-day.png');
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      'f0a7d91e3baf0669786fc72dec888dbdf5525c990a866ca4d219e19c7f2aa252',
    );
    expect(bytes.readUInt32BE(16)).toBe(DEMO_STAGE_ART.width);
    expect(bytes.readUInt32BE(20)).toBe(DEMO_STAGE_ART.height);
    // Full-bleed: no side bars at 16:9.
    expect(containArtwork(DEMO_STAGE_ART.width, DEMO_STAGE_ART.height)).toEqual(
      { x: 0, y: 0, width: 1920, height: 1080, scale: 1 },
    );
  });
  it('maps every time of day to existing art; evening/night use the artist overlay values', () => {
    for (const time of ['morning', 'evening', 'night'] as const)
      expect(demoStageArt[time].path).toBe('assets/demo/stage/counter-day.png');
    expect(demoStageArt.morning.tint).toBeNull();
    expect(demoStageArt.evening.tint).toEqual({
      color: 0xffb28d, // RGB(255,178,141)
      alpha: 145 / 255,
      blend: 'multiply',
    });
    expect(demoStageArt.night.tint).toEqual({
      color: 0x4256a9, // RGB(66,86,169)
      alpha: 124 / 255,
      blend: 'multiply',
    });
  });
  it('keeps the table polygon inside the stage and below the measured back edge', () => {
    expect(DEMO_OCCLUSION).toBe('mask');
    for (const [x, y] of DEMO_TABLE_POLYGON) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1920);
      expect(y).toBeGreaterThanOrEqual(630); // highest traced item: bunny ear
      expect(y).toBeLessThanOrEqual(1080);
    }
  });
  it.each([
    [2480, 3508],
    [1920, 1080],
    [1080, 1920],
  ])('contains %sx%s without crop or stretch', (width, height) => {
    const rect = containArtwork(width, height);
    expect(rect.x + rect.width).toBeLessThanOrEqual(1920);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1080);
    expect(rect.width / rect.height).toBeCloseTo(width / height);
  });
  it('anchors characters to the artwork, behind the table edge, outside the choice column', () => {
    const { height, baseline, center } = demoCharacterLayout;
    expect(height / 1080).toBeCloseTo(0.435, 2);
    expect(baseline).toBeGreaterThan(665); // feet hidden behind the table
    expect(baseline - height).toBeGreaterThan(200); // head below the HUD
    for (const scale of [1, 2 / 3, 390 / 1080]) {
      const layout = demoGameplayLayout(scale);
      // The box may overlap only the part hidden behind the table (y > 665).
      expect(layout.dialogue.y).toBeGreaterThan(665);
      if (!layout.compact) expect(baseline).toBeLessThan(layout.dialogue.y);
      // Widest cutout (som 541x580) at the left slot stays left of choices.
      expect(center.left + (height * 541) / 580 / 2).toBeLessThan(
        layout.choice.x,
      );
    }
    expect(center.left).toBeGreaterThan(420);
    expect(center.right).toBeLessThan(1500);
  });
  it.each([1, 390 / 1080, 360 / 1080])(
    'keeps dialogue/choice geometry inside the stage at UI scale %s',
    (scale) => {
      const layout = demoGameplayLayout(scale);
      for (const box of [layout.dialogue, layout.choiceDialogue]) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(1920);
        expect(box.y + box.height).toBeLessThanOrEqual(1080);
      }
      expect(layout.choice.x + layout.choice.width).toBeLessThanOrEqual(1920);
      expect(layout.choice.bottom).toBeLessThan(layout.choiceDialogue.y);
      expect(layout.choice.top).toBeLessThan(layout.choice.bottom);
      if (layout.compact) {
        // Touch compact: real 44 css px targets and >= 16 css px text.
        expect(layout.footerHeight * scale).toBeGreaterThanOrEqual(43.99);
        expect(layout.bodySize * scale).toBeGreaterThanOrEqual(16);
      } else {
        // Mouse 1920 design (mock 3): box x 210–1710, y≈836–1048.
        expect(layout.dialogue).toEqual({
          x: 210,
          y: 836,
          width: 1500,
          height: 212,
        });
        expect(layout.choice).toEqual({
          x: 1010,
          width: 700,
          top: 400,
          bottom: 720,
        });
        expect(layout.bodySize).toBe(38);
      }
    },
  );
});
