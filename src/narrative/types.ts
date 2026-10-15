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

// Batch 1 has no world commands or durable effects. This port only notifies QA.
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
}
