import * as React from 'react'
import { cn } from '../lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-10 px-6 gap-3' : 'py-20 px-8 gap-4',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-faint',
            compact ? 'w-12 h-12' : 'w-16 h-16',
          )}
        >
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <p className={cn('font-medium text-text', compact ? 'text-sm' : 'text-base')}>{title}</p>
        {description && (
          <p className={cn('text-text-muted leading-relaxed', compact ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
