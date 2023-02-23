'use client';

import { signIn, signOut } from 'next-auth/react';

export const SignIn: React.FC = () => {
  return (
    <button type="button" onClick={() => signIn('dropbox')}>
      Sign in
    </button>
  );
};

export const SignOut: React.FC = () => {
  return (
    <button type="button" onClick={() => signOut()}>
      Sign out
    </button>
  );
};
