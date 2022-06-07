import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { SignOut } from '~/components/Auth';
import { config } from '~/config';
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

export const loader: LoaderFunction = async ({ request, params }) => {
  let user = await authenticator.isAuthenticated(request, { failureRedirect: config['route.login'] });
  return { profile: ProfileSchema.parse(user.profile) };
};
