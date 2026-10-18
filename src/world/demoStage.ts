import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../shell/viewport';

// UI Phase 2 (Owner D-1, 2026-10-18): one 16:9 counter composition fills the
// 1920x1080 logical stage. All coordinates are tentative presentation
// candidates (U-01/U-03 stay open), never Ink/state data.
export const DEMO_STAGE_ART = { width: 1920, height: 1080 };

export type DemoStageTime = 'morning' | 'evening' | 'night';

export interface DemoStageTint {
  readonly color: number;
  readonly alpha: number;
  readonly blend: 'multiply';
}

// Stage manifest by time of day (Owner 2026-10-18: no further art; the tint
// on counter_day is the production method). Values start from the artist's
// flat overlay layers (เคลือบสีตอนเย็น/กลางคืน.PNG) and stay adjustable here.
// Multiply measured closer to the artist's evening/night composites than
// normal (RMSE 44.3 vs 61.8 evening, 16.6 vs 34.4 night). The tint covers
// the background and table only, never the characters.
export const demoStageArt: Record<
  DemoStageTime,
  {
    readonly texture: string;
    readonly path: string;
    readonly tint: DemoStageTint | null;
  }
> = {
  morning: {
    texture: 'demo.stage.counter.day',
    path: 'assets/demo/stage/counter-day.png',
    tint: null,
  },
  evening: {
    texture: 'demo.stage.counter.day',
    path: 'assets/demo/stage/counter-day.png',
    tint: { color: 0xffb28d, alpha: 145 / 255, blend: 'multiply' },
  },
  night: {
    texture: 'demo.stage.counter.day',
    path: 'assets/demo/stage/counter-day.png',
    tint: { color: 0x4256a9, alpha: 124 / 255, blend: 'multiply' },
  },
};

export type DemoOcclusion = 'mask' | 'none';
// Production occlusion: the untouched counter art is drawn again inside this
// polygon above the characters (geometry only, no repaint). 'none' remains a
// switch for review. Measured on counter_day.png: table back edge y≈665
// (x 485–1497), front lip y≈1042 (x≈283 / ≈1682). Items rising above the edge
// inside the left slot are traced as bumps (red/green bottle, bunny pop).
export const DEMO_OCCLUSION: DemoOcclusion = 'mask';
export const DEMO_TABLE_POLYGON: readonly (readonly [number, number])[] = [
  [485, 665],
  [661, 665],
  [662, 656],
  [678, 656],
  [679, 665],
  [690, 665],
  [693, 652],
  [708, 651],
  [711, 665],
  [852, 665],
  [855, 657],
  [862, 652],
  [862, 635],
  [867, 632],
  [872, 641],
  [876, 649],
  [882, 640],
  [891, 636],
  [897, 642],
  [890, 656],
  [889, 665],
  [1497, 665],
  [1682, 1042],
  [1686, 1080],
  [280, 1080],
  [283, 1042],
];

export function containArtwork(width: number, height: number) {
  const scale = Math.min(LOGICAL_WIDTH / width, LOGICAL_HEIGHT / height);
  const fittedWidth = width * scale;
  const fittedHeight = height * scale;
  return {
    x: (LOGICAL_WIDTH - fittedWidth) / 2,
    y: (LOGICAL_HEIGHT - fittedHeight) / 2,
    width: fittedWidth,
    height: fittedHeight,
    scale,
  };
}

// Characters are anchored to the artwork (window x≈420–1500, table edge
// y≈668), not to the dialogue box, so every viewport shows the same baseline.
export const demoCharacterLayout = {
  height: 470,
  baseline: 800,
  center: { left: 700, right: 1220 },
} as const;

// Shared React/Phaser UI anchors. `viewportScale` is the UI scale: 1 for
// mouse windows (uniform scaling), the real stage scale on touch compact.
export function demoGameplayLayout(viewportScale: number) {
  const scale = Math.max(0.2, viewportScale);
  const compact = scale < 0.6;
  const target = 44 / scale; // one real 44 css px touch target in logical px
  const dialogue = compact
    ? { x: 40, y: 760, width: 1840, height: 300 }
    : { x: 210, y: 836, width: 1500, height: 212 };
  const choiceDialogue = compact
    ? { x: 40, y: 900, width: 1840, height: 160 }
    : { x: 210, y: 900, width: 1500, height: 130 };
  return {
    compact,
    dialogue,
    choiceDialogue,
    bodySize: compact ? Math.max(52, 16 / scale) : 38,
    speakerSize: compact ? Math.max(44, 14 / scale) : 32,
    footerHeight: compact ? Math.max(64, target) : 48,
    choice: compact
      ? { x: 980, width: 900, top: 240, bottom: 860 }
      : { x: 1010, width: 700, top: 400, bottom: 720 },
  };
}

// Review bounds used by tests/docs: the shop window in counter_day.png and
// the left paper zone of the menu/panels (UI Phase 1).
export const DEMO_WINDOW = { x: 420, width: 1080 } as const;
export const DEMO_MENU_PAPER_ZONE = 900;
