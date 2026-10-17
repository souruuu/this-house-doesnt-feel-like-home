import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  containArtwork,
  DEMO_ARTWORK,
  demoPortrait,
  demoMenuPortrait,
  demoGameplayLayout,
} from '../../src/world/demoStage';

describe('temporary shared demo stage', () => {
  it('places the complete menu artwork on the right without changing gameplay bounds', () => {
    expect(demoMenuPortrait.x).toBeGreaterThan(960);
    expect(demoMenuPortrait.x + demoMenuPortrait.width).toBeLessThanOrEqual(
      1920,
    );
    expect(demoMenuPortrait.height).toBe(demoPortrait.height);
    expect(demoMenuPortrait.width).toBe(demoPortrait.width);
    expect(demoPortrait.x + demoPortrait.width / 2).toBe(960);
  });
  it.each([
    [2480, 3508],
    [1920, 1080],
    [1080, 1920],
  ])('contains %sx%s without crop or stretch', (width, height) => {
    const rect = containArtwork(width, height);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(1920);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1080);
    expect(rect.width / rect.height).toBeCloseTo(width / height);
    expect(rect.x + rect.width / 2).toBe(960);
    expect(rect.y + rect.height / 2).toBe(540);
  });
  it.each(['morning', 'evening', 'night'])(
    'checks observed %s image dimensions against shared geometry',
    (time) => {
      const bytes = readFileSync(`public/assets/demo/shop-${time}.png`);
      expect(bytes.readUInt32BE(16)).toBe(DEMO_ARTWORK.width);
      expect(bytes.readUInt32BE(20)).toBe(DEMO_ARTWORK.height);
    },
  );
  it.each([1, 2 / 3, 390 / 1080])(
    'keeps UI and cue geometry inside the shared stage at scale %s',
    (scale) => {
      const layout = demoGameplayLayout(scale);
      expect(layout.dialogue.x).toBeGreaterThanOrEqual(0);
      expect(layout.dialogue.x + layout.dialogue.width).toBeLessThanOrEqual(
        1920,
      );
      expect(layout.dialogue.y + layout.dialogue.height).toBeLessThan(1080);
      expect(layout.choiceBottom).toBeLessThan(layout.dialogue.y);
      expect(layout.choiceTop).toBeLessThan(layout.choiceBottom);
      expect(layout.footerHeight * scale).toBeGreaterThanOrEqual(43.99);
      expect(layout.bodySize * scale).toBeGreaterThanOrEqual(16);
      if (layout.cue) {
        expect(layout.cue.x).toBeGreaterThan(demoPortrait.x);
        expect(layout.cue.y + layout.cue.height).toBeLessThan(
          layout.dialogue.y,
        );
      } else expect(layout.compact).toBe(true);
    },
  );
});
