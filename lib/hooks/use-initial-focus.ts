import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

export function useInitialFocusRef<Element extends HTMLElement>() {
  let ref = useRef<Element>(null);

  useIsomorphicLayoutEffect(() => {
    if (ref.current != null) ref.current.focus();
  }, []);

  return ref;
}
