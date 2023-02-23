import NextAuth, { AuthOptions, getServerSession as _getServerSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import DropboxProvider from 'next-auth/providers/dropbox';
import { z } from 'zod';

import { ensure } from '@/lib/utils/assert';

const CLIENT_ID = ensure(process.env.DROPBOX_CLIENT_ID, 'DROPBOX_CLIENT_ID must be defined');
const CLIENT_SECRET = ensure(process.env.DROPBOX_CLIENT_SECRET, 'DROPBOX_CLIENT_SECRET must be defined');

let url = new URL('https://www.dropbox.com/oauth2/authorize');
url.searchParams.set('token_access_type', 'offline');
url.searchParams.set('scope', ['account_info.read', 'files.content.read'].join(' '));

const dropbox = DropboxProvider({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  authorization: url.toString(),
  userinfo: {
    async request(context) {
      let headers = new Headers();
      headers.set('Authorization', `Bearer ${context.tokens.access_token}`);

      let res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', { method: 'POST', headers });
      return res.json();
    },
  },
});

const options: AuthOptions = {
  providers: [dropbox],
  callbacks: {
    async jwt({ token, account }) {
      if (account != null) {
        token.accessToken = ensure(account.access_token, 'No access token received from auth endpoint');
        token.refreshToken = ensure(account.refresh_token, 'No refresh token received from auth endpoint');
        token.expiresAt = ensure(account.expires_at, 'No expiry received from auth endpoint') + Date.now();
      }

      if (Date.now() < token.expiresAt) return token;
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;

      return session;
    },
  },
};

export default NextAuth(options);
export const getServerSession = () => _getServerSession(options);

const RefreshToken = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer'),
  expires_in: z.number(),
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    let url = new URL('https://api.dropbox.com/oauth2/token');
    url.searchParams.set('grant_type', 'refresh_token');
    url.searchParams.set('refresh_token', token.refreshToken);
    url.searchParams.set('client_id', CLIENT_ID);

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
    if (!response.ok) throw response;

    const refreshedTokens = RefreshToken.parse(await response.json());

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: 'RefreshAccessTokenError';
  }
}
