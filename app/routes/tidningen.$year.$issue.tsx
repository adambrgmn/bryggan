import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { Outlet, useCatch, useLoaderData } from '@remix-run/react';
import type { files } from 'dropbox';
import { Fragment } from 'react';

import { GenericCatchBoundary } from '~/components/CatchBoundary';
import type { PreviewGridItem } from '~/components/PreviewGrid';
import { PagePreviewGrid } from '~/components/PreviewGrid';
import { DropboxClient } from '~/services/dropbox.server';
import { formatPageName, parsePageName } from '~/utils/dropbox';

export const meta: MetaFunction<typeof loader> = (args) => {
  return {
    title: `${args.params['year']}-${args.params['issue']} | Bryggan`,
  };
};

export async function loader({ request, params }: LoaderArgs) {
  try {
    let [dbx] = await DropboxClient.fromRequest(request);

    let { result: folder } = await dbx.listFolder({ path: `/${params.year}/${params.issue}` });
    let files = folder.entries
      .filter((entry): entry is files.FileMetadataReference => entry['.tag'] === 'file')
      .sort((a, b) => a.path_lower?.localeCompare(b.path_lower ?? '') ?? 0);

    let pages = files.map<PreviewGridItem>((entry) => ({
      id: entry.id,
      name: parsePageName(entry.name),
      href: `./${formatPageName(Number(parsePageName(entry.name)))}`,
      previewUrl: entry.preview_url ?? '',
      previewPath: entry.path_lower ?? '',
    }));

    return { items: pages };
  } catch {
    throw new Response('Not found', { status: 404 });
  }
}

export default function Issue() {
  let data = useLoaderData<typeof loader>();

  return (
    <Fragment>
      <Outlet context={{ total: data.items.length }} />
      <PagePreviewGrid items={data.items} />
    </Fragment>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return <GenericCatchBoundary caught={caught} />;
}
