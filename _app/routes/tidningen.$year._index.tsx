import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { useCatch, useLoaderData } from '@remix-run/react';
import { GenericCatchBoundary } from '_app/components/CatchBoundary';
import type { PreviewGridItem } from '_app/components/PreviewGrid';
import { IssuePreviewGrid } from '_app/components/PreviewGrid';
import { DropboxClient } from '_app/services/dropbox.server';
import type { files } from 'dropbox';

export const meta: MetaFunction<typeof loader> = (args) => {
  return {
    title: `${args.params['year']} | Bryggan`,
  };
};

export async function loader({ request, params }: LoaderArgs) {
  try {
    let [dbx] = await DropboxClient.fromRequest(request);

    let { result: folder } = await dbx.listFolder({ path: `${params.year}` });
    let folders = folder.entries
      .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
      .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

    let issues = folders.map<PreviewGridItem>((entry) => ({
      id: entry.id,
      name: entry.name,
      href: `./${entry.name}`,
      previewUrl: entry.preview_url ?? '',
      previewPath: entry.path_lower ?? '',
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
