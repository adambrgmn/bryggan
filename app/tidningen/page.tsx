import { IssuePreviewGrid, PreviewGridItem } from '@/components/PreviewGrid';
import { DropboxClient } from '@/lib/clients/dropbox';
import { config } from '@/lib/config';
import { join } from '@/lib/utils/path';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

import { SectionTitle } from './SectionTitle';

export default async function Page() {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);
  let yearFolders = await dbx.listFolders('/');

  let years = await Promise.all(
    yearFolders.map(async (folder) => {
      let year = await dbx.listFolders(folder.path_lower ?? '');
      let issues = year.map<PreviewGridItem>((entry) => ({
        id: entry.id,
        name: entry.name,
        href: join(config['route.app'], folder.name, entry.name),
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
