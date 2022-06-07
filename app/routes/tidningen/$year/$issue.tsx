import type { LoaderFunction } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';

import { PagePreview } from '~/components';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FileMetadata } from '~/types/Dropbox';

export default function Issue() {
  let data = useLoaderData<{ files: FileMetadata[] }>();

  return (
    <Fragment>
      <ul>
        {data.files.map((entry) => (
          <li key={entry.id}>
            <PagePreview path={entry.path_lower} />
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
  let files = folder.entries
    .filter((entry): entry is FileMetadata => entry['.tag'] === 'file')
    .sort((a, b) => a.path_lower.localeCompare(b.path_lower));

  return { files };
};
