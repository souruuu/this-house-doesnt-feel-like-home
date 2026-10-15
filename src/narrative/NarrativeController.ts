import { Story } from 'inkjs';
import { Path } from 'inkjs/engine/Path';
import { validateNarrativeSnapshot } from '../save/validateSave.ts';
import type { EventRegistry } from './EventRegistry.ts';
import {
  bindFixtureQueries,
  type NarrativeQueryPort,
} from './NarrativeQueryPort.ts';
import { parseOutput, resetPresentation } from './tags.ts';
import type {
  FixturePresentationPort,
  FixtureDomainPort,
  FixtureReferences,
  NarrativeRequest,
  NarrativeView,
  NarrativeEvent,
  NarrativeSnapshot,
  TranscriptEntry,
} from './types.ts';

let nextSession = 0;

export class NarrativeController {
  private readonly story: Story;
  private readonly listeners = new Set<(view: NarrativeView) => void>();
  private active = true;
  private locked = false;
  private publishing = false;
  private operationHeld = false;
  private backlog: readonly TranscriptEntry[] = Object.freeze([]);
  private view: NarrativeView;

  constructor(
    compiled: string,
    private readonly references: FixtureReferences,
    private readonly registry: EventRegistry,
    queries: NarrativeQueryPort,
    private readonly presentation: FixturePresentationPort,
    private readonly domain: FixtureDomainPort = {
      commit(events) {
        if (events.length) throw new Error('Missing fixture domain port');
        return { notificationError: null };
      },
    },
  ) {
    if (references.scope !== 'technical-fixture-only')
      throw new Error('Controller only accepts technical fixtures');
    this.story = new Story(compiled);
    bindFixtureQueries(this.story, queries);
    const initialScene = Object.keys(references.scenes)[0];
    if (!initialScene) throw new Error('Fixture needs a scene');
    this.view = {
      sessionId: `fixture-session-${++nextSession}`,
      revision: 0,
      phase: 'idle',
      paused: false,
      presentation: Object.freeze(resetPresentation(initialScene)),
      line: null,
      choices: Object.freeze([]),
      error: null,
      failureStage: null,
    };
    this.view = Object.freeze(this.view);
  }

  getSnapshot = () => this.view;

  getBacklog = () => this.backlog;

  private assertAvailable() {
    if (!this.active || this.locked || this.publishing || this.operationHeld)
      throw new Error('Narrative session is busy or disposed');
  }

  private capture<T>(readDurable: () => T) {
    if (
      !this.active ||
      this.locked ||
      this.publishing ||
      (this.view.phase !== 'line' && this.view.phase !== 'choice') ||
      !this.view.line
    )
      throw new Error('Not a safe line/choice checkpoint');
    this.locked = true;
    try {
      // No await or user notification between these immutable snapshots.
      const narrative: NarrativeSnapshot = Object.freeze({
        inkStateJson: this.story.state.ToJson(),
        cursorPath: this.story.state.currentPathString,
        checkpoint: Object.freeze({
          kind: this.view.phase,
          presentation: this.view.presentation,
          line: this.view.line,
          choices: this.view.choices,
        }),
        backlog: this.backlog,
      });
      return Object.freeze({ narrative, game: readDurable() });
    } finally {
      this.locked = false;
    }
  }

  captureCheckpoint<T>(readDurable: () => T) {
    this.assertAvailable();
    return this.capture(readDurable);
  }

  // Narrow lease for Save/Load/New Run. Input stays blocked across repository
  // awaits; a released lease cannot capture a later session state.
  holdForSessionOperation() {
    this.assertAvailable();
    this.operationHeld = true;
    let held = true;
    return Object.freeze({
      capture: <T>(readDurable: () => T) => {
        if (!held) throw new Error('Session operation lease was released');
        return this.capture(readDurable);
      },
      release: () => {
        if (!held) return;
        held = false;
        this.operationHeld = false;
      },
    });
  }

