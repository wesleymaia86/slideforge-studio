'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users, FolderKanban, Building2, Activity, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { mockProjects, mockWorkspaces } from '@/lib/mocks'

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

const mockUsers = [
  { id: 'u1', name: 'Alice Mercado', email: 'alice@acme.com', role: 'admin', workspaces: 2, createdAt: '2024-01-15' },
  { id: 'u2', name: 'Ben Torres', email: 'ben@acme.com', role: 'user', workspaces: 1, createdAt: '2024-02-20' },
  { id: 'u3', name: 'Carla Reyes', email: 'carla@acme.com', role: 'user', workspaces: 1, createdAt: '2024-03-10' },
  { id: 'u4', name: 'Demo User', email: 'demo@slideforge.io', role: 'admin', workspaces: 2, createdAt: '2024-01-01' },
]

export default function AdminPage() {
  const { data: session } = useSession()

  if (session && session.user?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h1 className="font-display text-2xl text-text">Admin Console</h1>
            <span className="text-[10px] px-2 py-0.5 bg-accent/12 border border-accent/25 text-accent rounded-full font-medium">
              {session?.user?.role}
            </span>
          </div>
          <p className="text-text-muted text-sm">Platform administration and oversight.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={mockUsers.length} />
          <StatCard icon={<Building2 className="w-5 h-5" />} label="Workspaces" value={mockWorkspaces.length} />
          <StatCard icon={<FolderKanban className="w-5 h-5" />} label="Projects" value={mockProjects.length} />
          <StatCard icon={<Activity className="w-5 h-5" />} label="Active Jobs" value={2} />
        </div>

        {/* Users table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text mb-3">Users</h2>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-4 px-4 py-2.5 border-b border-border bg-surface-2 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Workspaces</span>
            </div>
            {mockUsers.map((user, i) => (
              <div
                key={user.id}
                className={`grid grid-cols-[1fr_1fr_80px_80px] gap-4 px-4 py-3 text-sm ${i < mockUsers.length - 1 ? 'border-b border-border' : ''} hover:bg-surface-2 transition-colors`}
              >
                <span className="font-medium text-text truncate">{user.name}</span>
                <span className="text-text-muted truncate">{user.email}</span>
                <span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${user.role === 'admin' ? 'bg-accent/12 text-accent border-accent/25' : 'bg-surface-3 text-text-faint border-border'}`}>
                    {user.role}
                  </span>
                </span>
                <span className="text-text-muted text-xs">{user.workspaces}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System health */}
        <div>
          <h2 className="text-sm font-semibold text-text mb-3">System Status</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: 'API', status: 'operational', uptime: '99.9%' },
              { name: 'AI Processing', status: 'operational', uptime: '99.7%' },
              { name: 'Storage', status: 'operational', uptime: '100%' },
            ].map((service) => (
              <div key={service.name} className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{service.name}</p>
                  <p className="text-xs text-text-muted">Uptime {service.uptime}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-success/12 border border-success/25 text-success rounded-full font-medium capitalize">
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
