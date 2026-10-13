import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { Story } from 'inkjs';
import {
  assertAssetPath,
  validateFixture,
  validateTags,
} from '../../scripts/narrative-validate.ts';
import { fixtureOutput } from '../../scripts/narrative-compile.ts';
import references from '../../narrative/fixtures/references.json';
import { fitViewport } from '../../src/shell/viewport';
import { GameBridge } from '../../src/world/GameBridge';
import { resolveAssetUrl } from '../../src/assets/manifest';

describe('M0 viewport and static assets', () => {
  it.each([
    [1920, 1080, 1],
    [1000, 1000, 1000 / 1920],
    [2400, 900, 900 / 1080],
    [844, 390, 390 / 1080],
  ])('fits %sx%s without stretching/cropping', (width, height, scale) => {
    const fitted = fitViewport(width, height);
    expect(fitted.scale).toBeCloseTo(scale);
    expect(fitted.width / fitted.height).toBeCloseTo(16 / 9);
    expect(fitted.width).toBeLessThanOrEqual(width + 1e-9);
    expect(fitted.height).toBeLessThanOrEqual(height + 1e-9);
  });
  it('resolves assets within a nested static root', () => {
    expect(resolveAssetUrl('m0.world.reference', './')).toBe(
      './assets/placeholders/world.svg',
    );
    expect(resolveAssetUrl('m0.world.reference', '/nested/game/')).toBe(
      '/nested/game/assets/placeholders/world.svg',
    );
    expect(() =>
      assertAssetPath('assets/placeholders/world.svg'),
    ).not.toThrow();
    for (const path of [
      '/assets/a',
      '../a',
      'assets/../a',
      'https://example.com/a',
      'assets/placeholders/World.svg',
    ]) {
      expect(() => assertAssetPath(path)).toThrow();
    }
  });
});

describe('technical compiler/runtime compatibility, not narrative engine', () => {
  it('validates compiled scene/tag/asset references', () =>
    expect(validateFixture()).toBe(2));
  it('round-trips the cursor with the locked runtime', () => {
    const json = readFileSync(fixtureOutput, 'utf8');
    const story = new Story(json);
    expect(JSON.parse(json).inkVersion).toBe(21);
    story.Continue();
    const saved = story.state.ToJson();
    const next = story.Continue();
    const restored = new Story(json);
    restored.state.LoadJson(saved);
    expect(restored.Continue()).toBe(next);
  });
  it.each([
    ['unknown:foo'],
    ['event:not-approved'],
    ['speaker:not-approved'],
    ['position:left'],
    ['expression:happy'],
    ['line:x', 'line:y'],
    [],
  ])('rejects invalid fixture output %j', (...tags) => {
    expect(() => validateTags(tags, 'ข้อความทดสอบ', references)).toThrow();
  });
});

describe('session bridge lifecycle', () => {
  it('delivers current pause, deduplicates intentions and removes listeners', () => {
    const bridge = new GameBridge();
    const listener = vi.fn();
    const unsubscribe = bridge.subscribePause(listener);
    bridge.setPaused(true);
    bridge.setPaused(true);
    expect(listener.mock.calls).toEqual([[false], [true]]);
    unsubscribe();
    bridge.setPaused(false);
    expect(listener).toHaveBeenCalledTimes(2);
    bridge.dispose();
    expect(() => bridge.subscribePause(listener)).toThrow('disposed');
  });
  it('cannot send a stale command after unmount', () => {
    const bridge = new GameBridge();
    const listener = vi.fn();
    bridge.subscribePause(listener);
    bridge.dispose();
    bridge.setPaused(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
