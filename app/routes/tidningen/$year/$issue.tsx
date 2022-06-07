import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

import type { PreviewGridItem } from '~/components';
import { PagePreviewGrid } from '~/components';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FileMetadata } from '~/types/Dropbox';
import { parsePageName } from '~/utils/dropbox';

export default function Issue() {
  let data = useLoaderData<{ items: PreviewGridItem[] }>();

  return (
    <Fragment>
      <PagePreviewGrid items={data.items} />
      <Outlet />
    </Fragment>
  );
}

export let loader: LoaderFunction = async ({ request, params }) => {
  let client = await createDropboxClient(request);
  let folder = await client.listFolder({ path: `/${params.year}/${params.issue}` });
  let files = folder.entries
    .filter((entry): entry is FileMetadata => entry['.tag'] === 'file')
    .sort((a, b) => a.path_lower.localeCompare(b.path_lower));

  let pages = files.map<PreviewGridItem>((entry) => ({
    id: entry.id,
    name: parsePageName(entry.name),
    href: `./${entry.name}`,
    previewPath: entry.path_lower,
  }));

  return { items: pages };
};
