import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { config } from '_app/config';
import { DropboxClient, storage } from '_app/services/dropbox.server';

export async function loader({ request }: LoaderArgs) {
  let [, session] = await DropboxClient.fromRequest(request);
  throw redirect(config['route.login'], { headers: { 'Set-Cookie': await storage.destroySession(session) } });
}

export async function action({ request }: ActionArgs) {
  let [, session] = await DropboxClient.fromRequest(request);
  throw redirect(config['route.login'], { headers: { 'Set-Cookie': await storage.destroySession(session) } });
}
