import { join } from 'node:path';
import process from 'node:process';

import { redirect } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import type { files } from 'dropbox';
import { Dropbox, DropboxAuth } from 'dropbox';
import { z } from 'zod';

import { config } from '~/config';
import {
  GetThumbnailArgsSchema,
  ListFolderArgsSchema,
  ListFolderContinueArgsSchema,
  ListFolderResultSchema,
} from '~/types/Dropbox';
import type { GetThumbnailArgs, ListFolderArgs, ListFolderContinueArgs, ListFolderResult } from '~/types/Dropbox';

import { authenticator } from './auth.server';

const CLIENT_ID = process.env.DROPBOX_CLIENT_ID!;
const CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET!;
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
    secrets: ['s3cr3t'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export type DopboxClientOptions = { clientId: string; clientSecret: string; redirectUri: string };

export class DropboxClient extends Dropbox {
  pathRoot?: string;
  redirectUri: string;
  session?: DropboxSession;

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
    }

    return response;
  }
}

export async function createDropboxClient(request: Request) {
  let user = await authenticator.isAuthenticated(request);
  return new LegacyDropboxClient(user?.accessToken);
}

export class LegacyDropboxClient {
  #accessToken: string | undefined;

  constructor(accessToken?: string) {
    this.#accessToken = accessToken;
  }

  async #rpc(path: string, body: Record<string, unknown>, headersInit: Record<string, string> = {}): Promise<unknown> {
    if (this.#accessToken == null) {
      throw redirect(config['route.logout']);
    }

    let url = new URL(path, 'https://api.dropboxapi.com/2/');

    let headers = new Headers({
      Authorization: `Bearer ${this.#accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
      ...headersInit,
    });

    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.ok && response.status === 200) return response.json();
    if (response.status === 401) throw redirect(config['route.logout']);

    if (process.env.NODE_ENV === 'development') {
      let text = await response.text();
      console.error(text);
    }

    throw new Error(`${response.status} ${response.statusText}`);
  }

  #content(path: string, body: Record<string, unknown>, headersInit: Record<string, string> = {}): Promise<Response> {
    if (this.#accessToken == null) {
      throw new Response('', { status: 401 });
    }

    let url = new URL(path, 'https://content.dropboxapi.com/2/');

    let headers = new Headers({
      Authorization: `Bearer ${this.#accessToken}`,
      'Dropbox-API-Arg': JSON.stringify(body),
      ...headersInit,
    });

    return fetch(url, { method: 'GET', headers });
  }

  async listFolder(args: ListFolderArgs): Promise<ListFolderResult> {
    let { path, recursive = false, limit = 200 } = ListFolderArgsSchema.parse(args);

    let result = await this.#rpc('files/list_folder', {
      path: this.#prependRoot(path),
      recursive,
      limit,
    });

    return ListFolderResultSchema.parse(result);
  }

  async listFolderContinue(args: ListFolderContinueArgs): Promise<ListFolderResult> {
    let { cursor } = ListFolderContinueArgsSchema.parse(args);
    let options = { method: 'POST', body: JSON.stringify({ cursor }) };

    let result = await this.#rpc('files/list_folder/continue', options);
    return ListFolderResultSchema.parse(result);
  }

  getThumbnail(path: string, args: GetThumbnailArgs): Promise<Response> {
    args = GetThumbnailArgsSchema.parse(args);
    let resource = { '.tag': 'path', path: this.#prependRoot(path) };
    return this.#content('files/get_thumbnail_v2', { resource, ...args });
  }

  download(path: string): Promise<Response> {
    path = this.#prependRoot(path);
    return this.#content('files/download', { path });
  }

  #prependRoot(path: string) {
    return join(config['app.dropbox.root'], path);
  }
}
