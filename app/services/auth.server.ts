import { Authenticator } from 'remix-auth';
import { OAuth2Strategy } from 'remix-auth-oauth2';
import * as z from 'zod';
import { string } from 'zod';

import { sessionStorage } from '~/services/session.server';
import type { User } from '~/types/User';

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

const dropboxClientID = process.env.DROPBOX_CLIENT_ID;
const dropboxClientSecret = process.env.DROPBOX_CLIENT_SECRET;

if (dropboxClientID == null || dropboxClientSecret == null) {
  throw new Error('Missing Dropbox client ID or secret');
}

authenticator.use(
  new OAuth2Strategy(
    {
      authorizationURL: 'https://www.dropbox.com/oauth2/authorize',
      tokenURL: 'https://api.dropboxapi.com/oauth2/token',
      clientID: dropboxClientID,
      clientSecret: dropboxClientSecret,
      callbackURL: 'http://localhost:3000/auth/callback/dropbox',
    },
    async ({ accessToken }) => {
      try {
        let res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'post',
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        let account = AccountSchema.parse(await res.json());

        return {
          id: account.account_id,
          email: account.email,
          name: account.name.display_name,
          avatar: account.profile_photo_url ?? null,
          accessToken: accessToken,
        };
      } catch (error) {
        throw new Error('Could not validate user account');
      }
    },
  ),
  'dropbox',
);

const AccountSchema = z.object({
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
