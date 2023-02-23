import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { SignIn } from '_app/components/Auth';
import { DropboxClient } from '_app/services/dropbox.server';

export default function Screen() {
  return <SignIn />;
}

export async function loader({ request }: LoaderArgs) {
  let [dbx] = await DropboxClient.fromRequest(request);
  if (await dbx.isAuthenticated()) return redirect('/');

  let url = await dbx.getAuthenticationUrl();

  return { url };
}

export async function action({ request }: ActionArgs) {
  let [dbx] = await DropboxClient.fromRequest(request);
  if (await dbx.isAuthenticated()) return redirect('/');

  let url = await dbx.getAuthenticationUrl();
  return redirect(url);
}
