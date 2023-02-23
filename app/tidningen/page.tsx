import type { DataFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useBreadcrumbOverride } from '_app/components/Breadcrumbs';
import { useHeaderBounds } from '_app/components/Header';
import type { PreviewGridItem } from '_app/components/PreviewGrid';
import { IssuePreviewGrid } from '_app/components/PreviewGrid';
import { DropboxClient } from '_app/services/dropbox.server';
import type { files } from 'dropbox';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

export async function loader({ request }: DataFunctionArgs) {
  let [dbx] = await DropboxClient.fromRequest(request);

  let { result: rootFolder } = await dbx.listFolder({ path: '/' });
  let yearFolders = rootFolder.entries
    .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
    .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

  let years: Years[] = await Promise.all(
    yearFolders.map(async (folder) => {
      let { result: year } = await dbx.listFolder({ path: folder.path_lower ?? '' });
      let issues = year.entries
        .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
        .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0)
        .map<PreviewGridItem>((entry) => ({
          id: entry.id,
          name: entry.name,
          href: `./${folder.name}/${entry.name}`,
          previewUrl: entry.preview_url ?? '',
          previewPath: entry.path_lower ?? '',
        }));

      return {
        year: folder.name,
        items: issues,
      };
    }),
  );

  return { years };
}

export default function App() {
  let data = useLoaderData<typeof loader>();

  return (
    <div>
      {data.years.map((year) => (
        <section key={year.year} className="relative mb-12">
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
    <h2 ref={ref} className="sticky top-0 mb-6">
      {children}
    </h2>
  );
};

interface Years {
  year: string;
  items: PreviewGridItem[];
}
