import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { SignIn, SignOut } from '~/components/Auth';
import { authenticator } from '~/services/auth.server';

export default function Index() {
  let data = useLoaderData();
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Bryggan</h1>
      {data.user == null ? <SignIn /> : <SignOut />}

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request, {});
  return { user };
};
