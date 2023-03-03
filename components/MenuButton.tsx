'use client';

import * as Menu from '@reach/menu-button';
import classNames from 'classnames';
import Image from 'next/image';
import Link, { LinkProps } from 'next/link';
import { useState } from 'react';

type MenuProps = {
  label: string;
  name: string;
  avatar?: string;
  actions: Array<
    | { label: React.ReactNode; destructive?: boolean; href: NonNullable<LinkProps['href']> }
    | { label: React.ReactNode; destructive?: boolean; onSelect: () => void }
  >;
};

export function MenuButton({ label, name, avatar, actions }: MenuProps) {
  const [avatarSrc, setAvatarSrc] = useState(avatar);
  return (
    <Menu.Menu>
      <Menu.MenuButton className="rounded-full border p-0.5" aria-label={label}>
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt=""
            className="h-6 w-6 rounded-full"
            aria-hidden
            width={24}
            height={24}
            onError={() => setAvatarSrc(undefined)}
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-400" />
        )}
      </Menu.MenuButton>
      <Menu.MenuPopover className="z-10 mt-1 w-40 rounded border bg-white shadow">
        <div className="border-b py-2">
          <p className="px-2 text-xs">
            Inloggad som <br />
            <strong className="font-medium">{name}</strong>
          </p>
        </div>

        <Menu.MenuItems className="flex flex-col border-0 bg-transparent p-0 py-2 text-xs">
          {actions.map((action, idx) => {
            if ('href' in action) {
              return (
                <MenuLink key={idx} destructive={action.destructive} href={action.href}>
                  {action.label}
                </MenuLink>
              );
            }

            return (
              <MenuItem key={idx} destructive={action.destructive} onSelect={action.onSelect}>
                {action.label}
              </MenuItem>
            );
          })}
        </Menu.MenuItems>
      </Menu.MenuPopover>
    </Menu.Menu>
  );
}
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

const MenuLink: React.FC<MenuItemProps<{ href: NonNullable<LinkProps['href']> }>> = ({
  href,
  destructive,
  children,
}) => {
  return (
    <Menu.MenuLink as={Link} href={href} className={menuItemClassName(destructive)}>
      {children}
    </Menu.MenuLink>
  );
};
