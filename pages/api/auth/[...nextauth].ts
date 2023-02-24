import { users } from 'dropbox';
import { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import NextAuth, { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import DropboxProvider from 'next-auth/providers/dropbox';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { config } from '@/lib/config';
import { ensure } from '@/lib/utils/assert';

const CLIENT_ID = ensure(process.env.DROPBOX_CLIENT_ID, 'DROPBOX_CLIENT_ID must be defined');
const CLIENT_SECRET = ensure(process.env.DROPBOX_CLIENT_SECRET, 'DROPBOX_CLIENT_SECRET must be defined');

let url = new URL('https://www.dropbox.com/oauth2/authorize');
url.searchParams.set('token_access_type', 'offline');
url.searchParams.set('scope', ['account_info.read', 'files.content.read'].join(' '));

function profile(account: users.FullAccount) {
  return {
    id: account.account_id,
    email: account.email,
    name: account.name.display_name,
    image: account.profile_photo_url,
    pathRoot: account.root_info.root_namespace_id,
  };
}

const dropbox = DropboxProvider({
  id: 'dropbox',
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  authorization: url.toString(),
  profile,
  userinfo: {
    async request(context) {
      let headers = new Headers();
      headers.set('Authorization', `Bearer ${context.tokens.access_token}`);

      let res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', { method: 'POST', headers });
      return res.json();
    },
  },
});

const credentials = CredentialsProvider({
  id: 'refresh_token',
  name: 'Refresh Token',
  credentials: {
    refresh_token: { label: 'Token', type: 'password' },
  },
  async authorize(credentials) {
    try {
      if (credentials?.refresh_token == null) return null;

      let { accessToken, expiresAt } = await fetchFreshAccessToken(credentials.refresh_token);
      let account = await fetchCurrentAccount(accessToken);

      return {
        ...profile(account),
        access_token: accessToken,
        expires_at: expiresAt,
        refresh_token: credentials.refresh_token,
      };
    } catch (error) {
      throw new Error('CredentialsSignin');
    }
  },
});

const options: AuthOptions = {
  providers: [dropbox, credentials],
  pages: {
    signIn: config['route.signin'],
    error: config['route.signin'],
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account != null && user != null) {
        try {
          token.type = account.type;
          token.accessToken = ensure(account.access_token, 'No access token received from auth endpoint');
          token.refreshToken = ensure(account.refresh_token, 'No refresh token received from auth endpoint');
          token.pathRoot = ensure(user.pathRoot, 'No path root received from user info');
          /**
           * For some reason, can't really find out how, next-auth is giving back an expiry date that is multiplied by
           * 1000 too many times. Usually it should come back as seconds from the provider, so multiplying once should be
           * okey. But somehow by here the value has been multiplied again.
           */
          token.expiresAt = ensure(account.expires_at, 'No expiry received from auth endpoint') / 1000 + Date.now();
        } catch (error) {
          throw error;
        }
      }

      if (Date.now() < token.expiresAt) return token;
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.pathRoot = token.pathRoot;
      session.type = token.type;

      return session;
    },
  },
};

export default NextAuth(options);
export function getSession() {
  return getServerSession(options);
}
export async function getAuthorizedSession() {
  let session = await getSession();
  if (session == null) redirect(config['route.signin']);
  return session;
}

const RefreshToken = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer'),
  expires_in: z.number(),
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    let fresh = await fetchFreshAccessToken(token.refreshToken);
    return { ...token, ...fresh };
  } catch (error) {
    throw new Error('RefreshAccessTokenError');
  }
}

async function fetchFreshAccessToken(refreshToken: string) {
  let url = new URL('https://api.dropbox.com/oauth2/token');
  url.searchParams.set('grant_type', 'refresh_token');
  url.searchParams.set('refresh_token', refreshToken);
  url.searchParams.set('client_id', CLIENT_ID);

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });
  if (!response.ok) throw response;

  const refreshedTokens = RefreshToken.parse(await response.json());

  let expiresAt = Date.now() + refreshedTokens.expires_in * 1000;
  return { accessToken: refreshedTokens.access_token, expiresAt };
}

async function fetchCurrentAccount(accessToken: string) {
  let headers = new Headers();
  headers.set('Authorization', `Bearer ${accessToken}`);

  let res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', { method: 'POST', headers });
  return res.json() as Promise<users.FullAccount>;
}

declare module 'next-auth' {
  interface Profile {
    pathRoot: string;
  }

  interface User {
    name: string;
    email: string;
    pathRoot: string;
  }

  interface Session {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    pathRoot: string;
    type?: string;
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    type?: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    pathRoot: string;
  }
}
