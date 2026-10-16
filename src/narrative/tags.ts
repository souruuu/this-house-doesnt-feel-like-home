import type { EventRegistry } from './EventRegistry.ts';
import type {
  FixtureReferences,
  PresentationContext,
  NarrativeEvent,
} from './types.ts';

export function resetPresentation(sceneId: string): PresentationContext {
  return { sceneId, speaker: 'none', expression: null, position: null };
}

export function parseOutput(
  tags: readonly string[],
  text: string,
  references: FixtureReferences,
  registry: EventRegistry,
  previous: Readonly<PresentationContext>,
) {
  const values = new Map<string, string>();
  for (const tag of tags) {
    const match =
      /^(line|speaker|expression|position|event):([A-Za-z0-9_.-]+)$/.exec(
        tag.trim(),
      );
    if (!match) throw new Error(`Unknown/invalid tag: ${tag}`);
    const [, key, value] = match;
    if (values.has(key)) throw new Error(`Duplicate singleton tag: ${key}`);
    values.set(key, value);
  }
  const lineId = values.get('line');
  if (text.trim() && !lineId)
    throw new Error('Readable output requires a stable Line ID');
  if (lineId && !Object.hasOwn(references.lines, lineId))
    throw new Error(`Unknown Line ID: ${lineId}`);
  const eventId = values.get('event');
  let event: Readonly<NarrativeEvent> | undefined;
  if (eventId) {
    if (!references.events.includes(eventId))
      throw new Error(`Unknown event reference: ${eventId}`);
    event = registry.resolve(eventId);
  }
  const sceneId = lineId
    ? references.lines[lineId]
    : (event?.sceneId ?? previous.sceneId);
  if (!Object.hasOwn(references.scenes, sceneId))
    throw new Error(`Unknown scene: ${sceneId}`);
  if (event && event.sceneId !== sceneId)
    throw new Error(`Event scene mismatch: ${event.id}`);
  if (
    event?.category === 'domain' &&
    event.action.kind === 'record-demo-fact' &&
    event.action.evidenceLineId !== lineId
  )
    throw new Error('Demo fact requires its exact evidence line');
  const context =
    sceneId === previous.sceneId ? { ...previous } : resetPresentation(sceneId);
  const speaker = values.get('speaker');
  if (speaker) {
    if (!references.speakers.includes(speaker))
      throw new Error(`Unknown speaker: ${speaker}`);
    if (context.speaker !== speaker) context.expression = null;
    context.speaker = speaker;
  }
  const expression = values.get('expression');
  if (expression) {
    const definition = references.expressions[expression];
    if (
      !definition ||
      definition.speaker !== context.speaker ||
      !references.assets.includes(definition.asset)
    )
      throw new Error(`Unknown/unmapped expression: ${expression}`);
    context.expression = expression;
  }
  const position = values.get('position');
  if (position) {
    if (!references.positions.includes(position))
      throw new Error(`Unknown position: ${position}`);
    context.position = position;
  }
  return { lineId, text: text.trim(), context, event };
}
