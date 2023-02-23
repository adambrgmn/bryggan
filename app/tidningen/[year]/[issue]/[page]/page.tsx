import { Metadata } from 'next';
import { Suspense, lazy } from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import * as z from 'zod';

import { DropboxClient } from '@/lib/clients/dropbox';
import { config } from '@/lib/config';
import { formatPageName } from '@/lib/utils/dropbox';
import { join } from '@/lib/utils/path';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.coerce.number(),
});

type Params = { year: string; issue: string; page: string };
type Props = { params: Params };

const PageView = lazy(() => import('@/components/PageView').then(({ PageView }) => ({ default: PageView })));

export default async function Page(props: Props) {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);

  let params = PageParamsSchema.parse(props.params);
  let url = dbx.getDownloadUrl(buildFilePath(params));
  let issue = await dbx.listFiles(join('/', params.year, params.issue));

  let current = params.page;
  let next: string | undefined = undefined;
  let previous: string | undefined = undefined;

  if (current < issue.length) next = formatPageName(current + 1);
  if (current > 1) previous = formatPageName(current - 1);

  return (
    <Suspense fallback={<p>...</p>}>
      <PageView url={url} next={next} previous={previous} total={issue.length} current={current} />
    </Suspense>
  );
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: [params.year, params.issue, params.page].join('-'),
  };
}

function buildFilePath(params: z.infer<typeof PageParamsSchema>) {
  return `${config['app.dropbox.root']}/${params.year}/${params.issue}/${params.year}-${params.issue}-${formatPageName(
    params.page,
  )}.pdf`;
}
