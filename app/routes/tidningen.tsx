import type { HtmlMetaDescriptor, LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import { BreadcrumbProvider } from '~/components/Breadcrumbs';
import { Header, HeaderProvider } from '~/components/Header';
import { config } from '~/config';
import { authenticator, refresher } from '~/services/auth.server';
import { ProfileSchema } from '~/types/User';

export function meta(): HtmlMetaDescriptor {
  return {
    title: 'Tidningen | Bryggan',
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request, { failureRedirect: config['route.login'] });
  await refresher.checkTokenExpiry(request, user);
  return { profile: ProfileSchema.parse(user.profile) };
};

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
