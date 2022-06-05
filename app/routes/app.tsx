import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { SignOut } from '~/components/Auth';
import { authenticator } from '~/services/auth.server';
import { ProfileSchema } from '~/types/User';

export default function Screen() {
  let data = useLoaderData();
  let profile = ProfileSchema.parse(data.profile);

  return (
    <div>
      <header>
        <h1>Bryggan</h1>
        <p>{profile.name}</p>
        <div>
          <SignOut />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request, { failureRedirect: '/auth/login' });
  return { profile: ProfileSchema.parse(user.profile) };
};
