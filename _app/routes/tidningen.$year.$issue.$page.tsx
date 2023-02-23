import type { LinkDescriptor, LoaderArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { PageView } from '_app/components/PageView';
import { config } from '_app/config';
import { DropboxClient } from '_app/services/dropbox.server';
import { formatPageName } from '_app/utils/dropbox';
import reactPdfAnnotationLayerStyles from 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import reactPdfTextLayerStyles from 'react-pdf/dist/esm/Page/TextLayer.css';
import * as z from 'zod';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.coerce.number(),
});

let OutletContextSchema = z.object({ total: z.number().min(1) });

export const meta: MetaFunction<typeof loader> = (args) => {
  return { title: `${args.params['year']}-${args.params['issue']}-${args.params['page']} | Bryggan` };
};

export function links(): LinkDescriptor[] {
  return [
    { rel: 'stylesheet', href: reactPdfTextLayerStyles },
    { rel: 'stylesheet', href: reactPdfAnnotationLayerStyles },
  ];
}

export async function loader(ctx: LoaderArgs) {
  try {
    let [dbx] = await DropboxClient.fromRequest(ctx.request);

    let params = PageParamsSchema.parse(ctx.params);
    let url = dbx.getDownloadUrl(buildFilePath(params));

    return { url, ...params };
  } catch {
    throw redirect('..');
  }
}

export default function Page() {
  let { url, ...params } = useLoaderData<typeof loader>();

  let context = OutletContextSchema.parse(useOutletContext());

  let current = params.page;
  let next: string | undefined = undefined;
  let previous: string | undefined = undefined;

  if (current < context.total) next = formatPageName(current + 1);
  if (current > 1) previous = formatPageName(current - 1);

  return <PageView url={url} next={next} previous={previous} total={context.total} current={current} />;
}

function buildFilePath(params: z.infer<typeof PageParamsSchema>) {
  return `${config['app.dropbox.root']}/${params.year}/${params.issue}/${params.year}-${params.issue}-${formatPageName(
    params.page,
  )}.pdf`;
}
