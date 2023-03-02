import { getServerSession } from 'next-auth';
import { redirect, useSearchParams } from 'next/navigation';

import { Auth } from '@/components/Auth';
import { config } from '@/lib/config';

type Props = {
  searchParams: { error?: string | undefined };
};

export default async function SignIn({ searchParams }: Props) {
  let session = await getServerSession();

  if (session) redirect(config['route.app']);

  return <Auth errorCode={searchParams.error} />;
}
