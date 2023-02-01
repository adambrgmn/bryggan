import type { LoaderFunction } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

import type { PreviewGridItem } from '~/components/PreviewGrid';
import { PagePreviewGrid } from '~/components/PreviewGrid';
import { GenericCatchBoundary } from '~/components/CatchBoundary';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FileMetadata } from '~/types/Dropbox';
import { formatPageName, parsePageName } from '~/utils/dropbox';

export default function Issue() {
  let data = useLoaderData<{ items: PreviewGridItem[] }>();

  return (
    <Fragment>
      <Outlet context={{ total: data.items.length }} />
      <PagePreviewGrid items={data.items} />
    </Fragment>
  );
}

export let loader: LoaderFunction = async ({ request, params }) => {
  try {
    let client = await createDropboxClient(request);
    let folder = await client.listFolder({ path: `/${params.year}/${params.issue}` });
    let files = folder.entries
      .filter((entry): entry is FileMetadata => entry['.tag'] === 'file')
      .sort((a, b) => a.path_lower.localeCompare(b.path_lower));

    let pages = files.map<PreviewGridItem>((entry) => ({
      id: entry.id,
      name: parsePageName(entry.name),
      href: `./${formatPageName(Number(parsePageName(entry.name)))}`,
      previewPath: entry.path_lower,
    }));

    return { items: pages };
  } catch {
    throw new Response('Not found', { status: 404 });
  }
};

export function CatchBoundary() {
  const caught = useCatch();
  return <GenericCatchBoundary caught={caught} />;
}
