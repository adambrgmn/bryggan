import { files } from 'dropbox';

import { PagePreviewGrid, PreviewGridItem } from '@/components/PreviewGrid';
import { DropboxClient } from '@/lib/clients/dropbox';
import { formatPageName, parsePageName } from '@/lib/utils/dropbox';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

type Params = { year: string; issue: string };
type Props = { params: Params };

export default async function Issue({ params, children }: React.PropsWithChildren<Props>) {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);

  let { result: folder } = await dbx.listFolder({ path: `/${params.year}/${params.issue}` });
  let files = folder.entries
    .filter((entry): entry is files.FileMetadataReference => entry['.tag'] === 'file')
    .sort((a, b) => a.path_lower?.localeCompare(b.path_lower ?? '') ?? 0);

  let pages = files.map<PreviewGridItem>((entry) => {
    let name = parsePageName(entry.name);
    return {
      id: entry.id,
      name,
      href: `/tidningen/${params.year}/${params.issue}/${formatPageName(Number(name))}`,
      previewUrl: entry.preview_url ?? '',
      previewPath: entry.path_lower ?? '',
    };
  });

  return (
    <>
      <PagePreviewGrid items={pages} />
      {children}
    </>
  );
}
