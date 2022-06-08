import type { LoaderFunction } from '@remix-run/node';

import { createDropboxClient } from '~/services/dropbox.server';

export let loader: LoaderFunction = async ({ request, params }) => {
  let client = await createDropboxClient(request);

  let path = params['*'];
  if (path == null) return new Response('', { status: 400 });

  let res = await client.download(path);
  if (process.env.NODE_ENV === 'production') {
    res.headers.delete('Dropbox-Api-Result');
  }

  return res;
};
