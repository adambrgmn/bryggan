import Link from 'next/link';

import { SignIn, SignOut } from '@/components/Auth';
import { getSession } from '@/pages/api/auth/[...nextauth]';

export default async function Page() {
  let session = await getSession();

  return (
    <main>
      <div>
        <h1>Welcome to Bryggan</h1>
        {session != null ? (
          <div>
            <Link href="/tidningen">Go to app</Link>
            <hr />
            <SignOut />
            <hr />
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
        ) : (
          <SignIn />
        )}
      </div>
    </main>
  );
}
