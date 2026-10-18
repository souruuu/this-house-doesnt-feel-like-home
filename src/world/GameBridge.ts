import type { DemoCharacterPlacement } from './demoCharacterCues';

export interface DemoWorldView {
  readonly viewportScale?: number;
  readonly layout?: 'menu' | 'gameplay';
  readonly background: 'morning' | 'evening' | 'night';
  // Transient renderer projection only; never an Ink tag or saved domain fact.
  readonly characterStage?: {
    readonly contextKey: string;
    readonly characters: readonly DemoCharacterPlacement[];
  };
  readonly reducedMotion?: boolean;
}

// Session-owned imperative boundary; never holds save or narrative state.
export class GameBridge {
  private listeners = new Set<(paused: boolean) => void>();
  private paused = false;
  private disposed = false;
  private view: DemoWorldView = { background: 'morning' };
  private viewListeners = new Set<(view: DemoWorldView) => void>();

  setPresentation(view: DemoWorldView) {
    if (this.disposed) return;
    this.view = view;
    this.viewListeners.forEach((listener) => listener(view));
  }

  subscribePresentation(listener: (view: DemoWorldView) => void) {
    if (this.disposed) throw new Error('Bridge is disposed');
    this.viewListeners.add(listener);
    listener(this.view);
    return () => {
      this.viewListeners.delete(listener);
    };
  }

  setPaused(paused: boolean) {
    if (this.disposed || paused === this.paused) return;
    this.paused = paused;
    this.listeners.forEach((listener) => listener(paused));
  }

  subscribePause(listener: (paused: boolean) => void) {
    if (this.disposed) throw new Error('Bridge is disposed');
    this.listeners.add(listener);
    listener(this.paused);
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose() {
    this.disposed = true;
    this.listeners.clear();
    this.viewListeners.clear();
  }
}
