import dialogStyles from '@reach/dialog/styles.css';
import menuButtonStyles from '@reach/menu-button/styles.css';
import reactPdfStyles from 'react-pdf/dist/esm/Page/TextLayer.css';
import type { HtmlMetaDescriptor, LinkDescriptor } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { StrictMode } from 'react';

import styles from './styles/app.css';
import fonts from './styles/fonts.css';

export function links(): LinkDescriptor[] {
  return [
    { rel: 'stylesheet', href: fonts },
    { rel: 'stylesheet', href: menuButtonStyles },
    { rel: 'stylesheet', href: dialogStyles },
    { rel: 'stylesheet', href: reactPdfStyles },
    { rel: 'stylesheet', href: styles },
  ];
}

export function meta(): HtmlMetaDescriptor {
  return {
    charset: 'utf-8',
    title: 'Bryggan | Sjöfartstidningen',
    viewport: 'width=device-width,initial-scale=1',
  };
}

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
