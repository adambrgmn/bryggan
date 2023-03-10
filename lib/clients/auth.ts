import { users } from 'dropbox';
import { Account, CallbacksOptions, EventCallbacks, Profile } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import DropboxProvider from 'next-auth/providers/dropbox';
import { z } from 'zod';

import { ensure } from '../utils/assert';
import * as firebase from './firebase';

type JwtCallback = CallbacksOptions<Profile, Account>['jwt'];
type SessionCallback = CallbacksOptions<Profile, Account>['session'];
type SignInEvent = EventCallbacks['signIn'];

export class DropboxAuth {
  #clientId: string;
  #clientSecret: string;

  #urls = {
    www: new URL('https://www.dropbox.com/'),
    api: new URL('https://api.dropboxapi.com/'),
  };

  constructor(clientId: string, clientSecret: string) {
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
  }

  oAuthProvider = () => {
    let authUrl = new URL('/oauth2/authorize', this.#urls.www);
    authUrl.searchParams.set('token_access_type', 'offline');
    authUrl.searchParams.set('scope', ['account_info.read', 'files.content.read'].join(' '));

    return DropboxProvider({
      id: 'dropbox',
      clientId: this.#clientId,
      clientSecret: this.#clientSecret,
      authorization: authUrl.toString(),
      profile: this.#profile.bind(this),
      userinfo: { request: this.#userInfo.bind(this) as unknown as any },
    });
  };

  credentialsProvider = () => {
    return CredentialsProvider({
      name: 'E-mail & password',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: this.#authorize.bind(this),
    });
  };

  jwt: JwtCallback = async ({ token, account, user }) => {
    if (account != null && user != null) {
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
    }

    if (Date.now() < token.expiresAt) return token;
    return this.#refreshToken(token);
  };

  session: SessionCallback = async ({ session, token }) => {
    session.accessToken = token.accessToken;
    session.refreshToken = token.refreshToken;
    session.expiresAt = token.expiresAt;
    session.pathRoot = token.pathRoot;
    session.type = token.type;

    return session;
  };

  onSignIn: SignInEvent = async ({ account }) => {
    if (account?.refresh_token != null) {
      await firebase.updateRefreshToken(account.refresh_token).catch(() => {});
    }
  };

  async #authorize(credentials: unknown) {
    try {
      let { email, password } = CredentialsInput.parse(credentials);

      let { user } = await firebase.signInWithEmailAndPassword(email, password);
      let refreshToken = await firebase.getRefreshToken();
      let { accessToken, expiresAt } = await this.#accessToken(refreshToken);
      let account = await this.#userInfo({ tokens: { access_token: accessToken } }); // await fetchCurrentAccount(accessToken);

      return {
        ...(await this.#profile(account)),
        email,
        name: user.displayName ?? account.name.display_name,
        image: user.photoURL,
        access_token: accessToken,
        expires_at: expiresAt,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (error instanceof z.ZodError) throw new Error('DatabaseIncomplete');
      throw new Error('CredentialsSignin');
    }
  }

  async #userInfo(context: { tokens: { access_token?: string } }) {
    let url = new URL('/2/users/get_current_account', this.#urls.api);
    let headers = new Headers();
    headers.set('Authorization', `Bearer ${context.tokens.access_token}`);

    let res = await fetch(url, { method: 'POST', headers });
    return res.json() as Promise<users.FullAccount>;
  }

  async #profile(account: users.FullAccount) {
    return {
      id: account.account_id,
      email: account.email,
      name: account.name.display_name,
      image: account.profile_photo_url,
      pathRoot: account.root_info.root_namespace_id,
    };
  }

  async #refreshToken(token: JWT) {
    try {
      let fresh = await this.#accessToken(token.refreshToken);
      return { ...token, ...fresh };
    } catch (error) {
      throw new Error('RefreshAccessTokenError');
    }
  }

  async #accessToken(refreshToken: string) {
    let url = new URL('/oauth2/token', this.#urls.api);
    url.searchParams.set('grant_type', 'refresh_token');
    url.searchParams.set('refresh_token', refreshToken);
    url.searchParams.set('client_id', this.#clientId);

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
    if (!response.ok) throw response;

    const tokens = TokenResponse.parse(await response.json());

    let expiresAt = Date.now() + tokens.expires_in * 1000;
    return { accessToken: tokens.access_token, expiresAt };
  }
}

const TokenResponse = z.object({
  access_token: z.string(),
  token_type: z.literal('bearer'),
  expires_in: z.number(),
});

const CredentialsInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
