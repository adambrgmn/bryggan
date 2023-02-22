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
