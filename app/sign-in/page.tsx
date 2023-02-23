import { ClientSafeProvider, getCsrfToken, getProviders } from 'next-auth/react';

import { config } from '@/lib/config';
import { compact } from '@/lib/utils/array';
import { ensure } from '@/lib/utils/assert';

export default async function SignIn() {
  let csrf = ensure(await getCsrfToken(), 'CSRF token not returned from server');
  let providers = ensure(await getProviders(), 'Providers not returned from server');

  let sections = compact(
    Object.values(providers).flatMap((provider) => {
      let divider = <Divider key={provider.id + '_divider'} />;
      switch (provider.type) {
        case 'credentials':
          return [<Credentials key={provider.id} provider={provider} csrf={csrf} />, divider];
        case 'email':
          return null;
        case 'oauth':
          return [<OAuthForm key={provider.id} provider={provider} csrf={csrf} />, divider];
      }
    }),
  ).slice(0, -1);

  return (
    <main className="mt-24 flex items-center justify-center">
      <div className="w-80">{sections}</div>
    </main>
  );
}

function OAuthForm({ provider, csrf }: { provider: ClientSafeProvider; csrf: string }) {
  return (
    <Form action={provider.signinUrl} csrf={csrf}>
      <button type="submit" className="button">
        Logga in med {provider.name}
      </button>
    </Form>
  );
}

function Credentials({ provider, csrf }: { provider: ClientSafeProvider; csrf: string }) {
  if (provider.id !== 'refresh_token') return null;

  return (
    <Form action={provider.signinUrl} csrf={csrf}>
      <label>
        <span>Token</span>
        <input id="refresh_token" type="password" name="refresh_token" required min={5} />
      </label>
      <button type="submit" className="button">
        Logga in
      </button>
    </Form>
  );
}

function Form({ action, csrf, children }: React.PropsWithChildren<{ action: string; csrf: string }>) {
  return (
    <form action={action} method="POST" className="contents">
      <input type="hidden" name="csrfToken" value={csrf} />
      <input type="hidden" name="callbackUrl" value={config['route.app']} />
      {children}
    </form>
  );
}

function Divider() {
  return <hr />;
}
