'use client';

import { getSession } from 'next-auth/react';

import { useInterval } from '@/lib/hooks/use-interval';

export function RefreshAuth() {
  useInterval(() => {
    getSession().catch((error) => console.error(error));
  }, 60_000);

  return null;
}
