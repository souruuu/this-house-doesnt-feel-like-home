import { useLayoutEffect, useRef, type ReactNode } from 'react';

// One transient DOM screen over the existing world/session, not a second game shell.
export function DemoScreen({
  label,
  className = '',
  onClose,
  children,
}: {
  label: string;
  className?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    root.current?.querySelector<HTMLElement>('[data-screen-initial]')?.focus();
  }, []);
  return (
    <div
      className="vn-screen-backdrop"
      onClickCapture={(event) => {
        // Safari/WebKit may leave pointer-clicked form controls (or text) on body.
        // Keep keyboard ownership in this modal, including clicks on its scrim.
        const target = (event.target as HTMLElement).closest<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]',
        );
        const focus =
          target && root.current?.contains(target) ? target : root.current;
        if (focus && !focus.hasAttribute('disabled'))
          focus.focus({ preventScroll: true });
      }}
    >
      <section
        ref={root}
        className={`vn-screen ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) onClose();
          }
          if (event.key !== 'Tab') return;
          const items = root.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled)',
          );
          if (!items?.length) return;
          const first = items[0],
            last = items[items.length - 1];
          if (document.activeElement === root.current) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
            return;
          }
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        {children}
      </section>
    </div>
  );
}
