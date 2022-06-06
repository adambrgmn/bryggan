import type { LoaderFunction } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

import { createDropboxClient } from '~/services/dropbox.server';
import { FileMetadataSchema } from '~/types/Dropbox';
import type { FileMetadata } from '~/types/Dropbox';

export default function Issue() {
  let data = useLoaderData<{ files: FileMetadata[] }>();

  return (
    <Fragment>
      <ul>
        {data.files.map((entry) => (
          <li key={entry.id}>
            <Link to={`./${entry.name}`}>{entry.name}</Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </Fragment>
  );
}

export let loader: LoaderFunction = async ({ request, params }) => {
  let client = await createDropboxClient(request);
  let folder = await client.listFolder({ path: `/${params.year}/${params.issue}` });
  let files = folder.entries.filter((entry): entry is FileMetadata => FileMetadataSchema.safeParse(entry).success);

  return { files };
};
