import * as React from 'react'
import { cn } from '../lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'accent' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

const trackColors: Record<string, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
}

export function Progress({
  className,
  value,
  max = 100,
  variant = 'accent',
  size = 'md',
  showLabel,
  animated,
  ...props
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5 text-xs text-text-muted">
          <span>Progress</span>
          <span className="tabular-nums">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-3 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            trackColors[variant],
            animated && 'relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer',
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
