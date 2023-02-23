import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import * as z from 'zod';

import { PageView } from '@/components/PageView';
import { DropboxClient } from '@/lib/clients/dropbox';
import { config } from '@/lib/config';
import { formatPageName } from '@/lib/utils/dropbox';

let PageParamsSchema = z.object({
  year: z.string(),
  issue: z.string(),
  page: z.coerce.number(),
});

let OutletContextSchema = z.object({ total: z.number().min(1) });

// export const meta: MetaFunction<typeof loader> = (args) => {
//   return { title: `${args.params['year']}-${args.params['issue']}-${args.params['page']} | Bryggan` };
// };

// export async function loader(ctx: LoaderArgs) {
//   try {
//     let [dbx] = await DropboxClient.fromRequest(ctx.request);

//     let params = PageParamsSchema.parse(ctx.params);
//     let url = dbx.getDownloadUrl(buildFilePath(params));

//     return { url, ...params };
//   } catch {
//     throw redirect('..');
//   }
// }

export default function Page() {
  // let { url, ...params } = useLoaderData<typeof loader>();

  // let context = OutletContextSchema.parse(useOutletContext());

  // let current = params.page;
  // let next: string | undefined = undefined;
  // let previous: string | undefined = undefined;

  // if (current < context.total) next = formatPageName(current + 1);
  // if (current > 1) previous = formatPageName(current - 1);

  // return <PageView url={url} next={next} previous={previous} total={context.total} current={current} />;
  return null;
}

// function buildFilePath(params: z.infer<typeof PageParamsSchema>) {
//   return `${config['app.dropbox.root']}/${params.year}/${params.issue}/${params.year}-${params.issue}-${formatPageName(
//     params.page,
//   )}.pdf`;
// }
