import menuButtonStyles from '@reach/menu-button/styles.css';
import type { MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { StrictMode } from 'react';

import styles from './styles/app.css';
import fonts from './styles/fonts.css';

export function links() {
  return [
    { rel: 'stylesheet', href: fonts },
    { rel: 'stylesheet', href: menuButtonStyles },
    { rel: 'stylesheet', href: styles },
  ];
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export default function App() {
  return (
    <StrictMode>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </StrictMode>
  );
}
