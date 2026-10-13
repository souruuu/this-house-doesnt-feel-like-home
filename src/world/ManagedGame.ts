import Phaser from 'phaser';

/** Phaser 4.2.1 VisibilityHandler installs document/window handlers without a
 * destroy hook. Scope those registrations to this game, including late boot.
 * Recheck this adapter when upgrading Phaser; it never changes engine state. */
export class ManagedGame extends Phaser.Game {
  private detachVisibility: (() => void) | undefined;
  private released = false;

  protected override start() {
    const previousBlur = window.onblur;
    const previousFocus = window.onfocus;
    const originalAdd = document.addEventListener;
    const removals: (() => void)[] = [];
    document.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      originalAdd.call(this, type, listener, options);
      if (type === 'visibilitychange') {
        removals.push(() =>
          document.removeEventListener(type, listener, options),
        );
      }
    };
    try {
      // Registration capture is synchronous and ends before any frame/user input.
      super.start();
    } finally {
      document.addEventListener = originalAdd;
    }
    const ownedBlur = window.onblur;
    const ownedFocus = window.onfocus;
    this.detachVisibility = () => {
      removals.forEach((remove) => remove());
      if (window.onblur === ownedBlur) window.onblur = previousBlur;
      if (window.onfocus === ownedFocus) window.onfocus = previousFocus;
    };
    if (this.released) this.detachVisibility();
  }

  override destroy(removeCanvas = false, noReturn = false) {
    this.released = true;
    this.detachVisibility?.();
    this.detachVisibility = undefined;
    super.destroy(removeCanvas, noReturn);
  }
}
