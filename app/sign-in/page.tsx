import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { Auth } from '@/components/Auth';
import { config } from '@/lib/config';

export default async function SignIn({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  let session = await getServerSession();
  if (session) redirect(config['route.app']);

  return <Auth errorCode={searchParams.error} />;
}
