import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { SignIn } from '_app/components/Auth';
import { DropboxClient } from '_app/services/dropbox.server';

export default function Index() {
  let data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome to Bryggan</h1>
      {data.user == null ? <SignIn /> : <Link to="/tidningen">Hey {data.user.name}! Go to app</Link>}
    </div>
  );
}

export async function loader({ request }: LoaderArgs) {
  let [dbx] = await DropboxClient.fromRequest(request);
  return { user: dbx.session?.user };
}
