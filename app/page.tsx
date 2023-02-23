import { getServerSession } from '@/pages/api/auth/[...nextauth]';
import Link from 'next/link';

import { SignIn, SignOut } from '@/components/Auth';

export default async function Page() {
  let session = await getServerSession();

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
