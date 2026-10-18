export interface FixtureReferences {
  scope: string;
  scenes: Record<string, string>;
  lines: Record<string, string>;
  speakers: string[];
  expressions: Record<string, { speaker: string; asset: string }>;
  positions: string[];
  events: string[];
  assets: string[];
}

export interface PresentationContext {
  sceneId: string;
  speaker: string;
  expression: string | null;
  position: string | null;
}

export interface PresentationEvent {
  id: string;
  sceneId: string;
  category: 'presentation';
}

// Fixture-only actions; these are not release domain rules or Ink payloads.
export type FixtureDomainAction =
  | { readonly kind: 'select-branch'; readonly branch: 'a' | 'b' }
  | { readonly kind: 'record-rejoin' };

// Emergency demo facts are evidence-backed observations/disclosures, not G-01 formulas.
export interface DemoFactAction {
  readonly kind: 'record-demo-fact';
  readonly fact: string;
  readonly evidenceLineId: string;
  readonly owner: string;
  readonly knowledge: 'seen' | 'told';
}

export interface DomainEvent {
  readonly id: string;
  readonly sceneId: string;
  readonly category: 'domain';
  readonly action: FixtureDomainAction | DemoFactAction;
}

export type NarrativeEvent = PresentationEvent | DomainEvent;

export interface FixtureDomainPort {
  // Validation failure throws before mutation. Notification failure is a receipt
  // after mutation, so callers must never interpret it as a failed commit.
  commit(events: readonly Readonly<DomainEvent>[]): {
    notificationError: string | null;
  };
}

// Presentation still only notifies QA; it does not bypass GameBridge to Phaser.
export interface FixturePresentationPort {
  dispatch(event: Readonly<PresentationEvent>): void;
}

export interface NarrativeRequest {
  sessionId: string;
  revision: number;
}

export interface NarrativeView {
  sessionId: string;
  revision: number;
  phase: 'idle' | 'line' | 'choice' | 'ended' | 'error' | 'disposed';
  paused: boolean;
  presentation: Readonly<PresentationContext>;
  line: Readonly<{ id: string; text: string }> | null;
  choices: readonly Readonly<{ index: number; id: string; text: string }>[];
  error: string | null;
  failureStage: 'pre-commit' | 'post-commit' | null;
}

export interface TranscriptEntry {
  readonly lineId: string;
  readonly text: string;
  readonly speakerId: string;
}

// Semantic data only. No input intentions, notification history or UI objects.
export interface FixtureCheckpoint {
  readonly kind: 'line' | 'choice';
  readonly presentation: Readonly<PresentationContext>;
  readonly line: Readonly<{ id: string; text: string }>;
  readonly choices: NarrativeView['choices'];
}

export interface NarrativeSnapshot {
  readonly inkStateJson: string;
  readonly cursorPath: string | null;
  readonly checkpoint: FixtureCheckpoint;
  readonly backlog: readonly TranscriptEntry[];
}
