import { Metadata } from 'next';
import * as z from 'zod';

import { PageView } from '@/components/PageView';
import { DropboxClient } from '@/lib/clients/dropbox';
import { config } from '@/lib/config';
import { formatPageName } from '@/lib/utils/dropbox';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.coerce.number(),
});

type Params = { year: string; issue: string; page: string };
type Props = { params: Params };

export default async function Page(props: Props) {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);

  let params = PageParamsSchema.parse(props.params);
  let url = dbx.getDownloadUrl(buildFilePath(params));

  return <PageView url={url} />;
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: decodeURIComponent([params.year, params.issue, params.page].join('-')),
  };
}

function buildFilePath(params: z.infer<typeof PageParamsSchema>) {
  return `${config['app.dropbox.root']}/${params.year}/${params.issue}/${params.year}-${params.issue}-${formatPageName(
    params.page,
  )}.pdf`;
}
