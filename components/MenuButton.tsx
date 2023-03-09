'use client';

import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import Link, { LinkProps } from 'next/link';

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
  let avatarEl = (
    <Avatar.Root className="flex aspect-square h-6 w-6 items-center justify-center rounded-full">
      <Avatar.Image className="rounded-full" src={avatar} alt={name} />
      <Avatar.Fallback className="text-xs" delayMs={600}>
        {initials(name)}
      </Avatar.Fallback>
    </Avatar.Root>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full border p-0.5" aria-label={label}>
          {avatarEl}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-10 w-40 rounded border bg-white shadow" sideOffset={5}>
          <DropdownMenu.Group className="py-2">
            <DropdownMenu.Label className="px-2 text-xs">
              Inloggad som <br />
              <strong className="font-medium">{name}</strong>
            </DropdownMenu.Label>
          </DropdownMenu.Group>

          <DropdownMenu.Separator className="border-b" />

          <DropdownMenu.Group className="flex flex-col border-0 bg-transparent p-0 py-2 text-xs">
            {actions.map((action, idx) => {
              if ('href' in action) {
                return (
                  <DropdownMenu.Item asChild key={idx} className={menuItemClassName(action.destructive)}>
                    <Link href={action.href}>{action.label}</Link>
                  </DropdownMenu.Item>
                );
              }

              return (
                <DropdownMenu.Item
                  key={idx}
                  className={menuItemClassName(action.destructive)}
                  onSelect={action.onSelect}
                >
                  {action.label}
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const menuItemClassName = (destructive?: boolean) => {
  return classNames({
    'px-2 py-1': true,
    'hover:bg-blue-500 hover:text-white selected:bg-blue-500 selected:text-white': !destructive,
    'text-red-500 hover:bg-red-500 hover:text-white': destructive,
  });
};

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}
