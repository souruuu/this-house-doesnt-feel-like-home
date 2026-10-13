export const LOGICAL_WIDTH = 1920;
export const LOGICAL_HEIGHT = 1080;

export function fitViewport(width: number, height: number) {
  const scale = Math.max(
    0,
    Math.min(width / LOGICAL_WIDTH, height / LOGICAL_HEIGHT),
  );
  return {
    scale,
    width: LOGICAL_WIDTH * scale,
    height: LOGICAL_HEIGHT * scale,
  };
}
