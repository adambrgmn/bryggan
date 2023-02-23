import { Inter } from '@next/font/google';
import '@reach/dialog/styles.css';
import '@reach/menu-button/styles.css';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className={['font-sans text-black', inter.variable].join(' ')}>{children}</body>
    </html>
  );
}