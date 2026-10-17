import { EventRegistry, type EventDefinition } from './EventRegistry.ts';

// Content evidence from the approved packages; no relationship or permission deltas.
export const demoFactDefinitions = [
  ['manao_name', 'D101-L007', 'SC-D1-01', 'manao', 'told'],
  ['som_name', 'D102-L007', 'SC-D1-02', 'som', 'told'],
  ['nut_name', 'D103-L004', 'SC-D1-03', 'nut', 'told'],
  ['nut_food_interest', 'D103-L005A', 'SC-D1-03', 'nut', 'told'],
  ['som_food_accepted', 'D202-L007A', 'SC-D2-02', 'som', 'seen'],
  ['kan_shelf_incident', 'D303-L002', 'SC-D3-03', 'kan', 'seen'],
  ['shelf_restored_by_owner', 'D303-L007A', 'SC-D3-03', 'player', 'seen'],
  ['shelf_restored_together', 'D303-L007B', 'SC-D3-03', 'kan', 'seen'],
  ['kan_name', 'D303-L010A', 'SC-D3-03', 'kan', 'told'],
] as const;

export const demoEventDefinitions: readonly EventDefinition[] =
  demoFactDefinitions.map(([fact, line, sceneId, owner, knowledge]) => ({
    id: `demo.domain.${fact}`,
    sceneId,
    category: 'domain',
    action: {
      kind: 'record-demo-fact',
      fact,
      evidenceLineId: `demo.${line}`,
      owner,
      knowledge,
    },
  }));

export function createDemoEventRegistry() {
  return new EventRegistry(demoEventDefinitions);
}
