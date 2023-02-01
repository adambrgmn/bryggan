import { join } from 'node:path';

import type { LoaderFunction } from '@remix-run/node';

import { createDropboxClient } from '~/services/dropbox.server';
import { GetThumbnailArgsSchema } from '~/types/Dropbox';

export let loader: LoaderFunction = async ({ request, params }) => {
  let client = await createDropboxClient(request);

  let url = new URL(request.url);
  let path = params['*'];
  if (path == null) return new Response('', { status: 400 });

  let options = GetThumbnailArgsSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!options.success) return new Response('', { status: 400 });

  let [year, issue = '01', page = `${year}-${issue}-001.pdf`] = path.split('/');
  let generatedPath = join(year, issue, page);

  let res = await client.getThumbnail(generatedPath, options.data);
  res.headers.set('Content-Type', `image/${options.data.format ?? 'jpeg'}`);
  res.headers.delete('Dropbox-Api-Result');

  return res;
};
