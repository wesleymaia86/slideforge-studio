'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users, FolderKanban, Building2, Activity } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useAdminStats, useAdminUsers, useAdminWorkspaces } from '@/lib/api/hooks'
import { Badge, Skeleton } from '@slideforge/ui'

function StatCard({ icon, label, value, className = '' }: {
  icon: React.ReactNode; label: string; value: string | number; className?: string
}) {
  return (
    <div className={`bg-surface rounded-xl border border-border p-5 flex items-center gap-4 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-text-muted shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-text tabular-nums">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { data: session } = useSession()
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: usersData, isLoading: usersLoading } = useAdminUsers()
  const { data: workspacesData } = useAdminWorkspaces()

  if (session && session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  const users = usersData?.data ?? []
  const workspaces = workspacesData?.data ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h1 className="font-display text-2xl text-text">Admin Console</h1>
            <Badge variant="accent">{session?.user?.role}</Badge>
          </div>
          <p className="text-text-muted text-sm">Platform administration and oversight.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats?.users ?? 0} />
              <StatCard icon={<Building2 className="w-5 h-5" />} label="Workspaces" value={stats?.workspaces ?? 0} />
              <StatCard icon={<FolderKanban className="w-5 h-5" />} label="File Assets" value={stats?.fileAssets ?? 0} />
              <StatCard icon={<Activity className="w-5 h-5" />} label="Processing Jobs" value={stats?.processingJobs ?? 0} />
            </>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text mb-3">Users</h2>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_100px] gap-4 px-4 py-2.5 border-b border-border bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
            </div>
            {usersLoading ? (
              <div className="p-4"><Skeleton className="h-8" /></div>
            ) : users.length === 0 ? (
              <div className="p-6 text-sm text-text-muted text-center">No users found</div>
            ) : (
              users.map((user, i) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-[1fr_1fr_100px] gap-4 px-4 py-3 text-sm ${i < users.length - 1 ? 'border-b border-border' : ''} hover:bg-surface-2 transition-colors`}
                >
                  <span className="font-medium text-text truncate">{user.name ?? '—'}</span>
                  <span className="text-text-muted truncate">{user.email}</span>
                  <span>
                    <Badge variant={user.isSuperAdmin ? 'accent' : 'muted'}>
                      {user.isSuperAdmin ? 'admin' : 'user'}
                    </Badge>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-3">Workspaces ({workspaces.length})</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {workspaces.slice(0, 6).map((ws) => (
              <div key={ws.id} className="bg-surface rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-text">{ws.name}</p>
                <p className="text-xs text-text-faint font-mono mt-1">{ws.slug}</p>
                <p className="text-xs text-text-muted mt-2">
                  {ws._count?.projects ?? 0} projects · {ws._count?.members ?? 0} members
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
