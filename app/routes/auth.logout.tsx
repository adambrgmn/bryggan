import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { config } from '~/config';
import { authenticator } from '~/services/auth.server';

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: config['route.login'] });
};

export let action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: config['route.login'] });
};
