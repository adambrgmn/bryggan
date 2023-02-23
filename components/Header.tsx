'use client';

import * as Menu from '@reach/menu-button';
import classNames from 'classnames';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useState } from 'react';
import type { RectReadOnly } from 'react-use-measure';
import useMeasure from 'react-use-measure';

import { config } from '@/lib/config';

import { Breadcrumbs } from './Breadcrumbs';

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
  let [image, setImage] = useState<string | undefined>(() => {
    let avatarFallback = new URL(hashedEmail, 'https://www.gravatar.com/avatar/');
    avatarFallback.searchParams.set('s', '24');

    return profile.image ?? avatarFallback.toString();
  });

  return (
    <header ref={ref} className="sticky top-0 z-10 flex justify-between border-b bg-white px-6 py-2">
      <div className="flex items-center gap-1 text-sm">
        <h1 className="font-semibold">
          <Link href={config['route.app']}>Bryggan</Link>
        </h1>
        <Breadcrumbs />
      </div>

      <div className="flex items-center">
        <Menu.Menu>
          <Menu.MenuButton className="rounded-full border p-0.5" aria-label="User actions">
            {image ? (
              <Image
                src={image}
                alt=""
                className="h-6 w-6 rounded-full"
                aria-hidden
                width={24}
                height={24}
                onError={() => setImage(undefined)}
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-400" />
            )}
          </Menu.MenuButton>
          <Menu.MenuPopover className="z-10 mt-1 w-40 rounded border bg-white shadow">
            <div className="border-b py-2">
              <p className="px-2 text-xs">
                Signed in as <br />
                <strong className="font-medium">{profile.name}</strong>
              </p>
            </div>

            <Menu.MenuItems className="flex flex-col border-0 bg-transparent p-0 py-2 text-xs">
              <MenuLink href="/tidningen/settings">Settings</MenuLink>
              <MenuItem destructive onSelect={() => signOut()}>
                Sign out
              </MenuItem>
            </Menu.MenuItems>
          </Menu.MenuPopover>
        </Menu.Menu>
      </div>
    </header>
  );
};

type MenuItemProps<T> = T & {
  destructive?: boolean;
  children: React.ReactNode;
};

const menuItemClassName = (destructive?: boolean) => {
  return classNames({
    'px-2 py-1': true,
    'hover:bg-blue-500 hover:text-white selected:bg-blue-500 selected:text-white': !destructive,
    'text-red-500 hover:bg-red-500 hover:text-white': destructive,
  });
};

const MenuItem: React.FC<MenuItemProps<{ onSelect: () => void }>> = ({ onSelect, destructive, children }) => {
  return (
    <Menu.MenuItem onSelect={onSelect} className={menuItemClassName(destructive)}>
      {children}
    </Menu.MenuItem>
  );
};

const MenuLink: React.FC<MenuItemProps<{ href: string }>> = ({ href, destructive, children }) => {
  return (
    <Menu.MenuLink as={Link} href={href} className={menuItemClassName(destructive)}>
      {children}
    </Menu.MenuLink>
  );
};
