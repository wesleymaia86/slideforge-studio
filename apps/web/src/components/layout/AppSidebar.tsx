'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, FolderKanban, Building2, Upload, Cpu, BarChart3,
  FileText, AlignLeft, Presentation, Download, ShieldCheck,
  LogOut, PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { cn } from '@slideforge/ui'
import { useAppStore } from '@/lib/store'
import { t } from '@/lib/i18n'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  match?: (path: string) => boolean
}

const mainNav: NavItem[] = [
  { label: t('nav.dashboard'), href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: t('nav.workspaces'), href: '/workspaces', icon: <Building2 className="w-4 h-4" /> },
  { label: t('nav.projects'), href: '/projects', icon: <FolderKanban className="w-4 h-4" /> },
]

function projectNav(id: string): NavItem[] {
  return [
    { label: t('nav.overview'), href: `/projects/${id}`, match: (p) => p === `/projects/${id}`, icon: <Presentation className="w-4 h-4" /> },
    { label: t('nav.upload'), href: `/projects/${id}/upload`, icon: <Upload className="w-4 h-4" /> },
    { label: t('nav.jobs'), href: `/projects/${id}/jobs`, icon: <Cpu className="w-4 h-4" /> },
    { label: t('nav.insights'), href: `/projects/${id}/insights`, icon: <BarChart3 className="w-4 h-4" /> },
    { label: t('nav.briefing'), href: `/projects/${id}/briefing`, icon: <FileText className="w-4 h-4" /> },
    { label: t('nav.outline'), href: `/projects/${id}/outline`, icon: <AlignLeft className="w-4 h-4" /> },
    { label: t('nav.editor'), href: `/projects/${id}/editor`, icon: <Presentation className="w-4 h-4" /> },
    { label: t('nav.exports'), href: `/projects/${id}/exports`, icon: <Download className="w-4 h-4" /> },
  ]
}

export function AppSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname() ?? ''
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  const projectMatch = pathname.match(/^\/projects\/([^\/]+)/)
  const activeProjectId = projectMatch?.[1]

  const isActive = (item: NavItem) => {
    if (item.match) return item.match(pathname)
    return pathname.startsWith(item.href)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-surface border-r border-border transition-all duration-200 shrink-0',
        sidebarCollapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      <div className="px-4 pt-5 pb-4 border-b border-border flex items-center justify-between shrink-0">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center shadow-amber-sm shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#0C0D0F]">
                <rect x="1" y="3" width="6" height="4.5" rx="1" fill="currentColor" />
                <rect x="9" y="3" width="6" height="4.5" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="1" y="9" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
                <rect x="9" y="9" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className="font-display text-sm font-normal text-text tracking-tight">{t('meta.title')}</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="text-text-faint hover:text-text-muted transition-colors p-1 rounded"
          aria-label={t('nav.toggleSidebar')}
        >
          {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-thin">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-faint">
            {t('nav.navigation')}
          </p>
        )}
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100',
              sidebarCollapsed && 'justify-center px-2',
              isActive(item)
                ? 'bg-accent/10 text-accent border border-accent/20 font-medium'
                : 'text-text-muted hover:text-text hover:bg-surface-2',
            )}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className={cn('shrink-0', isActive(item) ? 'text-accent' : 'text-text-faint')}>
              {item.icon}
            </span>
            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}

        {activeProjectId && !sidebarCollapsed && (
          <div className="mt-4 pt-3 border-t border-border">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-faint">
              {t('nav.project')}
            </p>
            {projectNav(activeProjectId).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100',
                  isActive(item)
                    ? 'bg-accent/10 text-accent border border-accent/20 font-medium'
                    : 'text-text-muted hover:text-text hover:bg-surface-2',
                )}
              >
                <span className={cn('shrink-0', isActive(item) ? 'text-accent' : 'text-text-faint')}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {session?.user?.role === 'admin' && !sidebarCollapsed && (
          <div className="mt-4 pt-3 border-t border-border">
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-100',
                pathname.startsWith('/admin')
                  ? 'bg-accent/10 text-accent border border-accent/20 font-medium'
                  : 'text-text-muted hover:text-text hover:bg-surface-2',
              )}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-text-faint" />
              <span className="truncate">{t('nav.admin')}</span>
            </Link>
          </div>
        )}
      </div>

      <div className="px-2 pb-3 pt-2 border-t border-border shrink-0">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-2 cursor-pointer group transition-colors">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-semibold text-accent shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text truncate">{session?.user?.name ?? t('common.user')}</p>
              <p className="text-[10px] text-text-faint truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-text-faint hover:text-error transition-colors opacity-0 group-hover:opacity-100"
              aria-label={t('nav.signOut')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex justify-center py-2 text-text-faint hover:text-error transition-colors"
            aria-label={t('nav.signOut')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
