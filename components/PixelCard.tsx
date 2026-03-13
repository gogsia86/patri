import { type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PixelCardProps = {
  title?: string;
  className?: string;
  padded?: boolean;
  children: ReactNode;
};

export default function PixelCard({
  title,
  className,
  padded = true,
  children,
}: Readonly<PixelCardProps>) {
  return (
    <article className={cn('px-panel', padded ? 'p-4' : '', className)}>
      {title ? <h3 className="mb-3 text-2xl text-[var(--accent2)]">{title}</h3> : null}
      {children}
    </article>
  );
}
