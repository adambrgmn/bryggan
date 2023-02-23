import { join } from 'node:path';
import process from 'node:process';

import type { files } from 'dropbox';
import { Dropbox, DropboxAuth } from 'dropbox';
import { Session } from 'next-auth';
import { z } from 'zod';

import { config } from '@/lib/config';
import { ensure } from '@/lib/utils/assert';

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
  pathRoot?: string;
  session?: DropboxSession;

  contentUrl = new URL('https://content.dropboxapi.com/2/');

  static fromSession(session: Session) {
    let client = new DropboxClient({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    client.setSession(session);
    return client;
  }

  constructor(options: DopboxClientOptions) {
    let auth = new DropboxAuth(options);
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

  async listFolder(arg: files.ListFolderArg) {
    arg.path = join(config['app.dropbox.root'], decodeURIComponent(arg.path));
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
