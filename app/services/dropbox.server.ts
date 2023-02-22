import { join } from 'node:path';
import process from 'node:process';

import { createCookieSessionStorage } from '@remix-run/node';
import type { files } from 'dropbox';
import { Dropbox, DropboxAuth } from 'dropbox';
import { z } from 'zod';

import { config } from '~/config';
import { ensure } from '~/utils/assert';

const CLIENT_ID = ensure(process.env.DROPBOX_CLIENT_ID, 'DROPBOX_CLIENT_ID must be defined');
const CLIENT_SECRET = ensure(process.env.DROPBOX_CLIENT_SECRET, 'DROPBOX_CLIENT_SECRET must be defined');
const SESSION_SECRET = ensure(process.env.DROPBOX_SESSION_SECRET, 'DROPBOX_SESSION_SECRET must be defined');
const REDIRECT_PATH = '/auth/callback/dropbox';

const DropboxSessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().nullable(),
});
export const DropboxSessionSchema = z.object({
  user: DropboxSessionUserSchema,
  accessToken: z.string(),
  expiresAt: z.number(),
  refreshToken: z.string(),
  pathRoot: z.string(),
});
export type DropboxSession = z.infer<typeof DropboxSessionSchema>;

export let storage = createCookieSessionStorage({
  cookie: {
    name: 'bryggan_dropbox',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

export type DopboxClientOptions = { clientId: string; clientSecret: string; redirectUri: string };

export class DropboxClient extends Dropbox {
  pathRoot?: string;
  redirectUri: string;
  session?: DropboxSession;

  contentUrl = new URL('https://content.dropboxapi.com/2/');

  static async fromRequest(req: Request) {
    let client = new DropboxClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: new URL(REDIRECT_PATH, req.url).toString(),
    });
    let session = await storage.getSession(req.headers.get('Cookie'));

    try {
      let data = session.get('dropbox');
      client.setSession(data);
    } catch (error) {}

    return [client, session] as const;
  }

  constructor(options: DopboxClientOptions) {
    let auth = new DropboxAuth(options);
    super({ auth });

    this.redirectUri = options.redirectUri;
  }

  setSession(session: DropboxSession) {
    DropboxSessionSchema.parse(session);
    this.session = session;

    this.auth.setAccessToken(session.accessToken);
    this.auth.setAccessTokenExpiresAt(new Date(session.expiresAt));
    this.auth.setRefreshToken(session.refreshToken);
    this.#setPathRoot(session.pathRoot);

    return session;
  }

  async getAuthenticationUrl() {
    return this.auth.getAuthenticationUrl(this.redirectUri, '', 'code', 'offline');
  }

  async createSessionFromCode(code: string) {
    let { result: token } = await this.auth.getAccessTokenFromCode(this.redirectUri, code);

    this.auth.setAccessToken(token.access_token);
    let { result: account } = await this.usersGetCurrentAccount();

    let session = this.setSession({
      user: {
        id: account.account_id,
        name: account.name.display_name,
        email: account.email,
        avatar: account.profile_photo_url ?? null,
      },
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      pathRoot: account.root_info.root_namespace_id,
    });

    return session;
  }

  async isAuthenticated() {
    try {
      await this.checkUser({});
      return true;
    } catch (error) {
      return false;
    }
  }

  #setPathRoot(namespace: string) {
    this.pathRoot = JSON.stringify({ '.tag': 'root', root: namespace });
  }

  async listFolder(arg: files.ListFolderArg) {
    arg.path = join(config['app.dropbox.root'], arg.path);
    let response = await this.filesListFolder(arg);

    for (let entry of response.result.entries) {
      entry.path_lower = entry.path_lower?.replace(config['app.dropbox.root'], '');
      entry.preview_url = this.getPreviewUrl(entry.path_lower ?? '');
    }

    return response;
  }

  getPreviewUrl(path: string) {
    let [year, issue = '01', page = `${year}-${issue}-001.pdf`] = path.replace(/^\//, '').split('/');
    let pathname = join(config['app.dropbox.root'], year, issue, page);

    let url = new URL('files/get_thumbnail_v2', this.contentUrl);
    url.searchParams.set('arg', JSON.stringify({ resource: { '.tag': 'path', path: pathname } }));
    url.searchParams.set('authorization', `Bearer ${this.auth.getAccessToken()}`);
    if (this.pathRoot) url.searchParams.set('path_root', this.pathRoot);

    return url.toString();
  }

  getDownloadUrl(path: string) {
    let url = new URL('files/download', this.contentUrl);
    url.searchParams.set('arg', JSON.stringify({ path }));
    url.searchParams.set('authorization', `Bearer ${this.auth.getAccessToken()}`);
    if (this.pathRoot) url.searchParams.set('path_root', this.pathRoot);

    return url.toString();
  }
}
