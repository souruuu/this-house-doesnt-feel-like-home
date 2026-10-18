import { useRef, type ButtonHTMLAttributes } from 'react';
import { Button } from './Button';

export interface DemoInputGuard {
  token: string;
  getToken: () => string;
  isAllowed: () => boolean;
}

interface DemoControlProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onPointerDown'>,
    DemoInputGuard {
  onActivate: () => void;
}

// UI gesture ownership only. Narrative revision/transaction validation stays in the controller.
export function DemoControl({
  token,
  getToken,
  isAllowed,
  onActivate,
  onKeyDown,
  onKeyUp,
  ...props
}: DemoControlProps) {
  const pointerToken = useRef<string | null>(null);
  function activate() {
    if (document.hasFocus() && isAllowed() && getToken() === token)
      onActivate();
  }
  return (
    <Button
      {...props}
      onPointerDown={() => {
        pointerToken.current = token;
      }}
      onClick={(event) => {
        const press = pointerToken.current;
        pointerToken.current = null;
        if (event.detail > 1 || (event.detail > 0 && press !== token)) return;
        // WebKit does not focus a pointer-activated button by default. Keep
        // modal Escape/Tab ownership inside the clicked control's surface.
        event.currentTarget.focus({ preventScroll: true });
        activate();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          (event.key !== 'Enter' && event.key !== ' ')
        )
          return;
        event.preventDefault();
        if (!event.repeat) activate();
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
      }}
    />
  );
}
