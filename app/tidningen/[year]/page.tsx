import { IssuePreviewGrid } from '@/components/PreviewGrid';

// export const meta: MetaFunction<typeof loader> = (args) => {
//   return {
//     title: `${args.params['year']} | Bryggan`,
//   };
// };

// export async function loader({ request, params }: LoaderArgs) {
//   try {
//     let [dbx] = await DropboxClient.fromRequest(request);

//     let { result: folder } = await dbx.listFolder({ path: `${params.year}` });
//     let folders = folder.entries
//       .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
//       .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

//     let issues = folders.map<PreviewGridItem>((entry) => ({
//       id: entry.id,
//       name: entry.name,
//       href: `./${entry.name}`,
//       previewUrl: entry.preview_url ?? '',
//       previewPath: entry.path_lower ?? '',
//     }));

//     return { items: issues };
//   } catch {
//     throw new Response('Not found', { status: 404 });
//   }
// }

export default function Page() {
  let data = { items: [] as any };
  return <IssuePreviewGrid items={data.items} />;
}
