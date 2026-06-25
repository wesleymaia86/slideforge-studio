'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, TrendingUp, FolderKanban, Cpu, BarChart3, ArrowRight } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useProjects, useAllJobs } from '@/lib/api/hooks'
import { Button, Skeleton, EmptyState } from '@slideforge/ui'
import type { Project } from '@/lib/api/types'

function StatusDot({ status }: { status: Project['status'] }) {
  const map = {
    ready: 'bg-success',
    processing: 'bg-warning animate-pulse-amber',
    draft: 'bg-text-faint',
    error: 'bg-error',
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${map[status]}`} />
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean
}) {
  return (
    <div className={`bg-surface rounded-xl border p-5 flex items-start gap-4 ${accent ? 'border-accent/25' : 'border-border'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-accent/12 text-accent' : 'bg-surface-2 text-text-muted'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-text tabular-nums">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-text-faint mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: jobs } = useAllJobs()

  const displayProjects = projects ?? []
  const activeJobs = (jobs ?? []).filter((j) => j.status !== 'completed')

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <Button variant="primary" size="sm" onClick={() => router.push('/projects')} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            New Project
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-text mb-1">
            {greeting}, <span className="gradient-text-amber">{firstName}</span>
          </h1>
          <p className="text-text-muted text-sm">Here's what's happening in your workspace today.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FolderKanban className="w-5 h-5" />}
            label="Total Projects"
            value={projectsLoading ? '—' : String(displayProjects.length)}
            sub="across all workspaces"
            accent
          />
          <StatCard
            icon={<Cpu className="w-5 h-5" />}
            label="Jobs Running"
            value={String(activeJobs.filter((j) => j.status === 'running').length)}
            sub="processing now"
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Insights Generated"
            value="—"
            sub="this month"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Slides Created"
            value={String(displayProjects.reduce((a, p) => a + p.slideCount, 0))}
            sub="total slides"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-text">Recent Projects</h2>
              <button
                onClick={() => router.push('/projects')}
                className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {projectsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : displayProjects.length === 0 ? (
              <EmptyState
                compact
                icon={<FolderKanban className="w-6 h-6" />}
                title="No projects yet"
                description="Create a project to get started."
                action={
                  <Button variant="primary" size="sm" onClick={() => router.push('/projects')}>
                    Browse projects
                  </Button>
                }
              />
            ) : (
              displayProjects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="w-full flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-border hover:border-border-strong hover:bg-surface-2 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors">
                    <FolderKanban className="w-4 h-4 text-text-faint" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{project.name}</p>
                    <p className="text-xs text-text-faint mt-0.5 flex items-center gap-1.5">
                      <StatusDot status={project.status} />
                      <span className="capitalize">{project.status}</span>
                      <span className="text-border mx-1">·</span>
                      <span>{project.slideCount} slides</span>
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text mb-1">Active Jobs</h2>
            {activeJobs.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-text-muted">No active jobs</p>
              </div>
            ) : (
              activeJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="bg-surface rounded-xl border border-border p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-text capitalize">{job.type}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{job.message}</p>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        job.status === 'running'
                          ? 'bg-warning/12 text-warning'
                          : 'bg-surface-2 text-text-faint'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  {job.status === 'running' && (
                    <div className="w-full bg-surface-3 rounded-full h-1">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
