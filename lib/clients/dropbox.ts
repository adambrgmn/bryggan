import { Dropbox, DropboxAuth, DropboxResponseError, files } from 'dropbox';
import { Session } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import { config } from '@/lib/config';
import { ensure } from '@/lib/utils/assert';
import { join } from '@/lib/utils/path';

const CLIENT_ID = ensure(process.env.DROPBOX_CLIENT_ID, 'DROPBOX_CLIENT_ID must be defined');
const CLIENT_SECRET = ensure(process.env.DROPBOX_CLIENT_SECRET, 'DROPBOX_CLIENT_SECRET must be defined');

export const DropboxSessionSchema = z.object({
  accessToken: z.string(),
  expiresAt: z.number(),
  refreshToken: z.string(),
  pathRoot: z.string(),
});
export type DropboxSession = z.infer<typeof DropboxSessionSchema>;

export type DopboxClientOptions = { clientId: string; clientSecret: string };

export class DropboxClient extends Dropbox {
  static #cache = new Map<string, DropboxClient>();
  static fromSession(session: Session) {
    let cachedClient = DropboxClient.#cache.get(session.accessToken);
    if (cachedClient) return cachedClient;

    let client = new DropboxClient({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    client.setSession(session);

    DropboxClient.#cache.set(session.accessToken, client);

    return client;
  }

  pathRoot?: string;
  session?: DropboxSession;

  contentUrl = new URL('https://content.dropboxapi.com/2/');

  constructor(options: DopboxClientOptions) {
    let auth = new DropboxAuth({ ...options, fetch: global.fetch });
    super({ auth });
  }

  setSession(session: DropboxSession) {
    DropboxSessionSchema.parse(session);
    this.session = session;

    this.auth.setAccessToken(session.accessToken);
    this.auth.setAccessTokenExpiresAt(new Date(session.expiresAt));
    this.auth.setRefreshToken(session.refreshToken);
    this.pathRoot = JSON.stringify({ '.tag': 'root', root: session.pathRoot });

    return session;
  }

  listFolders = cache(async (path: string) => {
    let { result: folder } = await this.listFolder({ path });
    let folders = folder.entries
      .filter((entry): entry is files.FolderMetadataReference => entry['.tag'] === 'folder')
      .sort((a, b) => b.path_lower?.localeCompare(a.path_lower ?? '') ?? 0);

    return folders;
  });

  listFiles = cache(async (path: string) => {
    let { result: folder } = await this.listFolder({ path });
    let folders = folder.entries
      .filter((entry): entry is files.FileMetadataReference => entry['.tag'] === 'file')
      .sort((a, b) => a.path_lower?.localeCompare(b.path_lower ?? '') ?? 0);

    return folders;
  });

  async listFolder(arg: files.ListFolderArg) {
    try {
      arg.path = join(config['app.dropbox.root'], decodeURIComponent(arg.path));
      let response = await this.filesListFolder(arg);

      for (let entry of response.result.entries) {
        entry.path_lower = entry.path_lower?.replace(config['app.dropbox.root'], '');
        entry.preview_url = this.getPreviewUrl(entry.path_lower ?? '');
      }

      return response;
    } catch (error) {
      console.log(error);
      if (error instanceof DropboxResponseError && error.status === 401) redirect(config['route.signout']);
      notFound();
    }
  }

  getPreviewUrl(path: string) {
    let [year, issue = '01', page = `${year}-${issue}-001.pdf`] = path.replace(/^\//, '').split('/');
    let pathname = join(
      config['app.dropbox.root'],
      decodeURIComponent(year),
      decodeURIComponent(issue),
      decodeURIComponent(page),
    );

    let url = new URL('files/get_thumbnail_v2', this.contentUrl);
    url.searchParams.set('arg', JSON.stringify({ resource: { '.tag': 'path', path: pathname } }));
    url.searchParams.set('authorization', `Bearer ${this.auth.getAccessToken()}`);
    if (this.pathRoot) url.searchParams.set('path_root', this.pathRoot);

    return url.toString();
  }

  getDownloadUrl(path: string) {
    let url = new URL('files/download', this.contentUrl);
    url.searchParams.set('arg', JSON.stringify({ path: decodeURIComponent(path) }));
    url.searchParams.set('authorization', `Bearer ${this.auth.getAccessToken()}`);
    if (this.pathRoot) url.searchParams.set('path_root', this.pathRoot);

    return url.toString();
  }
}
