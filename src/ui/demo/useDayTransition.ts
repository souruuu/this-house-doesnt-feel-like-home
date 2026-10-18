import { useEffect, useState } from 'react';

// Presentation only: the controller has already published the new day's line.
// No extra Ink step, story time or event is created for this card.
export function useDayTransition(
  sessionId: string | undefined,
  day: string | undefined,
) {
  const [shown, setShown] = useState({ sessionId, day, visible: false });
  if (shown.sessionId !== sessionId || (day && shown.day !== day))
    setShown({ sessionId, day, visible: Boolean(day) });
  const active =
    shown.sessionId === sessionId && shown.day === day && shown.visible;
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      setShown((previous) =>
        previous.sessionId === sessionId && previous.day === day
          ? { ...previous, visible: false }
          : previous,
      );
    }, 650);
    return () => clearTimeout(timer);
  }, [sessionId, day, active]);
  return active ? day : undefined;
}
