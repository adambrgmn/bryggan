'use client';

import { GenericCatchBoundary } from '@/components/CatchBoundary';

export default function ErrorPage({ error }: { error: Error }) {
  if (error.message.includes('JSON')) return null;
  return <GenericCatchBoundary caught={error} />;
}
