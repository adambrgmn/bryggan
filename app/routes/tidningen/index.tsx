import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import type { PreviewGridItem } from '~/components';
import { IssuePreviewGrid, useBreadcrumbOverride, useHeaderBounds } from '~/components';
import { createDropboxClient } from '~/services/dropbox.server';
import type { FolderMetadata } from '~/types/Dropbox';

export default function App() {
  let data = useLoaderData<{ years: Years[] }>();

  return (
    <div>
      {data.years.map((year) => (
        <section key={year.year} className="relative">
          <Title year={year.year}>{year.year}</Title>
          <IssuePreviewGrid items={year.items} />
        </section>
      ))}
    </div>
  );
}

const Title: React.FC<React.PropsWithChildren<{ year: string }>> = ({ year, children }) => {
  let setBreadcrumb = useBreadcrumbOverride();
  let { height } = useHeaderBounds();

  let rootMargin = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return `0px 0px -${((window.innerHeight - height) / window.innerHeight) * 100}% 0px`;
  }, [height]);

  const [ref] = useInView({
    rootMargin,
    threshold: 0.75,
    onChange: (inView) => {
      if (inView) setBreadcrumb({ label: year, to: `./${year}` });
      else setBreadcrumb(undefined);
    },
  });

  return (
    <h2 ref={ref} className="mb-6 sticky top-0">
      {children}
    </h2>
  );
};

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
