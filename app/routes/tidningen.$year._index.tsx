import type { DataFunctionArgs, MetaFunction } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';

import type { PreviewGridItem } from '~/components/PreviewGrid';
import { IssuePreviewGrid } from '~/components/PreviewGrid';
import { GenericCatchBoundary } from '~/components/CatchBoundary';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FolderMetadata } from '~/types/Dropbox';

export const meta: MetaFunction<typeof loader> = (args) => {
  return {
    title: `${args.params['year']} | Bryggan`,
  };
};

export async function loader({ request, params }: DataFunctionArgs) {
  try {
    let client = await createDropboxClient(request);
    let folder = await client.listFolder({ path: `/${params.year}` });
    let folders = folder.entries
      .filter((entry): entry is FolderMetadata => entry['.tag'] === 'folder')
      .sort((a, b) => b.path_lower.localeCompare(a.path_lower));

    let issues = folders.map<PreviewGridItem>((entry) => ({
      id: entry.id,
      name: entry.name,
      href: `./${entry.name}`,
      previewPath: entry.path_lower,
    }));

    return { items: issues };
  } catch {
    throw new Response('Not found', { status: 404 });
  }
}

export default function Year() {
  let data = useLoaderData<typeof loader>();
  return <IssuePreviewGrid items={data.items} />;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <GenericCatchBoundary caught={caught} />;
}
