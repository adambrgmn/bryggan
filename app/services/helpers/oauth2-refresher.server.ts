import type { Session, SessionStorage} from '@remix-run/node';
import { redirect } from '@remix-run/node';
import createDebug from 'debug';
import type { Authenticator } from 'remix-auth';

const debug = createDebug('auth:refresher');

export class Oauth2Refresher<User extends RefresherBaseUser> {
  #sessionStorage: SessionStorage;
  #authenticator: Authenticator<User>;
  #clientID: string;
  #clientSecret: string;
  #tokenURL: string;
  #callbackURL: string;

  constructor(options: Oauth2RefresherOptions<User>) {
    this.#sessionStorage = options.sessionStorage;
    this.#authenticator = options.authenticator;
    this.#tokenURL = options.tokenURL;
    this.#clientID = options.clientID;
    this.#clientSecret = options.clientSecret;
    this.#callbackURL = options.callbackURL;
  }

  async checkTokenExpiry(request: Request, user?: User | undefined | null): Promise<void> {
    if (user == null) {
      debug('No user provided as argument, fetching from session.');
      [user] = await this.#getSession(request);
    }

    if (user == null) {
      debug('No user found in session, ignoring.');
      return;
    }

    let requestUrl = new URL(request.url);
    let force = process.env.NODE_ENV !== 'production' && requestUrl.searchParams.get('force_refresh') != null;
    debug('Force refresh: %s', force);

    if (user.expiryDate < Date.now() || force) {
      let params = new URLSearchParams({ redirect_uri: requestUrl.pathname });
      debug(
        'User token expired, redirecting to %s. Params: %O',
        this.#callbackURL,
        Object.fromEntries(params.entries()),
      );
      throw redirect(this.#callbackURL + '?' + params.toString());
    }

    debug('Token still valid: %s', user.accessToken);
    debug('Token valid until: %s', new Date(user.expiryDate));
  }

  async refresh(request: Request, options: RefreshOptions): Promise<Response> {
    try {
      let [user, session] = await this.#getSession(request);

      let requestUrl = new URL(request.url);
      let redirectUri = requestUrl.searchParams.get('redirect_url') ?? '/';

      if (user == null) {
        debug('No user found in session, ignoring.');
        debug('Redirecting to %s', redirectUri);
        return redirect(redirectUri);
      }

      let body = new URLSearchParams();
      body.append('grant_type', 'refresh_token');
      body.append('refresh_token', user.refreshToken);

      let headers = new Headers();
      let auth = Buffer.from(`${this.#clientID}:${this.#clientSecret}`).toString('base64');
      headers.append('Authorization', `Basic ${auth}`);
      headers.append('Content-Type', 'application/x-www-form-urlencoded');

      let refreshResponse = await fetch(this.#tokenURL, {
        method: 'POST',
        body,
        headers,
      });

      let refreshData = (await refreshResponse.json()) as RefreshResponse;
      debug('Refresh response: %O', refreshData);

      let updatedUser: User = {
        ...user,
        accessToken: refreshData.access_token,
        expiryDate: Date.now() + refreshData.expires_in * 1000,
      };

      session.set(this.#authenticator.sessionKey, updatedUser);

      let responseHeaders = new Headers();
      responseHeaders.append('Set-Cookie', await this.#sessionStorage.commitSession(session));

      debug('Previous access token: %s', user.accessToken);
      debug('Updated access token: %s', updatedUser.accessToken);

      debug('Refresh performed');
      debug('Redirecting to %s', redirectUri);
      return redirect(redirectUri, { headers: responseHeaders });
    } catch (error) {
      debug('Failed to refresh token: %O', error);
      await this.#authenticator.logout(request, { redirectTo: options.failureUrl });
      throw error;
    }
  }

  async #getSession(request: Request): Promise<[User | undefined, Session]> {
    let session = await this.#sessionStorage.getSession(request.headers.get('cookie'));
    let user = session.get(this.#authenticator.sessionKey) as User | undefined;
    return [user, session];
  }
}

interface Oauth2RefresherOptions<User extends RefresherBaseUser> {
  sessionStorage: SessionStorage;
  authenticator: Authenticator<User>;
  tokenURL: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

interface RefresherBaseUser {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

interface RefreshOptions {
  failureUrl: string;
}

interface RefreshResponse {
  toen_type: 'bearer';
  access_token: string;
  expires_in: number;
}
