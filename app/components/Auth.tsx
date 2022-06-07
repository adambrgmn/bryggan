import { Form } from '@remix-run/react';

import { config } from '~/config';

export const SignIn: React.FC = () => {
  return (
    <Form method="post" action={config['route.login']}>
      <button type="submit">Sign in</button>
    </Form>
  );
};

export const SignOut: React.FC = () => {
  return (
    <Form method="post" action={config['route.logout']}>
      <button type="submit">Sign out</button>
    </Form>
  );
};
