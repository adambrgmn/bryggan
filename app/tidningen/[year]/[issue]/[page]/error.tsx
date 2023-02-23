'use client';

import { GenericCatchBoundary } from '@/components/CatchBoundary';

export default function ErrorPage({ error }: { error: Error }) {
  return <GenericCatchBoundary caught={error} />;
}
