import { Inter } from '@next/font/google';
import { Metadata } from 'next';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={['font-sans text-black', inter.variable].join(' ')}>{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  title: { default: 'Bryggan | Sjöfartstidningen', template: '%s | Bryggan' },
};
