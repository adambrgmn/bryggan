import { redirect } from 'next/navigation';

import { config } from '@/lib/config';
import { getSession } from '@/pages/api/auth/[...nextauth]';

export default async function Page() {
  let session = await getSession();

  if (session != null) redirect(config['route.app']);
  redirect(config['route.signin']);
}
