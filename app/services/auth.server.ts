import { Authenticator } from 'remix-auth';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import type { OAuth2Profile } from 'remix-auth-oauth2';
import * as z from 'zod';

import { sessionStorage } from '~/services/session.server';
import type { SessionUser } from '~/types/User';

const dropboxClientID = process.env.DROPBOX_CLIENT_ID;
const dropboxClientSecret = process.env.DROPBOX_CLIENT_SECRET;

if (dropboxClientID == null || dropboxClientSecret == null) {
  throw new Error('Missing Dropbox client ID or secret');
}

export let authenticator = new Authenticator<SessionUser>(sessionStorage);

class DropboxOAuth2Strategy<ExtraParams extends Record<string, any> = Record<string, never>> extends OAuth2Strategy<
  SessionUser,
  OAuth2Profile,
  ExtraParams
> {
  protected async userProfile(accessToken: string, _: ExtraParams): Promise<OAuth2Profile> {
    let response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let account = DropboxAccountSchema.parse(await response.json());

    return {
      provider: 'dropbox',
      id: account.account_id,
      displayName: account.name.display_name,
      name: {
        familyName: account.name.surname,
        givenName: account.name.given_name,
      },
      emails: [{ value: account.email }],
      photos: account.profile_photo_url != null ? [{ value: account.profile_photo_url }] : [],
    };
  }
}

authenticator.use(
  new DropboxOAuth2Strategy(
    {
      authorizationURL: 'https://www.dropbox.com/oauth2/authorize',
      tokenURL: 'https://api.dropboxapi.com/oauth2/token',
      clientID: dropboxClientID,
      clientSecret: dropboxClientSecret,
      callbackURL: 'http://localhost:3000/auth/callback/dropbox',
    },
    async ({ accessToken, profile }) => {
      return {
        accessToken: accessToken,
        profile: {
          id: profile.id ?? '',
          email: profile.emails?.[0].value ?? '',
          name: profile.displayName ?? '',
          avatar: profile.photos?.[0].value ?? null,
        },
      };
    },
  ),
  'dropbox',
);

const DropboxAccountSchema = z.object({
  account_id: z.string(),
  name: z.object({
    given_name: z.string(),
    surname: z.string(),
    familiar_name: z.string(),
    display_name: z.string(),
    abbreviated_name: z.string(),
  }),
  email: z.string(),
  profile_photo_url: z.string().nullable().optional(),
});
