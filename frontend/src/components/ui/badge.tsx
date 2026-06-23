import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border bg-background text-foreground',
  success: 'bg-emerald-500/12 text-emerald-700',
  warning: 'bg-amber-500/14 text-amber-700',
  destructive: 'bg-rose-500/12 text-rose-700',
};

export function Badge({ className, variant = 'default', ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.02em] transition-colors',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
