import type { EventRegistry } from '../narrative/EventRegistry.ts';
import type {
  DomainEvent,
  FixtureReferences,
  NarrativeSnapshot,
  PresentationContext,
} from '../narrative/types.ts';
import {
  initialFixtureState,
  prepareFixtureCommit,
  type FixtureDomainState,
} from '../state/fixtureDomainStore.ts';
import {
  supportsFixtureBuild,
  type FixtureSaveEnvelope,
  type SaveVersions,
} from './types.ts';

function record(value: unknown, keys: readonly string[]) {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype ||
    Object.keys(value).length !== keys.length ||
    !keys.every((key) => Object.hasOwn(value, key))
  )
    throw new Error('Invalid save object/fields');
  // A checked record, never a cast to a domain DTO.
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('Invalid save string');
  return value;
}

function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Invalid save array');
  return value;
}

function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Invalid save boolean');
  return value;
}

function integer(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw new Error('Invalid save integer');
  return value;
}

export function validateFixtureState(
  input: unknown,
  registry: EventRegistry,
): FixtureDomainState {
  const game = record(input, [
    'runId',
    'flags',
    'selectedBranch',
    'effectCount',
    'committedEventIds',
  ]);
  const runId = text(game.runId);
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(runId))
    throw new Error('Invalid fixture Run ID');
  const flags = record(game.flags, [
    'fixture.branch_enabled',
    'fixture.branch_committed',
    'fixture.branch_pending',
  ]);
  const events: Readonly<DomainEvent>[] = [];
  const ids = array(game.committedEventIds).map(text);
  if (new Set(ids).size !== ids.length)
    throw new Error('Duplicate committed Event ID');
  for (const id of ids) {
    const event = registry.resolve(id);
    if (event.category !== 'domain')
      throw new Error('Ledger contains a non-domain event');
    events.push(event);
  }
  // Validate the fixture's exact typed action invariants without applying them
  // to a live store, inventing unknown flags or repairing missing data.
  const expected = prepareFixtureCommit(
    Object.freeze({
      ...initialFixtureState(boolean(flags['fixture.branch_enabled'])),
      runId,
    }),
    events,
  );
  if (
    game.selectedBranch !== expected.selectedBranch ||
    integer(game.effectCount) !== expected.effectCount ||
    boolean(flags['fixture.branch_committed']) !==
      expected.flags['fixture.branch_committed'] ||
    boolean(flags['fixture.branch_pending']) !==
      expected.flags['fixture.branch_pending']
  )
    throw new Error('Fixture durable state/ledger invariant mismatch');
  return expected;
}

export function validateNarrativeSnapshot(
  input: unknown,
  references: FixtureReferences,
): NarrativeSnapshot {
  const narrative = record(input, [
    'inkStateJson',
    'cursorPath',
    'checkpoint',
    'backlog',
  ]);
  const inkStateJson = text(narrative.inkStateJson);
  // LoadJson remains the runtime authority for this opaque Ink state.
  const ink: unknown = JSON.parse(inkStateJson);
  if (typeof ink !== 'object' || ink === null || Array.isArray(ink))
    throw new Error('Invalid Ink JSON');
  const cursorPath =
    narrative.cursorPath === null ? null : text(narrative.cursorPath);
  const checkpoint = record(narrative.checkpoint, [
    'kind',
    'presentation',
    'line',
    'choices',
  ]);
  if (checkpoint.kind !== 'line' && checkpoint.kind !== 'choice')
    throw new Error('Unsupported checkpoint kind');
  const p = record(checkpoint.presentation, [
    'sceneId',
    'speaker',
    'expression',
    'position',
  ]);
  const presentation: Readonly<PresentationContext> = Object.freeze({
    sceneId: text(p.sceneId),
    speaker: text(p.speaker),
    expression: p.expression === null ? null : text(p.expression),
    position: p.position === null ? null : text(p.position),
  });
  if (
    !Object.hasOwn(references.scenes, presentation.sceneId) ||
    !references.speakers.includes(presentation.speaker) ||
    (presentation.position !== null &&
      !references.positions.includes(presentation.position))
  )
    throw new Error('Invalid checkpoint scene/speaker/position');
  if (presentation.expression !== null) {
    const expression = references.expressions[presentation.expression];
    if (
      !expression ||
      expression.speaker !== presentation.speaker ||
      !references.assets.includes(expression.asset)
    )
      throw new Error('Invalid checkpoint expression');
  }
  const sourceLine = record(checkpoint.line, ['id', 'text']);
  const line = Object.freeze({
    id: text(sourceLine.id),
    text: text(sourceLine.text),
  });
  function sceneFor(id: string) {
    if (!Object.hasOwn(references.lines, id))
      throw new Error('Unknown checkpoint Line ID');
    return references.lines[id];
  }
  if (sceneFor(line.id) !== presentation.sceneId)
    throw new Error('Checkpoint line/scene mismatch');
  const choices = Object.freeze(
    array(checkpoint.choices).map((value, index) => {
      const choice = record(value, ['index', 'id', 'text']);
      const id = text(choice.id);
      if (
        integer(choice.index) !== index ||
        sceneFor(id) !== presentation.sceneId
      )
        throw new Error('Invalid checkpoint Choice ID/index/scene');
      return Object.freeze({ index, id, text: text(choice.text) });
    }),
  );
  if (
    (checkpoint.kind === 'line' && choices.length !== 0) ||
    (checkpoint.kind === 'choice' && choices.length === 0) ||
    new Set(choices.map((choice) => choice.id)).size !== choices.length
  )
    throw new Error('Invalid checkpoint choices');
  const backlog = Object.freeze(
    array(narrative.backlog).map((value) => {
      const entry = record(value, ['lineId', 'text', 'speakerId']);
      const lineId = text(entry.lineId);
      sceneFor(lineId);
      const speakerId = text(entry.speakerId);
      if (!references.speakers.includes(speakerId))
        throw new Error('Unknown backlog speaker');
      return Object.freeze({ lineId, text: text(entry.text), speakerId });
    }),
  );
  const last = backlog.at(-1);
  if (
    !last ||
    last.lineId !== line.id ||
    last.text !== line.text ||
    last.speakerId !== presentation.speaker
  )
    throw new Error('Backlog/checkpoint mismatch');
  return Object.freeze({
    inkStateJson,
    cursorPath,
    checkpoint: Object.freeze({
      kind: checkpoint.kind,
      presentation,
      line,
      choices,
    }),
    backlog,
  });
}

