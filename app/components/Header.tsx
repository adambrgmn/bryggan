import * as Menu from '@reach/menu-button';
import { Link } from '@remix-run/react';
import classNames from 'classnames';

import { config } from '~/config';
import type { Profile } from '~/types/User';

import { Breadcrumbs } from './Breadcrumbs';

interface HeaderProps {
  profile: Profile;
}

export const Header: React.FC<HeaderProps> = ({ profile }) => {
  return (
    <header className="flex justify-between px-4 py-2 sticky top-0 z-10 border-b bg-white">
      <div className="flex gap-1 items-center text-sm">
        <h1 className="font-semibold">
          <Link to=".">Bryggan</Link>
        </h1>
        <Breadcrumbs />
      </div>

      <div className="flex items-center">
        <Menu.Menu>
          <Menu.MenuButton className="rounded-full border p-0.5" aria-label="User actions">
            <img src={profile.avatar ?? ''} className="h-6 w-6 rounded-full" alt="" aria-hidden />
          </Menu.MenuButton>
          <Menu.MenuPopover className="z-10 mt-1 bg-white border rounded shadow w-40">
            <div className="py-2 border-b">
              <p className="text-xs px-2">
                Signed in as <br />
                <strong className="font-medium">{profile.name}</strong>
              </p>
            </div>

            <Menu.MenuItems className="flex flex-col text-xs py-2">
              <MenuLink to="settings">Settings</MenuLink>
              <MenuLink to={config['route.logout']} destructive>
                Sign out
              </MenuLink>
            </Menu.MenuItems>
          </Menu.MenuPopover>
        </Menu.Menu>
      </div>
    </header>
  );
};

const MenuLink: React.FC<{ to: string; destructive?: boolean; children: React.ReactNode }> = ({
  to,
  destructive,
  children,
}) => {
  let className = classNames({
    'px-2 py-1': true,
    'hover:bg-blue-500 hover:text-white': !destructive,
    'text-red-500 hover:bg-red-500 hover:text-white': destructive,
  });
  return (
    <Menu.MenuLink as={Link} to={to} className={className}>
      {children}
    </Menu.MenuLink>
  );
};
