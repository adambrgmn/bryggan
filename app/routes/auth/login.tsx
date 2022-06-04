import type { ActionFunction } from '@remix-run/node';

import { authenticator } from '~/services/auth.server';

export let action: ActionFunction = async ({ request }) => {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate('dropbox', request, {
    successRedirect: '/',
    failureRedirect: '/',
  });
};
