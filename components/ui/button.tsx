import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', type = 'button', ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50',
          {
            primary:
              'bg-ink-900 text-white shadow-soft hover:-translate-y-[1px] hover:bg-ink-800',
            secondary:
              'bg-saffron-100 text-ink-900 hover:-translate-y-[1px] hover:bg-saffron-200',
            ghost:
              'bg-transparent text-ink-800 hover:-translate-y-[1px] hover:bg-ink-100',
            outline:
              'border border-ink-300 text-ink-800 hover:-translate-y-[1px] hover:bg-ink-100'
          }[variant],
          {
            sm: 'h-9 px-4 text-sm',
            md: 'h-11 px-5 text-sm',
            lg: 'h-12 px-6 text-base'
          }[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
