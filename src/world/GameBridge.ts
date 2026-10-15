// Session-owned imperative boundary; never holds save or narrative state.
export class GameBridge {
  private listeners = new Set<(paused: boolean) => void>();
  private paused = false;
  private disposed = false;

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
  }
}
