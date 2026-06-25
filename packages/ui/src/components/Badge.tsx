import * as React from 'react'
import { cn } from '../lib/utils'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'muted'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-text-muted border border-border',
  accent: 'bg-accent/12 text-accent border border-accent/25',
  success: 'bg-success/12 text-success border border-success/25',
  warning: 'bg-warning/12 text-warning border border-warning/25',
  error: 'bg-error/12 text-error border border-error/25',
  info: 'bg-info/12 text-info border border-info/25',
  muted: 'bg-surface-2 text-text-faint border border-border',
}

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-text-muted',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  muted: 'bg-text-faint',
}

export function Badge({ className, variant = 'default', dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} />}
      {children}
    </span>
  )
}
