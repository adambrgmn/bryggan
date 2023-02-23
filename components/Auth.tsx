import { config } from '@/lib/config';

export const SignIn: React.FC = () => {
  return (
    <form method="post" action={config['route.login']}>
      <button type="submit">Sign in</button>
    </form>
  );
};

export const SignOut: React.FC = () => {
  return (
    <form method="post" action={config['route.logout']}>
      <button type="submit">Sign out</button>
    </form>
  );
};
