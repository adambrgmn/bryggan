import { useState } from 'react';

export function usePrevious<T>(value: T): T | null {
  let [tuple, setTuple] = useState<[T | null, T]>([null, value]); // [previousValue, currentValue]

  if (tuple[1] !== value) {
    setTuple([tuple[1], value]);
  }

  return tuple[0];
}
