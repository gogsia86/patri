import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';

import CrtOverlay from '@/components/CrtOverlay';
import Navbar from '@/components/Navbar';

import '../styles/globals.css';

const pixelFont = VT323({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pixel',
});

export const metadata: Metadata = {
  title: 'PATRI',
  description: 'Dark pixel isometric room builder with loot and local AI',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[var(--bg0)]">
      <body className={`${pixelFont.className} min-h-screen bg-[var(--bg0)] text-zinc-100 antialiased`}>
        <Navbar />
        <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-6 md:px-8">{children}</main>
        <CrtOverlay />
      </body>
    </html>
  );
}
