import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../shell/viewport';

// Observed dimensions of the three approved composites; temporary demo layout, not U-01/U-02.
export const DEMO_ARTWORK = { width: 2480, height: 3508 };

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

export const demoPortrait = containArtwork(
  DEMO_ARTWORK.width,
  DEMO_ARTWORK.height,
);
// Menu composition only; gameplay retains its centered portrait.
export const demoMenuPortrait = { ...demoPortrait, x: 1030 };
// Experimental Blueprint anchors shared by React and Phaser; never Ink/state coordinates.
export function demoGameplayLayout(viewportScale: number) {
  const scale = Math.max(0.2, viewportScale);
  const compact = scale < 0.6;
  const dialogue = {
    x: compact ? 24 : 318,
    y: 1080 - (compact ? 14 : 28) - (compact ? 346 : 235),
    width: compact ? 1872 : 1284,
    height: compact ? 346 : 235,
  };
  return {
    compact,
    dialogue,
    bodySize: compact ? Math.max(46, 16 / scale) : 34,
    speakerSize: compact ? Math.max(40, 14 / scale) : 30,
    footerHeight: Math.max(64, 44 / scale),
    choiceTop: compact ? 245 : 345,
    choiceBottom: dialogue.y - 44,
    cue: compact
      ? null
      : {
          x: demoPortrait.x + 24,
          y: dialogue.y - 72,
          height: 52,
          fontSize: 30,
        },
  };
}
