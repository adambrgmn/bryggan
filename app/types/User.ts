import * as z from 'zod';

export const ProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().nullable(),
});

export const SessionUserSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiryDate: z.number(),
  profile: ProfileSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;
export type SessionUser = z.infer<typeof SessionUserSchema>;
