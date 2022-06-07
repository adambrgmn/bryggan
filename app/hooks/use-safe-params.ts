import { useParams } from '@remix-run/react';
import { useMemo } from 'react';
import type { ZodType } from 'zod';

export function useSafeParams<T>(schema: ZodType<T>): T {
  let params = useParams();
  return useMemo(() => schema.parse(params), [params, schema]);
}
