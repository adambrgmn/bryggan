import { useEffect } from 'react';

import { useEvent } from './use-event';

interface UseWindowEventOptions {
  enabled?: boolean;
}

export function useWindowEvent<EventName extends keyof WindowEventMap>(
  event: EventName,
  handler: (event: WindowEventMap[EventName]) => void,
  { enabled = true }: UseWindowEventOptions = {},
) {
  let eventHandler = useEvent(handler);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener(event, eventHandler);
    return () => {
      window.removeEventListener(event, eventHandler);
    };
  }, [enabled, event, eventHandler]);
}
