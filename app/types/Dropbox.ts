import * as z from 'zod';

import { config } from '~/config';

export const MetadataBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  path_lower: z.string().transform((path) => path.replace(config['app.dropbox.root'], '')),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;
export const FileMetadataSchema = MetadataBaseSchema.extend({
  '.tag': z.literal('file'),
  client_modified: z.string(),
  server_modified: z.string(),
});

export type FolderMetadata = z.infer<typeof FolderMetadataSchema>;
export const FolderMetadataSchema = MetadataBaseSchema.extend({
  '.tag': z.literal('folder'),
});

export type Metadata = z.infer<typeof MetadataSchema>;
export const MetadataSchema = z.union([FileMetadataSchema, FolderMetadataSchema]);

export type ListFolderArgs = z.infer<typeof ListFolderArgsSchema>;
export const ListFolderArgsSchema = z.object({
  path: z.string(),
  recursive: z.boolean().optional(),
  limit: z.number().int().min(1).max(2000).optional(),
});

export type ListFolderResult = z.infer<typeof ListFolderResultSchema>;
export const ListFolderResultSchema = z.object({
  cursor: z.string().nullable().optional(),
  has_more: z.boolean().nullable().optional(),
  entries: z.array(MetadataSchema),
});

export type ListFolderContinueArgs = z.infer<typeof ListFolderContinueArgsSchema>;
export const ListFolderContinueArgsSchema = z.object({ cursor: z.string() });

export type ThumbnailFormat = z.infer<typeof ThumbnailFormatSchema>;
export const ThumbnailFormatSchema = z.union([z.literal('jpeg'), z.literal('png')]);

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

export type ThumbnailMode = z.infer<typeof ThumbnailModeSchema>;
export const ThumbnailModeSchema = z.union([z.literal('strict'), z.literal('bestfit'), z.literal('fitone_bestfit')]);

export type GetThumbnailArgs = z.infer<typeof GetThumbnailArgsSchema>;
export const GetThumbnailArgsSchema = z.object({
  format: ThumbnailFormatSchema.optional(),
  size: ThumbnailSizeSchema.optional(),
  /**
   * `strict` is usually the default, but in our case we more often want `fitone_bestfit` which
   * means the image will be scaled to fit the given width, regardless of the height.
   */
  mode: ThumbnailModeSchema.optional().default('fitone_bestfit'),
});
