import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { BreadcrumbProvider } from '~/components/Breadcrumbs';
import { Header, HeaderProvider } from '~/components/Header';
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
          <main className="container relative mx-auto px-6">
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

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}
