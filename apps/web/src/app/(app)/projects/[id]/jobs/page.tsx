'use client'

import { useParams } from 'next/navigation'
import { Cpu, RefreshCw, XCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useJobs } from '@/lib/api/hooks'
import { mockJobs } from '@/lib/mocks'
import type { Job } from '@/lib/api/types'

const jobTypeLabels: Record<Job['type'], string> = {
  upload: 'File Upload',
  transcription: 'Transcription',
  analysis: 'Content Analysis',
  generation: 'Deck Generation',
  export: 'Export',
}

const statusConfig = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    className: 'bg-surface-3 text-text-faint border-border',
    dotClass: 'bg-text-faint',
  },
  running: {
    icon: <Cpu className="w-4 h-4 animate-pulse" />,
    className: 'bg-warning/12 text-warning border-warning/25',
    dotClass: 'bg-warning animate-pulse-amber',
  },
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: 'bg-success/12 text-success border-success/25',
    dotClass: 'bg-success',
  },
  failed: {
    icon: <AlertTriangle className="w-4 h-4" />,
    className: 'bg-error/12 text-error border-error/25',
    dotClass: 'bg-error',
  },
}

function JobRow({ job }: { job: Job }) {
  const sc = statusConfig[job.status]
  const elapsed = job.completedAt
    ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) / 1000)}s`
    : null

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sc.className.replace('border-', 'border ')}`}>
          {sc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <p className="font-medium text-sm text-text">{jobTypeLabels[job.type]}</p>
            <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium border ${sc.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dotClass}`} />
              {job.status}
            </span>
          </div>
          {job.message && <p className="text-xs text-text-muted leading-relaxed">{job.message}</p>}
          {job.status === 'running' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                <span>Processing…</span>
                <span className="tabular-nums">{job.progress}%</span>
              </div>
              <div className="w-full bg-surface-3 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${job.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-text-faint">
            <span>{new Date(job.createdAt).toLocaleString()}</span>
            {elapsed && <span>Duration: {elapsed}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {job.status === 'failed' && (
            <button className="flex items-center gap-1.5 h-7 px-2.5 bg-surface-2 border border-border rounded-lg text-xs text-text-muted hover:text-text transition-colors">
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
          {job.status === 'running' && (
            <button className="flex items-center gap-1.5 h-7 px-2.5 bg-error/10 border border-error/25 rounded-lg text-xs text-error hover:bg-error/20 transition-colors">
              <XCircle className="w-3 h-3" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: jobs, isLoading, refetch } = useJobs(id)
  const display = jobs ?? mockJobs

  const running = display.filter((j) => j.status === 'running').length
  const pending = display.filter((j) => j.status === 'pending').length
  const completed = display.filter((j) => j.status === 'completed').length
  const failed = display.filter((j) => j.status === 'failed').length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 h-8 px-3 border border-border rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-text mb-1">Processing Jobs</h1>
          <p className="text-text-muted text-sm">Track AI processing pipelines for your project.</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          {[
            { label: 'Running', count: running, className: 'bg-warning/12 text-warning border-warning/25' },
            { label: 'Pending', count: pending, className: 'bg-surface-3 text-text-faint border-border' },
            { label: 'Completed', count: completed, className: 'bg-success/12 text-success border-success/25' },
            { label: 'Failed', count: failed, className: 'bg-error/12 text-error border-error/25' },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${stat.className}`}>
              <span className="tabular-nums font-semibold">{stat.count}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-faint mb-4">
              <Cpu className="w-7 h-7" />
            </div>
            <p className="font-medium text-text mb-1">No jobs yet</p>
            <p className="text-sm text-text-muted max-w-sm">
              Upload content to trigger processing jobs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {display.map((job) => <JobRow key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  )
}