  // Candidate-only preparation: public Ink APIs, no Continue/Choose/dispatch or
  // subscriber notification. A failure is discarded with the candidate.
  restoreCheckpoint(input: unknown, committedEventIds: readonly string[]) {
    this.assertAvailable();
    if (this.view.phase !== 'idle')
      throw new Error('Restore requires a fresh candidate controller');
    const snapshot = validateNarrativeSnapshot(input, this.references);
    this.story.state.LoadJson(snapshot.inkStateJson);
    if (
      this.story.hasError ||
      this.story.hasWarning ||
      JSON.stringify(JSON.parse(this.story.state.ToJson())) !==
        JSON.stringify(JSON.parse(snapshot.inkStateJson))
    )
      throw new Error('Ink state could not be restored exactly');
    const cursor = this.story.state.currentPathString;
    if (cursor !== snapshot.cursorPath)
      throw new Error('Ink cursor/checkpoint mismatch');
    const assertPath = (path: string) => {
      // ContentAtPath/Path are exported public APIs in inkjs 2.4.0. Reject its
      // approximate path recovery, including an out-of-range content index.
      if (!this.story.ContentAtPath(new Path(path)).correctObj)
        throw new Error('Invalid Ink cursor/choice path');
    };
    if (cursor !== null) assertPath(cursor);
    const { checkpoint } = snapshot;
    const parsed = parseOutput(
      this.story.currentTags ?? [],
      this.story.currentText ?? '',
      this.references,
      this.registry,
      checkpoint.presentation,
    );
    if (
      parsed.event?.category === 'domain' &&
      !committedEventIds.includes(parsed.event.id)
    )
      throw new Error('Restored output is missing its committed domain event');
    if (
      JSON.stringify(parsed.context) !==
        JSON.stringify(checkpoint.presentation) ||
      (checkpoint.kind === 'line' && !parsed.text) ||
      (parsed.text &&
        (parsed.lineId !== checkpoint.line.id ||
          parsed.text !== checkpoint.line.text))
    )
      throw new Error('Ink output/semantic checkpoint mismatch');
    const choices = this.story.currentChoices.map((choice) => {
      assertPath(choice.sourcePath);
      assertPath(choice.pathStringOnChoice);
      const output = parseOutput(
        choice.tags ?? [],
        choice.text,
        this.references,
        this.registry,
        checkpoint.presentation,
      );
      if (
        output.event ||
        !output.lineId ||
        output.context.sceneId !== checkpoint.presentation.sceneId
      )
        throw new Error('Invalid restored choice');
      return { index: choice.index, id: output.lineId, text: output.text };
    });
    if (
      checkpoint.kind === 'choice' &&
      (this.story.canContinue ||
        JSON.stringify(choices) !== JSON.stringify(checkpoint.choices))
    )
      throw new Error('Ink choices/semantic checkpoint mismatch');
    this.backlog = snapshot.backlog;
    this.view = Object.freeze({
      ...this.view,
      revision: this.view.revision + 1,
      phase: checkpoint.kind,
      presentation: checkpoint.presentation,
      line: checkpoint.line,
      choices: checkpoint.choices,
    });
  }

