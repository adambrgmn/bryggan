import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import type { PreviewGridItem } from '~/components/PreviewGrid';
import { IssuePreviewGrid } from '~/components/PreviewGrid';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FolderMetadata } from '~/types/Dropbox';

export default function Year() {
  let data = useLoaderData<{ items: PreviewGridItem[] }>();
  return <IssuePreviewGrid items={data.items} />;
}

export let loader: LoaderFunction = async ({ request, params }) => {
  let client = await createDropboxClient(request);
  let folder = await client.listFolder({ path: `/${params.year}` });
  let folders = folder.entries
    .filter((entry): entry is FolderMetadata => entry['.tag'] === 'folder')
    .sort((a, b) => a.path_lower.localeCompare(b.path_lower));

  let gridItems = folders.map<PreviewGridItem>((entry) => ({
    id: entry.id,
    name: entry.name,
    href: `./${entry.name}`,
    previewPath: entry.path_lower,
  }));

  return { items: gridItems };
};
