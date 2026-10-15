import { Story } from 'inkjs';
import type { EventRegistry } from './EventRegistry.ts';
import {
  bindFixtureQueries,
  type NarrativeQueryPort,
} from './NarrativeQueryPort.ts';
import { parseOutput, resetPresentation } from './tags.ts';
import type {
  FixturePresentationPort,
  FixtureReferences,
  NarrativeRequest,
  NarrativeView,
  PresentationEvent,
} from './types.ts';

let nextSession = 0;

export class NarrativeController {
  private readonly story: Story;
  private readonly listeners = new Set<(view: NarrativeView) => void>();
  private active = true;
  private locked = false;
  private view: NarrativeView;

  constructor(
    compiled: string,
    private readonly references: FixtureReferences,
    private readonly registry: EventRegistry,
    queries: NarrativeQueryPort,
    private readonly presentation: FixturePresentationPort,
  ) {
    if (references.scope !== 'technical-fixture-only')
      throw new Error('Batch 1 only accepts technical fixtures');
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
    };
    this.view = Object.freeze(this.view);
  }

  getSnapshot = () => this.view;

  subscribe(listener: (view: NarrativeView) => void) {
    if (!this.active) throw new Error('Session is disposed');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private publish(view: NarrativeView) {
    if (!this.active) return;
    this.view = Object.freeze(view);
    for (const listener of this.listeners) {
      if (!this.active) break;
      listener(this.view);
    }
  }

  setPaused(paused: boolean) {
    if (this.active && paused !== this.view.paused)
      // Pending intentions from before pause/resume must not become valid again.
      this.publish({ ...this.view, paused, revision: this.view.revision + 1 });
  }

  private accepts(request: NarrativeRequest) {
    return (
      this.active &&
      !this.locked &&
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
    try {
      if (choiceIndex !== undefined) this.story.ChooseChoiceIndex(choiceIndex);
      let context = { ...this.view.presentation };
      let line = this.view.line;
      let receivedLine = false;
      const events: Readonly<PresentationEvent>[] = [];
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
      for (const event of events) {
        if (!this.active) return false;
        this.presentation.dispatch(event);
      }
      if (!this.active) return false;
      this.publish({
        ...this.view,
        revision,
        // A newly published line always waits for its own Continue intention.
        phase: receivedLine ? 'line' : choices.length ? 'choice' : 'ended',
        presentation: Object.freeze(context),
        line,
        choices: Object.freeze(receivedLine ? [] : choices),
        error: null,
      });
      return true;
    } catch (error) {
      this.publish({
        ...this.view,
        revision,
        phase: 'error',
        line: null,
        choices: Object.freeze([]),
        error: error instanceof Error ? error.message : String(error),
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
