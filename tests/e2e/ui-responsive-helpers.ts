import type { Page } from '@playwright/test';

// Shared by ui-responsive-*.spec.ts (Owner responsive rule, 2026-10-18).
export const mouseSizes = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [1280, 720],
  [1024, 768],
  [800, 600],
  [565, 434],
] as const;
export const touchSizes = [
  [844, 390],
  [740, 360],
  [667, 375],
] as const;

type Report = { overlaps: string[]; outside: string[]; overflow: string[] };

// Visible leaf controls/text, clipped by their scroll containers, must not
// intersect, must stay inside the stage and must not overflow horizontally.
export async function inspectLayout(page: Page, allow: string[] = []) {
  return page.evaluate((allowList): Report => {
    const stage = document
      .querySelector('.logical-stage')!
      .getBoundingClientRect();
    const items = [
      ...document.querySelectorAll<HTMLElement>(
        '.demo-overlay button, .demo-overlay h1, .demo-overlay h2, .demo-overlay h3, .demo-overlay p, .demo-overlay label, .demo-overlay .demo-speaker-header',
      ),
    ].filter(
      (el) =>
        !el.closest('.demo-sr-only, [aria-hidden="true"]') &&
        !el.parentElement?.closest('button, label') &&
        el.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
    );
    const clip = (el: HTMLElement) => {
      let r = el.getBoundingClientRect();
      let box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
      for (let p = el.parentElement; p; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
        r = p.getBoundingClientRect();
        box = {
          l: Math.max(box.l, r.left),
          t: Math.max(box.t, r.top),
          r: Math.min(box.r, r.right),
          b: Math.min(box.b, r.bottom),
        };
      }
      return box;
    };
    const name = (el: HTMLElement) =>
      `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}「${(el.textContent ?? '').trim().slice(0, 24)}」`;
    const boxes = items
      .map((el) => ({ el, box: clip(el), id: name(el) }))
      .filter(({ box }) => box.r - box.l > 1 && box.b - box.t > 1);
    const report: Report = { overlaps: [], outside: [], overflow: [] };
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i];
      if (
        a.box.l < stage.left - 1 ||
        a.box.t < stage.top - 1 ||
        a.box.r > stage.right + 1 ||
        a.box.b > stage.bottom + 1
      )
        report.outside.push(a.id);
      if (a.el.scrollWidth > a.el.clientWidth + 1 && a.el.clientWidth > 0)
        report.overflow.push(a.id);
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const w = Math.min(a.box.r, b.box.r) - Math.max(a.box.l, b.box.l);
        const h = Math.min(a.box.b, b.box.b) - Math.max(a.box.t, b.box.t);
        const pair = `${a.id} × ${b.id}`;
        if (w > 1 && h > 1 && !allowList.some((rule) => pair.includes(rule)))
          report.overlaps.push(pair);
      }
    }
    if (document.documentElement.scrollWidth > window.innerWidth + 1)
      report.overflow.push('page horizontal scroll');
    return report;
  }, allow);
}

export async function logicalRects(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((els) => {
    const stage = document
      .querySelector('.logical-stage')!
      .getBoundingClientRect();
    const k = stage.width / 1920;
    return els.map((el) => {
      const r = el.getBoundingClientRect();
      return [
        (r.left - stage.left) / k,
        (r.top - stage.top) / k,
        r.width / k,
        r.height / k,
      ];
    });
  });
}
