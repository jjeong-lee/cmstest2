import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type AlertVariant = 'default' | 'destructive' | 'success';

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  default: 'border-border bg-card text-card-foreground',
  destructive: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export function Alert({ className, variant = 'default', ...props }: Props) {
  return <div className={cn('rounded-lg border px-4 py-3 text-sm', variantClasses[variant], className)} {...props} />;
}
