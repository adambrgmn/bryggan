import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { BreadcrumbProvider, Header, HeaderProvider } from '~/components';
import { config } from '~/config';
import { authenticator } from '~/services/auth.server';
import { ProfileSchema } from '~/types/User';

export default function Screen() {
  let { profile } = useLoaderData();
  return (
    <BreadcrumbProvider>
      <HeaderProvider>
        <div className="relative flex flex-col gap-6">
          <Header profile={profile} />
          <main className="relative container mx-auto px-6">
            <Outlet />
          </main>
          <footer></footer>
        </div>
      </HeaderProvider>
    </BreadcrumbProvider>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request, { failureRedirect: config['route.login'] });
  return { profile: ProfileSchema.parse(user.profile) };
};