export function validateSaveEnvelope(
  input: unknown,
  versions: SaveVersions,
  profileId: string,
  references: FixtureReferences,
  registry: EventRegistry,
): FixtureSaveEnvelope {
  const save = record(input, [
    'scope',
    'appBuildVersion',
    'saveSchemaVersion',
    'storyCompatibilityVersion',
    'profileId',
    'timestamp',
    'game',
    'narrative',
  ]);
  if (
    save.scope !== 'technical-fixture-only' ||
    !supportsFixtureBuild(save.appBuildVersion, versions) ||
    typeof save.appBuildVersion !== 'string' ||
    save.saveSchemaVersion !== versions.saveSchemaVersion ||
    save.storyCompatibilityVersion !== versions.storyCompatibilityVersion
  )
    throw new Error('Unsupported save scope/build/schema/story compatibility');
  if (save.profileId !== profileId)
    throw new Error('Save belongs to a different profile');
  const game = validateFixtureState(save.game, registry);
  const narrative = validateNarrativeSnapshot(save.narrative, references);
  validateFixtureProgress(game, narrative);
  return Object.freeze({
    ...versions,
    appBuildVersion: save.appBuildVersion,
    scope: 'technical-fixture-only',
    profileId,
    timestamp: integer(save.timestamp),
    game,
    narrative,
  });
}

// The versioned, bounded technical fixture has four readable outputs per path.
// These existing fixture IDs are not a general story graph or release rules.
// A valid game DTO and a valid Ink DTO can still belong to different moments.
function validateFixtureProgress(
  game: FixtureDomainState,
  narrative: NarrativeSnapshot,
) {
  const path = [
    game.flags['fixture.branch_enabled']
      ? 'fixture_start_001'
      : 'fixture_start_disabled_001',
  ];
  const ledger: string[] = [];
  if (game.selectedBranch !== null) {
    path.push(
      `fixture_branch_${game.selectedBranch}_001`,
      'fixture_rejoin_001',
      'fixture_end_001',
    );
    ledger.push(`fixture.domain.branch_${game.selectedBranch}`);
    if (narrative.backlog.length === 4) ledger.push('fixture.domain.rejoined');
  }
  if (
    narrative.backlog.length > path.length ||
    (game.selectedBranch !== null && narrative.backlog.length < 2) ||
    narrative.backlog.some((entry, index) => entry.lineId !== path[index]) ||
    (narrative.checkpoint.kind === 'choice' && ledger.length !== 0) ||
    JSON.stringify(game.committedEventIds) !== JSON.stringify(ledger)
  )
    throw new Error('Fixture checkpoint progress/ledger mismatch');
}
