import { IssuePreviewGrid } from '@/components/PreviewGrid';

import { SectionTitle } from './SectionTitle';

// export async function loader({ request }: DataFunctionArgs) {
//   let [dbx] = await DropboxClient.fromRequest(request);

//   let { result: rootFolder } = await dbx.listFolder({ path: '/' });
//   let yearFolders = rootFolder.entries
//     .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
//     .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

//   let years: Years[] = await Promise.all(
//     yearFolders.map(async (folder) => {
//       let { result: year } = await dbx.listFolder({ path: folder.path_lower ?? '' });
//       let issues = year.entries
//         .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
//         .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0)
//         .map<PreviewGridItem>((entry) => ({
//           id: entry.id,
//           name: entry.name,
//           href: `./${folder.name}/${entry.name}`,
//           previewUrl: entry.preview_url ?? '',
//           previewPath: entry.path_lower ?? '',
//         }));

//       return {
//         year: folder.name,
//         items: issues,
//       };
//     }),
//   );

//   return { years };
// }

export default function Page() {
  let data = { years: [] as any };

  return (
    <div>
      {/* @ts-expect-error */}
      {data.years.map((year) => (
        <section key={year.year} className="relative mb-12">
          <SectionTitle year={year.year}>{year.year}</SectionTitle>
          <IssuePreviewGrid items={year.items} />
        </section>
      ))}
    </div>
  );
}
