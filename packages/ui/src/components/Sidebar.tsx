'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

interface SidebarProps {
  children: React.ReactNode
  className?: string
  collapsed?: boolean
}

interface SidebarSectionProps {
  label?: string
  children: React.ReactNode
  className?: string
}

interface SidebarItemProps {
  icon?: React.ReactNode
  label: string
  active?: boolean
  badge?: string | number
  onClick?: () => void
  href?: string
  className?: string
  indent?: boolean
}

export function Sidebar({ children, className, collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col bg-surface border-r border-border transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[240px]',
        className,
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-4 pt-5 pb-4 border-b border-border shrink-0', className)}>
      {children}
    </div>
  )
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-3 py-4 space-y-1', className)}>
      {children}
    </div>
  )
}

export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-3 pb-4 pt-2 border-t border-border shrink-0', className)}>
      {children}
    </div>
  )
}

export function SidebarSection({ label, children, className }: SidebarSectionProps) {
  return (
    <div className={cn('mb-1', className)}>
      {label && (
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-faint">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export function SidebarItem({ icon, label, active, badge, onClick, className, indent }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100 text-left group',
        indent && 'pl-8',
        active
          ? 'bg-accent/10 text-accent border border-accent/20 font-medium'
          : 'text-text-muted hover:text-text hover:bg-surface-2',
        className,
      )}
    >
      {icon && (
        <span className={cn('shrink-0 w-4 h-4', active ? 'text-accent' : 'text-text-faint group-hover:text-text-muted')}>
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge != null && (
        <span
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
            active ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-text-faint',
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
