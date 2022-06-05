import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: '/auth/login' });
};

export let action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: '/auth/login' });
};
