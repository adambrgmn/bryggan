import { getServerSession } from 'next-auth';
import { redirect, useSearchParams } from 'next/navigation';

import { Auth } from '@/components/Auth';
import { config } from '@/lib/config';

export default async function SignIn() {
  let session = await getServerSession();
  let searchParams = useSearchParams();

  if (session) redirect(config['route.app']);

  return <Auth errorCode={searchParams.get('error')} />;
}
