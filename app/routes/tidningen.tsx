import type { LoaderFunction } from '@remix-run/node';
import { Link, Outlet } from '@remix-run/react';

import { SignOut } from '~/components/Auth';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import { config } from '~/config';
import { authenticator } from '~/services/auth.server';
import { ProfileSchema } from '~/types/User';

export default function Screen() {
  return (
    <div>
      <header className="flex justify-between">
        <div className="flex gap-2">
          <h1>
            <Link to=".">Bryggan</Link>
          </h1>
          <Breadcrumbs />
        </div>
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
  let user = await authenticator.isAuthenticated(request, { failureRedirect: config['route.login'] });
  return { profile: ProfileSchema.parse(user.profile) };
};
