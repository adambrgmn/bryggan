import { useOutletContext } from '@remix-run/react';
import * as z from 'zod';

import { PageView } from '~/components';
import { useSafeParams } from '~/hooks';
import { formatPageName } from '~/utils/dropbox';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.string().transform((val, ctx) => {
    const parsed = parseInt(val);

    if (Number.isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Not a number',
      });
    }

    return parsed;
  }),
});

let OutletContextSchema = z.object({ total: z.number().min(1) });

export default function Page() {
  let context = OutletContextSchema.parse(useOutletContext());
  let params = useSafeParams(PageParamsSchema);
  let path = buildFileName(params);

  let current = Number(params.page);
  if (Number.isNaN(current)) current = 1;

  let next: string | undefined = undefined;
  let previous: string | undefined = undefined;

  if (current < context.total) next = formatPageName(current + 1);
  if (current > 1) previous = formatPageName(current - 1);

  return <PageView path={path} next={next} previous={previous} total={context.total} current={current} />;
}

function buildFileName(params: z.infer<typeof PageParamsSchema>) {
  return `${params.year}/${params.issue}/${params.year}-${params.issue}-${formatPageName(params.page)}.pdf`;
}
