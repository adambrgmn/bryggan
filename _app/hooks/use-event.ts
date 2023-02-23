import { useCallback, useRef } from 'react';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export function useEvent<Handler extends (...args: any[]) => void>(handler: Handler): Handler {
  let handlerRef = useRef(handler);
  let eventHandler = useCallback((...args: Parameters<Handler>) => {
    return handlerRef.current(...args);
  }, []) as Handler;

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return eventHandler;
}
