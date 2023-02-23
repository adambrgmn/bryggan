import { files } from 'dropbox';

import { IssuePreviewGrid, PreviewGridItem } from '@/components/PreviewGrid';
import { DropboxClient } from '@/lib/clients/dropbox';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

type Params = { year: string };
type Props = { params: Params };

export default async function Page({ params }: Props) {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);

  let { result: folder } = await dbx.listFolder({ path: `${params.year}` });
  let folders = folder.entries
    .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
    .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

  let issues = folders.map<PreviewGridItem>((entry) => ({
    id: entry.id,
    name: entry.name,
    href: `/tidningen/${params.year}/${entry.name}`,
    previewUrl: entry.preview_url ?? '',
    previewPath: entry.path_lower ?? '',
  }));

  return <IssuePreviewGrid items={issues} />;
}
