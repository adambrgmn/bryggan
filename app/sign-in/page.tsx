'use client';

import { ClientSafeProvider, getCsrfToken, getProviders } from 'next-auth/react';
import { use } from 'react';

import { Dropbox, Sjofartstidningen } from '@/components/Icons';
import { config } from '@/lib/config';
import { compact } from '@/lib/utils/array';
import { ensure } from '@/lib/utils/assert';

const errors: Record<string, string> = {
  Signin: 'Försök logga in igen, eller med ett annat konto.',
  OAuthSignin: 'Försök logga in igen, eller med ett annat konto.',
  OAuthCallback: 'Försök logga in igen, eller med ett annat konto.',
  OAuthCreateAccount: 'Försök logga in igen, eller med ett annat konto.',
  EmailCreateAccount: 'Försök logga in igen, eller med ett annat konto.',
  Callback: 'Försök logga in igen, eller med ett annat konto.',
  OAuthAccountNotLinked: 'För att bekräfta din identited, logga in med samma konto som du använt tidigare.',
  EmailSignin: 'Kunde inte skicka image',
  CredentialsSignin: 'Inloggning misslyckades. Bekräfta att detaljerna är korrekta.',
  SessionRequired: 'Vänligen logga in för att visa sidan.',
  default: 'Kunde inte logga in.',
};

export default function SignIn({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  let csrf = ensure(use(getCsrfToken()), 'No csrf token found');
  let providers = ensure(use(getProviders()), 'No providers found');

  let { error } = searchParams;
  let errorMessage = error != null ? errors[error] ?? errors.default : undefined;

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
    <main className="grid h-screen w-screen grid-cols-2 overflow-hidden">
      <div className="relative flex h-full flex-col items-center justify-center p-8">
        <h1 className="absolute top-8 left-8 flex items-center gap-2 text-lg font-semibold tracking-wide">
          <Sjofartstidningen aria-hidden size={48} /> <span>Bryggan</span>
        </h1>

        <div className="flex w-full max-w-[360px] flex-col items-center gap-12">
          <div className="w-full flex-1">
            <h2 className="mb-1 text-2xl font-semibold">Välkommen till Bryggan</h2>
            <p className="text-sm text-gray-500">Vänligen logga in för att börja använda appen.</p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-8">{sections}</div>

          {errorMessage != null ? (
            <div className="rounded border border-red-300 bg-red-100 p-2">
              <h2 className="mb-1 text-lg font-semibold">Något gick snett</h2>
              <p className="text-sm text-gray-500">{errorMessage}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="bg-gray-200"></div>
    </main>
  );
}

const icons = {
  dropbox: <Dropbox className="text-dropbox" />,
} as Record<ClientSafeProvider['id'], JSX.Element | undefined>;

function OAuthForm({ provider, csrf }: { provider: ClientSafeProvider; csrf: string }) {
  return (
    <Form action={provider.signinUrl} csrf={csrf}>
      <button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-1 rounded border border-gray-300 text-sm text-gray-800 hover:bg-gray-50"
      >
        {icons[provider.id]}
        <span>Logga in med {provider.name}</span>
      </button>
    </Form>
  );
}

function Credentials({ provider, csrf }: { provider: ClientSafeProvider; csrf: string }) {
  if (provider.id !== 'refresh_token') return null;

  return (
    <Form action={provider.signinUrl} csrf={csrf}>
      <label className="">
        <span className="text-sm text-gray-700">Token</span>
        <input
          id="refresh_token"
          type="password"
          name="refresh_token"
          required
          min={5}
          className="flex h-10 w-full items-center justify-center gap-1 rounded border border-gray-300 px-2 text-sm text-gray-800 hover:bg-gray-50"
        />
      </label>
      <button type="submit" className="h-10 rounded bg-black text-sm text-white hover:bg-gray-900">
        Logga in
      </button>
    </Form>
  );
}

function Form({ action, csrf, children }: React.PropsWithChildren<{ action: string; csrf: string }>) {
  return (
    <form action={action} method="POST" className="flex flex-col items-stretch gap-4">
      <input type="hidden" name="csrfToken" value={csrf} />
      <input type="hidden" name="callbackUrl" value={config['route.app']} />
      {children}
    </form>
  );
}

function Divider() {
  let hr = <hr className="w-full border-current" />;
  return (
    <div className="relative flex h-6 items-center gap-4 text-gray-300">
      {hr}
      <span className="text-gray-400">eller</span>
      {hr}
    </div>
  );
}
