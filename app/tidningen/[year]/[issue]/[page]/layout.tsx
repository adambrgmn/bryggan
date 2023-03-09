import * as z from 'zod';

import { Dialog } from '@/components/Dialog';
import { PageControls } from '@/components/PageView';
import { DropboxClient } from '@/lib/clients/dropbox';
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

export default async function Layout({ params, children }: React.PropsWithChildren<Props>) {
  let session = await getAuthorizedSession();
  let dbx = DropboxClient.fromSession(session);

  let parsed = PageParamsSchema.parse(params);
  let issue = await dbx.listFiles(join('/', params.year, parsed.issue));

  let current = parsed.page;
  let next = current < issue.length ? formatPageName(current + 1) : undefined;
  let previous = current > 1 ? formatPageName(current - 1) : undefined;

  return (
    <Dialog className="relative flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] items-stretch justify-center overflow-hidden rounded bg-white p-4">
      {children}
      <PageControls next={next} previous={previous} current={current} total={issue.length} />
    </Dialog>
  );
}
