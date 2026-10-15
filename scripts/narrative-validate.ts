import { readFileSync, readdirSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { Story } from 'inkjs';
import { fixtureOutput, fixtureSource } from './narrative-compile.ts';
import {
  createFixtureEventRegistry,
  type EventRegistry,
} from '../src/narrative/EventRegistry.ts';
import {
  bindFixtureQueries,
  createNarrativeQueryPort,
} from '../src/narrative/NarrativeQueryPort.ts';
import {
  createFixtureDomainStore,
  initialFixtureState,
  type FixtureDomainStore,
} from '../src/state/fixtureDomainStore.ts';
import { parseOutput, resetPresentation } from '../src/narrative/tags.ts';
import type { DomainEvent, FixtureReferences } from '../src/narrative/types.ts';

export function assertAssetPath(path: string) {
  if (
    !/^[a-zA-Z0-9_./-]+$/.test(path) ||
    path.startsWith('/') ||
    path.split('/').some((part) => !part || part === '..' || part === '.')
  ) {
    throw new Error(`Unsafe asset path: ${path}`);
  }
  let parent = 'public';
  for (const part of path.split('/')) {
    if (!readdirSync(parent).includes(part))
      throw new Error(`Missing/case-mismatched asset: ${path}`);
    parent += `/${part}`;
  }
  if (!statSync(parent).isFile())
    throw new Error(`Asset is not a file: ${path}`);
}

export function validateTags(
  tags: string[],
  text: string,
  references: FixtureReferences,
) {
  return parseOutput(
    tags,
    text,
    references,
    createFixtureEventRegistry(),
    resetPresentation(Object.keys(references.scenes)[0]),
  ).lineId;
}

// Source declarations are separate from runtime visits through a shared rejoin.
// This literal-tag index is deliberately scoped to our small technical fixture.
export function indexFixtureSource(
  source: string,
  references: FixtureReferences,
) {
  const declarations = new Set<string>();
  for (const sourceLine of source.split(/\r?\n/)) {
    const content = sourceLine.split('//')[0];
    for (const match of content.matchAll(
      /#\s*(line|event):([A-Za-z0-9_.-]+)/g,
    )) {
      const [, kind, id] = match;
      const key = `${kind}:${id}`;
      if (declarations.has(key)) throw new Error(`Duplicate source ID: ${key}`);
      declarations.add(key);
      if (kind === 'line' && !Object.hasOwn(references.lines, id))
        throw new Error(`Unknown source Line ID: ${id}`);
      if (kind === 'event' && !references.events.includes(id))
        throw new Error(`Unknown source Event ID: ${id}`);
    }
  }
  for (const id of Object.keys(references.lines)) {
    if (!declarations.has(`line:${id}`))
      throw new Error(`Missing source Line ID: ${id}`);
  }
  for (const id of references.events) {
    if (!declarations.has(`event:${id}`))
      throw new Error(`Missing source Event ID: ${id}`);
  }
  return declarations;
}

export function validateCompiledFixture(
  source: string,
  compiled: string,
  references: FixtureReferences,
  registry: EventRegistry = createFixtureEventRegistry(),
) {
  if (references.scope !== 'technical-fixture-only')
    throw new Error('Fixture must not be release content');
  indexFixtureSource(source, references);
  for (const knot of Object.values(references.scenes)) {
    if (!source.includes(`=== ${knot} ===`))
      throw new Error(`Missing fixture scene knot: ${knot}`);
  }
  const lines = new Set<string>();
  let terminalPaths = 0;
  let tagOnlyOutputs = 0;
  // Explicit query inputs cover both variants, without guessing production facts.
  for (const enabled of [true, false]) {
    const initial = initialFixtureState(enabled);
    const makeStory = (store: FixtureDomainStore) => {
      const story = new Story(compiled);
      bindFixtureQueries(story, createNarrativeQueryPort(store));
      return story;
    };
    const first = makeStory(createFixtureDomainStore(initial));
    const queue = [
      {
        state: first.state.ToJson(),
        context: resetPresentation(Object.keys(references.scenes)[0]),
        domain: initial,
      },
    ];
    let steps = 0;
    while (queue.length) {
      if (++steps > 256) throw new Error('Fixture traversal limit exceeded');
      const item = queue.shift();
      if (!item) break;
      // Each queued path owns its facts/ledger. No branch leaks into a sibling.
      const store = createFixtureDomainStore(item.domain);
      const story = makeStory(store);
      story.state.LoadJson(item.state); // Tool traversal only, not player save/load.
      let context = item.context;
      while (story.canContinue) {
        const events: Readonly<DomainEvent>[] = [];
        do {
          if (++steps > 256)
            throw new Error('Fixture traversal limit exceeded');
          const text = story.Continue() ?? '';
          const parsed = parseOutput(
            story.currentTags ?? [],
            text,
            references,
            registry,
            context,
          );
          context = parsed.context;
          if (parsed.event?.category === 'domain') events.push(parsed.event);
          if (parsed.lineId) lines.add(parsed.lineId);
          if (!parsed.text && (story.currentTags?.length ?? 0) > 0)
            tagOnlyOutputs++;
          if (parsed.text) break;
        } while (story.canContinue);
        // Match the controller: validate choices before the batch commit.
        for (const choice of story.currentChoices) {
          const parsed = parseOutput(
            choice.tags ?? [],
            choice.text,
            references,
            registry,
            context,
          );
          if (
            parsed.event ||
            !parsed.lineId ||
            parsed.context.sceneId !== context.sceneId
          )
            throw new Error('Invalid choice identity/scene/event');
        }
        store.commit(events);
      }
      if (!story.currentChoices.length) terminalPaths++;
      for (const choice of story.currentChoices) {
        const parsed = parseOutput(
          choice.tags ?? [],
          choice.text,
          references,
          registry,
          context,
        );
        if (parsed.event)
          throw new Error('Choice must not dispatch before selection');
        if (!parsed.lineId || parsed.context.sceneId !== context.sceneId)
          throw new Error('Invalid choice identity/scene');
        lines.add(parsed.lineId);
        const branch = makeStory(createFixtureDomainStore(store.getState()));
        branch.state.LoadJson(story.state.ToJson());
        branch.ChooseChoiceIndex(choice.index);
        queue.push({
          state: branch.state.ToJson(),
          context: { ...context },
          domain: store.getState(),
        });
        if (queue.length > 128)
          throw new Error('Fixture branch limit exceeded');
      }
    }
  }
  if (!lines.size) throw new Error('Empty fixture');
  for (const id of Object.keys(references.lines)) {
    if (!lines.has(id)) throw new Error(`Unvisited fixture Line ID: ${id}`);
  }
  return { lineCount: lines.size, terminalPaths, tagOnlyOutputs };
}

export function validateFixture() {
  const references: FixtureReferences = JSON.parse(
    readFileSync('narrative/fixtures/references.json', 'utf8'),
  );
  const manifest = JSON.parse(
    readFileSync('src/assets/manifest.json', 'utf8'),
  ) as Record<string, { path: string; status: string }>;
  for (const id of references.assets) {
    if (!Object.hasOwn(manifest, id)) throw new Error(`Unknown asset: ${id}`);
  }
  for (const asset of Object.values(manifest)) {
    if (asset.status !== 'placeholder')
      throw new Error('M0 accepts technical placeholders only');
    assertAssetPath(asset.path);
  }
  return validateCompiledFixture(
    readFileSync(fixtureSource, 'utf8'),
    readFileSync(fixtureOutput, 'utf8'),
    references,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  console.log(
    `Validated technical fixture only: ${JSON.stringify(validateFixture())}; release story not present.`,
  );
}
