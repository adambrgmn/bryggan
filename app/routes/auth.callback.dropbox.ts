import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { config } from '~/config';
import { DropboxClient, storage } from '~/services/dropbox.server';

export async function loader({ request }: LoaderArgs) {
  let [dbx, session] = await DropboxClient.fromRequest(request);

  let url = new URL(request.url);
  let code = url.searchParams.get('code');
  if (code == null) throw redirect(config['route.login']);

  try {
    let data = await dbx.createSessionFromCode(code);
    session.set('dropbox', data);

    return redirect('/', { headers: { 'Set-Cookie': await storage.commitSession(session) } });
  } catch (error) {
    throw redirect(config['route.login'], { headers: { 'Set-Cookie': await storage.destroySession(session) } });
  }
}
