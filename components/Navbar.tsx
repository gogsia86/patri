"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

import PixelButton from '@/components/PixelButton';
import { cn } from '@/lib/cn';

const links = [
  { href: '/', label: 'Home' },
  { href: '/admin', label: 'Admin' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-zinc-900/90 bg-black/70 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <p className="text-2xl tracking-[0.18em] text-[var(--accent2)]">PATRI</p>
        <nav className="flex gap-2">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <PixelButton
                key={link.href}
                type="button"
                variant="secondary"
                onClick={() => router.push(link.href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative px-3 py-1 text-xl uppercase tracking-widest',
                  active ? 'text-[var(--accent)]' : 'text-zinc-200 hover:text-[var(--accent2)]',
                )}
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 h-[2px] bg-current"
                  initial={false}
                  animate={{ width: active ? '100%' : '0%' }}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }}
                />
              </PixelButton>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
