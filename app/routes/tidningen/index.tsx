import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import type { PreviewGridItem } from '~/components';
import { IssuePreviewGrid } from '~/components';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FolderMetadata } from '~/types/Dropbox';

export default function App() {
  let data = useLoaderData<{ years: Years[] }>();
  return (
    <div>
      {data.years.map((year) => (
        <section key={year.year}>
          <h2>{year.year}</h2>
          <IssuePreviewGrid items={year.items} />
        </section>
      ))}
    </div>
  );
}

interface Years {
  year: string;
  items: PreviewGridItem[];
}

export let loader: LoaderFunction = async ({ request }) => {
  let client = await createDropboxClient(request);
  let rootFolder = await client.listFolder({ path: '/' });
  let yearFolders = rootFolder.entries
    .filter((entry): entry is FolderMetadata => entry['.tag'] === 'folder')
    .sort((a, b) => b.path_lower.localeCompare(a.path_lower));

  let years: Years[] = await Promise.all(
    yearFolders.map(async (folder) => {
      let year = await client.listFolder({ path: folder.path_lower });
      let issues = year.entries
        .filter((entry): entry is FolderMetadata => entry['.tag'] === 'folder')
        .sort((a, b) => b.path_lower.localeCompare(a.path_lower))
        .map<PreviewGridItem>((entry) => ({
          id: entry.id,
          name: entry.name,
          href: `./${folder.name}/${entry.name}`,
          previewPath: entry.path_lower,
        }));

      return {
        year: folder.name,
        items: issues,
      };
    }),
  );

  return { years };
};
