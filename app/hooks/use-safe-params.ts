import { useParams } from '@remix-run/react';
import { useMemo } from 'react';
import type { ZodTypeAny, output } from 'zod';

export function useSafeParams<T extends ZodTypeAny>(schema: T): output<T> {
  let params = useParams();
  return useMemo(() => schema.parse(params), [params, schema]);
}
