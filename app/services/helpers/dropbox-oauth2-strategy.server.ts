import createDebug from 'debug';
import type { OAuth2Profile} from 'remix-auth-oauth2';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import * as z from 'zod';

const debug = createDebug('auth:dropbox');

export class DropboxOAuth2Strategy<User> extends OAuth2Strategy<User, OAuth2Profile, DropboxExtraParams> {
  protected async userProfile(accessToken: string): Promise<OAuth2Profile> {
    let response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let account = DropboxAccountSchema.parse(await response.json());
    debug('Dropbox account fetched: %O', account);

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

  protected authorizationParams(params: URLSearchParams): URLSearchParams {
    params.set('token_access_type', 'offline');
    return params;
  }
}

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

type DropboxExtraParams = {
  expires_in: number;
};
