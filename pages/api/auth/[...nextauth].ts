import { AuthOptions } from 'next-auth';
import NextAuth, { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { DropboxAuth } from '@/lib/clients/auth';
import { config } from '@/lib/config';
import { ensure } from '@/lib/utils/assert';

const CLIENT_ID = ensure(process.env.DROPBOX_CLIENT_ID, 'DROPBOX_CLIENT_ID must be defined');
const CLIENT_SECRET = ensure(process.env.DROPBOX_CLIENT_SECRET, 'DROPBOX_CLIENT_SECRET must be defined');

const auth = new DropboxAuth(CLIENT_ID, CLIENT_SECRET);

const options: AuthOptions = {
  providers: [auth.oAuthProvider(), auth.credentialsProvider()],
  pages: {
    signIn: config['route.signin'],
    error: config['route.signin'],
  },
  callbacks: {
    jwt: auth.jwt,
    session: auth.session,
  },
  events: {
    signIn: auth.onSignIn,
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
    pathRoot: string;
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    pathRoot: string;
  }
}
