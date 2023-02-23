import { IssuePreviewGrid, PreviewGridItem } from '@/components/PreviewGrid';
import { DropboxClient } from '@/lib/clients/dropbox';
import { join } from '@/lib/utils/path';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

type Params = { year: string };
type Props = { params: Params };

export default async function Page({ params }: Props) {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);

  let folders = await dbx.listFolders(params.year);
  let issues = folders.map<PreviewGridItem>((entry) => ({
    id: entry.id,
    name: entry.name,
    href: join('/tidningen', params.year, entry.name),
    previewUrl: entry.preview_url ?? '',
    previewPath: entry.path_lower ?? '',
  }));

  return <IssuePreviewGrid items={issues} />;
}
