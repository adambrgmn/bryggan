import { files } from 'dropbox';
import { Session } from 'next-auth';
import { cache } from 'react';
import { z } from 'zod';

import { config } from '@/lib/config';
import { join } from '@/lib/utils/path';

export const DropboxSessionSchema = z.object({
  accessToken: z.string(),
  expiresAt: z.number(),
  refreshToken: z.string(),
  pathRoot: z.string(),
});
export type DropboxSession = z.infer<typeof DropboxSessionSchema>;

export type DopboxClientOptions = { clientId: string; clientSecret: string };

export class DropboxClient {
  static #cache = new Map<string, DropboxClient>();
  static fromSession(session: Session) {
    let cachedClient = DropboxClient.#cache.get(session.accessToken);
    if (cachedClient) return cachedClient;

    let client = new DropboxClient(session);
    DropboxClient.#cache.set(session.accessToken, client);

    return client;
  }

  #session: Session;
  #pathRoot: string;
  #contentUrl = new URL('https://content.dropboxapi.com/2/');
  #apiUrl = new URL('https://api.dropboxapi.com/2/');

  constructor(session: Session) {
    this.#session = session;
    this.#pathRoot = JSON.stringify({ '.tag': 'root', root: session.pathRoot });
  }

  async #api(pathname: string, body: unknown) {
    let url = new URL(pathname, this.#apiUrl);
    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${this.#session.accessToken}`,
        'Content-Type': 'application/json',
        'Dropbox-API-Path-Root': this.#pathRoot,
      },
    });

    if (response.ok) return response.json() as unknown;

    console.error('Body', body);
    console.error('Response', await response.json());
    throw response;
  }

  listFolders = cache(async (path: string) => {
    let folder = await this.#listFolder({ path });
    let folders = folder.entries
      .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
      .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

    return folders;
  });

  listFiles = cache(async (path: string) => {
    let folder = await this.#listFolder({ path });
    let folders = folder.entries
      .filter((entry): entry is files.FileMetadataReference => entry['.tag'] === 'file')
      .sort((a, b) => a.path_lower?.localeCompare(b.path_lower ?? '') ?? 0);

    return folders;
  });

  async #listFolder(arg: files.ListFolderArg) {
    arg.path = join(config['app.dropbox.root'], decodeURIComponent(arg.path));
    let response = (await this.#api('files/list_folder', arg)) as files.ListFolderResult;

    for (let entry of response.entries) {
      entry.path_lower = entry.path_lower?.replace(config['app.dropbox.root'], '');
      entry.preview_url = this.getPreviewUrl(entry.path_lower ?? '');
    }

    return response;
  }

  getPreviewUrl(path: string) {
    let [year, issue = '01', page = `${year}-${issue}-001.pdf`] = path.replace(/^\//, '').split('/');
    let pathname = join(
      config['app.dropbox.root'],
      decodeURIComponent(year),
      decodeURIComponent(issue),
      decodeURIComponent(page),
    );

    let url = new URL('files/get_thumbnail_v2', this.#contentUrl);
    url.searchParams.set('arg', JSON.stringify({ resource: { '.tag': 'path', path: pathname } }));
    url.searchParams.set('authorization', `Bearer ${this.#session.accessToken}`);
    if (this.#pathRoot) url.searchParams.set('path_root', this.#pathRoot);

    return url.toString();
  }

  getDownloadUrl(path: string) {
    let url = new URL('files/download', this.#contentUrl);
    url.searchParams.set('arg', JSON.stringify({ path: decodeURIComponent(path) }));
    url.searchParams.set('authorization', `Bearer ${this.#session.accessToken}`);
    if (this.#pathRoot) url.searchParams.set('path_root', this.#pathRoot);
    return url.toString();
  }
}
