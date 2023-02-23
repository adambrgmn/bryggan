import { useRouter } from 'next/router';
import { useMemo } from 'react';
import type { ZodTypeAny, output } from 'zod';

export function useSafeParams<T extends ZodTypeAny>(schema: T): output<T> {
  let router = useRouter();
  return useMemo(() => schema.parse(router.query), [router.query, schema]);
}
