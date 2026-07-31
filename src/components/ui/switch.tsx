'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-slate-300 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:border-slate-600 dark:data-[state=unchecked]:bg-slate-700',
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        xs: 'h-4 w-7',
        xxs: 'h-3.5 w-6',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full border border-slate-300/80 bg-white shadow-sm ring-0 transition-transform data-[state=unchecked]:translate-x-0 dark:border-slate-500 dark:bg-slate-100',
  {
    variants: {
      size: {
        default:
          'h-5 w-5 data-[state=checked]:translate-x-5',
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        xs: 'h-3 w-3 data-[state=checked]:translate-x-3',
        xxs: 'h-2.5 w-2.5 data-[state=checked]:translate-x-2.5',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(switchThumbVariants({ size }))} />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch, switchVariants };
