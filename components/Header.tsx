'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { createContext, useContext } from 'react';
import type { RectReadOnly } from 'react-use-measure';
import useMeasure from 'react-use-measure';

import { config } from '@/lib/config';
import { join } from '@/lib/utils/path';

import { Breadcrumbs } from './Breadcrumbs';
import { Sjofartstidningen } from './Icons';
import { MenuButton } from './MenuButton';

interface HeaderContextType {
  ref: (element: HTMLElement | SVGElement | null) => void;
  bounds: RectReadOnly;
}

export const HeaderContext = createContext<HeaderContextType | undefined>(undefined);
export const HeaderProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  let [ref, bounds] = useMeasure();
  return <HeaderContext.Provider value={{ ref, bounds }}>{children}</HeaderContext.Provider>;
};

function useHeaderContext() {
  let ctx = useContext(HeaderContext);
  if (ctx == null) throw new Error('useHeaderBounds is used outside the HeaderProvider');

  return ctx;
}

export function useHeaderBounds() {
  let { bounds } = useHeaderContext();
  return bounds;
}

interface HeaderProps {
  profile: {
    name: string;
    email: string;
    image?: string | null | undefined;
  };
  hashedEmail: string;
}

export const Header: React.FC<HeaderProps> = ({ profile, hashedEmail }) => {
  let { ref } = useHeaderContext();

  let avatarFallback = new URL(hashedEmail, 'https://www.gravatar.com/avatar/');
  avatarFallback.searchParams.set('s', '24');

  let image = profile.image ?? avatarFallback.toString();

  return (
    <header ref={ref} className="sticky top-0 z-10 flex justify-between border-b bg-white px-6 py-2">
      <div className="flex items-center gap-1 text-sm">
        <h1 className="flex items-center gap-2 font-semibold tracking-wide">
          <Sjofartstidningen aria-hidden size={24} />
          <Link href={config['route.app']}>Bryggan</Link>
        </h1>
        <Breadcrumbs />
      </div>

      <div className="flex items-center">
        <MenuButton
          label="Actions"
          name={profile.name}
          avatar={image}
          actions={[
            { label: 'Verktyg', href: join(config['route.app'], '/tools') },
            { label: 'Logga ut', onSelect: signOut, destructive: true },
          ]}
        />
      </div>
    </header>
  );
};
