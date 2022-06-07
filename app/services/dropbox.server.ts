import { join } from 'node:path';
import process from 'node:process';

import { redirect } from '@remix-run/node';

import { config } from '~/config';
import {
  GetThumbnailArgsSchema,
  ListFolderArgsSchema,
  ListFolderContinueArgsSchema,
  ListFolderResultSchema,
} from '~/types/Dropbox';
import type {
  FileMetadata,
  FolderMetadata,
  GetThumbnailArgs,
  ListFolderArgs,
  ListFolderContinueArgs,
  ListFolderResult,
} from '~/types/Dropbox';

import { authenticator } from './auth.server';

export async function createDropboxClient(request: Request) {
  let user = await authenticator.isAuthenticated(request);
  return new DropboxClient(user?.accessToken);
}

export class DropboxClient {
  #accessToken: string | undefined;

  constructor(accessToken?: string) {
    this.#accessToken = accessToken;
  }

  async #rpc(path: string, body: Record<string, unknown>, headersInit: Record<string, string> = {}): Promise<unknown> {
    if (this.#accessToken == null) {
      console.log('NO ACCESS TOKEN');
      throw redirect(config['route.logout']);
    }

    let url = new URL(path, 'https://api.dropboxapi.com/2/');

    let headers = new Headers({
      Authorization: `Bearer ${this.#accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
      ...headersInit,
    });

    let response = await fetch(url.toString(), {
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
      console.log('NO ACCESS TOKEN');
      throw new Response('', { status: 401 });
    }

    let url = new URL(path, 'https://content.dropboxapi.com/2/');

    let headers = new Headers({
      Authorization: `Bearer ${this.#accessToken}`,
      'Dropbox-API-Arg': JSON.stringify(body),
      ...headersInit,
    });

    return fetch(url.toString(), { method: 'GET', headers });
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

  #prependRoot(path: string) {
    return join(config['app.dropbox.root'], path);
  }
}
