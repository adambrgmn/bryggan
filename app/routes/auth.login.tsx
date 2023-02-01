import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { SignIn } from '~/components/Auth';
import { authenticator } from '~/services/auth.server';

export default function Screen() {
  return <SignIn />;
}

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, { successRedirect: '/' });
  return {};
};

export let action: ActionFunction = async ({ request }) => {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate('dropbox', request, {
    successRedirect: '/',
    failureRedirect: '/',
  });
};
