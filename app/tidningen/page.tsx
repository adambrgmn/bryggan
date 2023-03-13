import { Metadata } from 'next';

import { IssuePreviewGrid, PreviewGridItem } from '@/components/PreviewGrid';
import { SectionTitle } from '@/components/SectionTitle';
import { DropboxClient } from '@/lib/clients/dropbox';
import { config } from '@/lib/config';
import { join } from '@/lib/utils/path';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

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

  let priorities: number[] = [];
  let total = 0;
  for (let i = 0; i < years.length; i++) {
    let count = Math.min(years[i].items.length, Math.max(config['images.above_fold'] - total, 0));
    priorities.push(count);
    total += count;
  }

  return (
    <div>
      {years.map((year, index) => (
        <section key={year.year} className="relative mb-12">
          <SectionTitle year={year.year}>{year.year}</SectionTitle>
          <IssuePreviewGrid items={year.items} prioritizeCount={priorities[index]} />
        </section>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Tidningen',
};
