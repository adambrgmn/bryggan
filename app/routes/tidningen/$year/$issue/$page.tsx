import { useOutletContext } from '@remix-run/react';
import * as z from 'zod';

import { PageView } from '~/components';
import { useSafeParams } from '~/hooks';
import { parsePageName } from '~/utils/dropbox';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.string(),
});

let OutletContextSchema = z.object({ total: z.number().min(1) });

export default function Page() {
  let context = OutletContextSchema.parse(useOutletContext());
  let params = useSafeParams(PageParamsSchema);
  let path = `${params.year}/${params.issue}/${params.page}`;

  let current = Number(parsePageName(params.page));
  if (Number.isNaN(current)) current = 1;

  let next: string | undefined = undefined;
  let previous: string | undefined = undefined;

  if (current < context.total) next = buildFileName(current + 1, params);
  if (current > 1) previous = buildFileName(current - 1, params);

  return <PageView path={path} next={next} previous={previous} total={context.total} current={current} />;
}

function buildFileName(next: number, params: z.infer<typeof PageParamsSchema>) {
  return `${params.year}-${params.issue}-${next.toString().padStart(3, '0')}.pdf`;
}
