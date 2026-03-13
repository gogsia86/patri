"use client";

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PixelButtonVariant = 'primary' | 'secondary';

type PixelButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children?: ReactNode;
  variant?: PixelButtonVariant;
  loading?: boolean;
};

const variantClasses: Record<PixelButtonVariant, string> = {
  primary:
    'bg-zinc-900 text-[var(--accent)] hover:bg-zinc-800 hover:text-[var(--accent2)] disabled:hover:bg-zinc-900 disabled:hover:text-[var(--accent)]',
  secondary:
    'bg-zinc-950 text-zinc-200 hover:bg-zinc-900 hover:text-[var(--accent)] disabled:hover:bg-zinc-950 disabled:hover:text-zinc-200',
};

export default function PixelButton({
  className = '',
  children,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: PixelButtonProps) {
  const reduceMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={reduceMotion ? undefined : { scale: 1.03, y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95, y: 1 }}
      transition={reduceMotion ? undefined : { type: 'spring', stiffness: 320, damping: 20 }}
      className={cn(
        'px-border inline-flex items-center justify-center gap-2 px-4 py-2 text-lg uppercase tracking-[0.12em] transition-colors disabled:opacity-60',
        variantClasses[variant],
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </motion.button>
  );
}
