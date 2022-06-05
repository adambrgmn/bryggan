import { redirect } from '@remix-run/node';

import { authenticator } from './auth.server';

export async function createDropboxClient(request: Request) {
  let user = await authenticator.isAuthenticated(request, { failureRedirect: '/' });

  return async (path: string, options: RequestInit): Promise<unknown> => {
    let url = new URL(path, 'https://api.dropboxapi.com/2/');

    let headers = new Headers([['Authorization', `Bearer ${user.accessToken}`]]);
    let response = await fetch(url.toString(), { ...options, headers });

    if (response.status === 401) throw redirect('/auth/logout', 401);
    return response.json();
  };
}
