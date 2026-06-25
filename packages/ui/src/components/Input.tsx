'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id ?? React.useId()

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-muted tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3 text-text-faint pointer-events-none">{leftElement}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 bg-surface-2 border border-border rounded-[10px] text-sm text-text placeholder:text-text-faint transition-colors',
              'focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftElement ? 'pl-9' : 'pl-3',
              rightElement ? 'pr-9' : 'pr-3',
              error && 'border-error/60 focus:border-error/60 focus:ring-error/10',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 text-text-faint">{rightElement}</span>
          )}
        </div>
        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-error' : 'text-text-faint')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
