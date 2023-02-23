import type { HtmlMetaDescriptor, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { BreadcrumbProvider } from '_app/components/Breadcrumbs';
import { Header, HeaderProvider } from '_app/components/Header';
import { DropboxClient } from '_app/services/dropbox.server';

export function meta(): HtmlMetaDescriptor {
  return {
    title: 'Tidningen | Bryggan',
  };
}

export async function loader({ request }: LoaderArgs) {
  let [dbx] = await DropboxClient.fromRequest(request);
  if (!(await dbx.isAuthenticated()) || dbx.session == null) throw redirect('/');

  return { profile: dbx.session.user };
}

export default function Screen() {
  let { profile } = useLoaderData<typeof loader>();
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
