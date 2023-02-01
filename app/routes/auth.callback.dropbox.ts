import type { LoaderFunction } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';

export let loader: LoaderFunction = async ({ request }) => {
  return await authenticator.authenticate('dropbox', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
};
