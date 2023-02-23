import { files } from 'dropbox';

import { IssuePreviewGrid, PreviewGridItem } from '@/components/PreviewGrid';
import { DropboxClient } from '@/lib/clients/dropbox';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

import { SectionTitle } from './SectionTitle';

export default async function Page() {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);
  let { result: rootFolder } = await dbx.listFolder({ path: '/' });
  let yearFolders = rootFolder.entries
    .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
    .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

  let years = await Promise.all(
    yearFolders.map(async (folder) => {
      let { result: year } = await dbx.listFolder({ path: folder.path_lower ?? '' });
      let issues = year.entries
        .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
        .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0)
        .map<PreviewGridItem>((entry) => ({
          id: entry.id,
          name: entry.name,
          href: `tidningen/${folder.name}/${entry.name}`,
          previewUrl: entry.preview_url ?? '',
          previewPath: entry.path_lower ?? '',
        }));

      return { year: folder.name, items: issues };
    }),
  );

  return (
    <div>
      {years.map((year) => (
        <section key={year.year} className="relative mb-12">
          <SectionTitle year={year.year}>{year.year}</SectionTitle>
          <IssuePreviewGrid items={year.items} />
        </section>
      ))}
    </div>
  );
}
