import { Authenticator } from 'remix-auth';

import { sessionStorage } from '~/services/session.server';
import type { SessionUser } from '~/types/User';

import { DropboxOAuth2Strategy } from './helpers/dropbox-oauth2-strategy.server';
import { Oauth2Refresher } from './helpers/oauth2-refresher.server';

export let authenticator = new Authenticator<SessionUser>(sessionStorage);
export let refresher = new Oauth2Refresher({
  authenticator,
  sessionStorage,
  tokenURL: 'https://api.dropboxapi.com/oauth2/token',
  clientID: process.env.DROPBOX_CLIENT_ID!,
  clientSecret: process.env.DROPBOX_CLIENT_SECRET!,
  callbackURL: '/auth/refresh',
});

authenticator.use(
  new DropboxOAuth2Strategy(
    {
      authorizationURL: 'https://www.dropbox.com/oauth2/authorize',
      tokenURL: 'https://api.dropboxapi.com/oauth2/token',
      clientID: process.env.DROPBOX_CLIENT_ID!,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET!,
      callbackURL: '/auth/callback/dropbox',
    },
    async ({ accessToken, refreshToken, profile, extraParams }) => {
      return {
        accessToken,
        refreshToken,
        expiryDate: Date.now() + extraParams.expires_in * 1000,
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
