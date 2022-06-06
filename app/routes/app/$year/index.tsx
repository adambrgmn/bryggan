import type { LoaderFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { createDropboxClient } from '~/services/dropbox.server';
import { FolderMetadataSchema } from '~/types/Dropbox';
import type { FolderMetadata } from '~/types/Dropbox';

export default function Year() {
  let data = useLoaderData<{ folders: FolderMetadata[] }>();

  return (
    <ul>
      {data.folders.map((entry) => (
        <li key={entry.id}>
          <Link to={`./${entry.name}`}>{entry.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export let loader: LoaderFunction = async ({ request, params }) => {
  let client = await createDropboxClient(request);
  let folder = await client.listFolder({ path: `/${params.year}` });
  let folders = folder.entries.filter(
    (entry): entry is FolderMetadata => FolderMetadataSchema.safeParse(entry).success,
  );

  return { folders };
};
