import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type PixelInputProps = InputHTMLAttributes<HTMLInputElement>;

const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(function PixelInput(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'px-border w-full bg-black/70 px-3 py-2 text-[var(--termGreen)] placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[var(--accent)]',
        className,
      )}
      {...props}
    />
  );
});

export default PixelInput;