  subscribe = (listener: (view: NarrativeView) => void) => {
    if (!this.active) throw new Error('Session is disposed');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private publish(view: NarrativeView) {
    if (!this.active) return null;
    this.view = Object.freeze(view);
    let notificationError: string | null = null;
    this.publishing = true;
    try {
      for (const listener of this.listeners) {
        if (!this.active) break;
        try {
          listener(this.view);
        } catch (error) {
          notificationError ??=
            error instanceof Error ? error.message : String(error);
        }
      }
    } finally {
      this.publishing = false;
    }
    return notificationError;
  }

  setPaused(paused: boolean) {
    if (
      this.active &&
      !this.locked &&
      !this.publishing &&
      paused !== this.view.paused
    )
      // Pending intentions from before pause/resume must not become valid again.
      return this.publish({
        ...this.view,
        paused,
        revision: this.view.revision + 1,
      });
    return null;
  }

  private accepts(request: NarrativeRequest) {
    return (
      this.active &&
      !this.locked &&
      !this.publishing &&
      !this.operationHeld &&
      !this.view.paused &&
      request.sessionId === this.view.sessionId &&
      request.revision === this.view.revision
    );
  }

  start() {
    if (this.view.phase !== 'idle' || !this.accepts(this.view)) return false;
    return this.advance();
  }

  continue(request: NarrativeRequest) {
    if (this.view.phase !== 'line' || !this.accepts(request)) return false;
    return this.advance();
  }

  choose(request: NarrativeRequest, index: number) {
    if (
      this.view.phase !== 'choice' ||
      !this.accepts(request) ||
      !Number.isInteger(index) ||
      !this.view.choices.some((choice) => choice.index === index)
    )
      return false;
    return this.advance(index);
  }

  private advance(choiceIndex?: number) {
    this.locked = true;
    const revision = this.view.revision + 1;
    let commitCompleted = false;
    try {
      if (choiceIndex !== undefined) this.story.ChooseChoiceIndex(choiceIndex);
      let context = { ...this.view.presentation };
      let line = this.view.line;
      let receivedLine = false;
      const events: Readonly<NarrativeEvent>[] = [];
      let outputs = 0;
      while (this.story.canContinue) {
        if (++outputs > 128) throw new Error('Fixture output limit exceeded');
        const text = this.story.Continue() ?? '';
        const parsed = parseOutput(
          this.story.currentTags ?? [],
          text,
          this.references,
          this.registry,
          context,
        );
        context = parsed.context;
        if (parsed.event) events.push(parsed.event);
        if (parsed.text && parsed.lineId) {
          line = Object.freeze({ id: parsed.lineId, text: parsed.text });
          receivedLine = true;
          break;
        }
      }
      const choices = this.story.currentChoices.map((choice) => {
        const parsed = parseOutput(
          choice.tags ?? [],
          choice.text,
          this.references,
          this.registry,
          context,
        );
        if (parsed.event)
          throw new Error('Choice cannot dispatch an event before selection');
        if (!parsed.lineId) throw new Error('Choice needs a stable Line ID');
        if (parsed.context.sceneId !== context.sceneId)
          throw new Error('Choice scene mismatch');
        return Object.freeze({
          index: choice.index,
          id: parsed.lineId,
          text: parsed.text,
        });
      });
      // All tag-only outputs, the line and every available choice are valid first.
      const receipt = this.domain.commit(
        events.filter((event) => event.category === 'domain'),
      );
      commitCompleted = true;
      if (receipt.notificationError !== null)
        throw new Error(receipt.notificationError);
      for (const event of events) {
        if (!this.active) return false;
        if (event.category === 'presentation')
          this.presentation.dispatch(event);
      }
      if (!this.active) return false;
      if (receivedLine && line)
        this.backlog = Object.freeze([
          ...this.backlog,
          Object.freeze({
            lineId: line.id,
            text: line.text,
            speakerId: context.speaker,
          }),
        ]);
      const notificationError = this.publish({
        ...this.view,
        revision,
        // A newly published line always waits for its own Continue intention.
        phase: receivedLine ? 'line' : choices.length ? 'choice' : 'ended',
        presentation: Object.freeze(context),
        line,
        choices: Object.freeze(receivedLine ? [] : choices),
        error: null,
        failureStage: null,
      });
      if (notificationError !== null) throw new Error(notificationError);
      return true;
    } catch (error) {
      this.publish({
        ...this.view,
        revision,
        phase: 'error',
        line: null,
        choices: Object.freeze([]),
        error: error instanceof Error ? error.message : String(error),
        failureStage: commitCompleted ? 'post-commit' : 'pre-commit',
      });
      return false;
    } finally {
      this.locked = false;
    }
  }

  dispose() {
    if (!this.active) return;
    this.active = false;
    this.listeners.clear();
    this.view = Object.freeze({
      ...this.view,
      phase: 'disposed',
      choices: Object.freeze([]),
    });
  }
}
