import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';
import * as z from 'zod';

import { PageView } from '~/components/PageView';
import { useSafeParams } from '~/hooks/use-safe-params';
import { formatPageName } from '~/utils/dropbox';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.coerce.number(),
});

let OutletContextSchema = z.object({ total: z.number().min(1) });

export const meta: MetaFunction<typeof loader> = (args) => {
  return { title: `${args.params['year']}-${args.params['issue']}-${args.params['page']} | Bryggan` };
};

export async function loader(ctx: LoaderArgs) {
  try {
    PageParamsSchema.parse(ctx.params);
    return {};
  } catch {
    throw redirect('..');
  }
}

export default function Page() {
  let context = OutletContextSchema.parse(useOutletContext());
  let params = useSafeParams(PageParamsSchema);
  let path = buildFileName(params);

  let current = params.page;
  let next: string | undefined = undefined;
  let previous: string | undefined = undefined;

  if (current < context.total) next = formatPageName(current + 1);
  if (current > 1) previous = formatPageName(current - 1);

  return <PageView path={path} next={next} previous={previous} total={context.total} current={current} />;
}

function buildFileName(params: z.infer<typeof PageParamsSchema>) {
  return `${params.year}/${params.issue}/${params.year}-${params.issue}-${formatPageName(params.page)}.pdf`;
}
