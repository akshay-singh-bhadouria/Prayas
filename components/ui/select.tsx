import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-ink-200 bg-white/90 px-4 text-sm text-ink-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-1',
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = 'Select';

export { Select };
