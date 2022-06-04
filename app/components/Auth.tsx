import { Form } from '@remix-run/react';

export const SignIn: React.FC = () => {
  return (
    <Form method="post" action="/auth/login">
      <button type="submit">Sign in</button>
    </Form>
  );
};

export const SignOut: React.FC = () => {
  return (
    <Form method="post" action="/auth/logout">
      <button type="submit">Sign out</button>
    </Form>
  );
};
