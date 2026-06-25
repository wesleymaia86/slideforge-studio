import * as React from 'react'
import { cn } from '../lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text'
  lines?: number
}

export function Skeleton({ className, variant = 'rect', lines = 1, ...props }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-shimmer bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:400%_100%] rounded-md h-4',
              i === lines - 1 && 'w-2/3',
              className,
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 bg-[length:400%_100%]',
        variant === 'circle' ? 'rounded-full' : 'rounded-lg',
        variant === 'text' && 'h-4',
        className,
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
    </div>
  )
}
