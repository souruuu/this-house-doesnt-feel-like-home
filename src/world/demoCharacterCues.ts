import type { NarrativeView } from '../narrative/types';

export type DemoCharacterId = 'som' | 'manao' | 'nut' | 'kant';
export type DemoStagePosition = 'left' | 'right';
export interface DemoCharacterPlacement {
  readonly character: DemoCharacterId;
  readonly position: DemoStagePosition;
}

const lines = (prefix: string, ids: string[]) =>
  ids.map((id) => `demo.${prefix}-L${id}`);

// Presentation-only participation windows, audited against the unchanged approved
// handoff. These are not speaker rules, movement events or durable game facts.
export const demoCharacterCues = [
  {
    scene: 'SC-D1-01',
    character: 'manao',
    visibleLines: lines('D101', [
      '002',
      '003',
      '004',
      '005A',
      '005B',
      '006',
      '007',
      '008',
      '009',
    ]),
    entry: 'demo.D101-L002',
    exit: 'demo.D101-L010',
  },
  {
    scene: 'SC-D1-02',
    character: 'som',
    visibleLines: lines('D102', [
      '002',
      '003',
      '004',
      '005A',
      '005B',
      '006',
      '007',
      '008',
    ]),
    entry: 'demo.D102-L002',
    exit: 'demo.D102-L009',
  },
  {
    scene: 'SC-D1-03',
    character: 'nut',
    visibleLines: lines('D103', ['002', '003', '004', '005A', '006A', '005B']),
    entry: 'demo.D103-L002',
    exit: 'demo.D103-L007',
  },
  {
    scene: 'SC-D2-01',
    character: 'manao',
    visibleLines: lines('D201', [
      '001',
      '002',
      '003',
      '004',
      '005A',
      '005B',
      '006',
      '007',
      '008',
      '009',
    ]),
    entry: 'demo.D201-L001',
    exit: 'demo.D201-L010',
  },
  {
    scene: 'SC-D2-02',
    character: 'som',
    visibleLines: lines('D202', [
      '001',
      '002',
      '003',
      '004',
      '005A',
      '005B',
      '006A',
      '006B',
      '007P',
      '007A',
      '007N',
      '008',
      '009',
    ]),
    entry: 'demo.D202-L001',
    exit: 'demo.D202-L010',
  },
  {
    scene: 'SC-D2-03',
    character: 'nut',
    visibleLines: lines('D203', [
      '001',
      '002',
      '003T',
      '003F',
      '004',
      '005A',
      '005B',
      '006',
      '007',
    ]),
    entry: 'demo.D203-L001',
    exit: 'demo.D203-L008',
  },
  {
    scene: 'SC-D3-01',
    character: 'som',
    visibleLines: lines('D301', [
      '001',
      '002',
      '003',
      '004',
      '005',
      '006A',
      '006B',
      '007A',
      '007B',
      '008',
      '009',
      '010',
      '011',
    ]),
    entry: 'demo.D301-L001',
    exit: 'demo.D301-L012',
  },
  {
    scene: 'SC-D3-02',
    character: 'nut',
    visibleLines: lines('D302', [
      '001',
      '002',
      '003',
      '004',
      '005A',
      '005B',
      '006A',
      '006B',
      '007',
      '008',
      '009',
    ]),
    entry: 'demo.D302-L001',
    exit: 'demo.D302-L010',
  },
  {
    scene: 'SC-D3-03',
    character: 'kant',
    visibleLines: lines('D303', [
      '001',
      '002',
      '003',
      '004',
      '005A',
      '005B',
      '006A',
      '006B',
      '007A',
      '007B',
      '008',
      '009',
      '010A',
      '010B',
      '011A',
      '011B',
    ]),
    entry: 'demo.D303-L001',
    exit: 'demo.D303-L012',
  },
] as const;

export function resolveDemoCharacters(
  view: Pick<NarrativeView, 'phase' | 'presentation' | 'line'> | null,
): readonly DemoCharacterPlacement[] {
  if (!view?.line || !['line', 'choice'].includes(view.phase)) return [];
  const cue = demoCharacterCues.find(
    (item) =>
      item.scene === view.presentation.sceneId &&
      item.visibleLines.includes(view.line!.id),
  );
  return cue ? [{ character: cue.character, position: 'left' }] : [];
}
