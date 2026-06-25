'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Bell } from 'lucide-react'
import { cn } from '@slideforge/ui'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopBarProps {
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  actions?: React.ReactNode
  className?: string
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  workspaces: 'Workspaces',
  projects: 'Projects',
  upload: 'Upload',
  jobs: 'Jobs',
  insights: 'Insights',
  briefing: 'Briefing',
  outline: 'Outline',
  editor: 'Editor',
  exports: 'Exports',
  admin: 'Admin',
}

function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const label = routeLabels[seg] ?? (seg.length > 20 ? seg.slice(0, 12) + '…' : seg)
    return { label, href }
  })
}

export function TopBar({ breadcrumbs: propBreadcrumbs, title, actions, className }: TopBarProps) {
  const autoBreadcrumbs = useBreadcrumbs()
  const breadcrumbs = propBreadcrumbs ?? autoBreadcrumbs

  return (
    <header
      className={cn(
        'flex items-center justify-between h-14 px-6 border-b border-border glass shrink-0',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href ?? crumb.label} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-text-faint shrink-0" />}
            {crumb.href && i < breadcrumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="text-sm text-text-muted hover:text-text transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={cn('text-sm truncate', i === breadcrumbs.length - 1 ? 'text-text font-medium' : 'text-text-muted')}>
                {crumb.label}
              </span>
            )}
          </div>
        ))}
        {title && <h1 className="text-sm font-medium text-text ml-2">{title}</h1>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <button className="p-2 text-text-faint hover:text-text-muted transition-colors rounded-lg hover:bg-surface-2 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  )
}
