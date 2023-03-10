import * as z from 'zod';

export type ThumbnailSize = z.infer<typeof ThumbnailSizeSchema>;
export const ThumbnailSizeSchema = z.union([
  z.literal('w32h32'),
  z.literal('w64h64'),
  z.literal('w128h128'),
  z.literal('w256h256'),
  z.literal('w480h320'),
  z.literal('w640h480'),
  z.literal('w960h640'),
  z.literal('w1024h768'),
  z.literal('w2048h1536'),
]);

export type Metadata = z.infer<typeof MetadataSchema>;
export const MetadataSchema = z.object({
  id: z.string(),
  path_lower: z.string(),
  preview_url: z.string().optional(),
});

export type FileMetadataReference = z.infer<typeof FileMetadataReferenceSchema>;
export const FileMetadataReferenceSchema = MetadataSchema.extend({ '.tag': z.literal('file') });

export type FolderMetadataReference = z.infer<typeof FolderMetadataReferenceSchema>;
export const FolderMetadataReferenceSchema = MetadataSchema.extend({ '.tag': z.literal('folder') });

export type ListFolderArgs = z.infer<typeof ListFolderArgsSchema>;
export const ListFolderArgsSchema = z.object({
  path: z.string(),
});

export type ListFolderResult = z.infer<typeof ListFolderResultSchema>;
export const ListFolderResultSchema = z.object({
  entries: z.union([FileMetadataReferenceSchema, FolderMetadataReferenceSchema]).array(),
  cursor: z.string(),
  has_more: z.boolean(),
});

export type Name = z.infer<typeof NameSchema>;
export const NameSchema = z.object({
  given_name: z.string(),
  surname: z.string(),
  familiar_name: z.string(),
  display_name: z.string(),
  abbreviated_name: z.string(),
});

export type RootInfo = z.infer<typeof RootInfoSchema>;
export const RootInfoSchema = z.object({
  root_namespace_id: z.string(),
  home_namespace_id: z.string(),
});

export type FullAccount = z.infer<typeof FullAccountSchema>;
export const FullAccountSchema = z.object({
  account_id: z.string(),
  name: NameSchema,
  email: z.string().email(),
  profile_photo_url: z.string().url().optional(),
  root_info: RootInfoSchema,
});
