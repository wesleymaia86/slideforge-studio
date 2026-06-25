'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Upload, Cpu, BarChart3, FileText, AlignLeft, Presentation, Download, Clock, Edit2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useProject, useJobs } from '@/lib/api/hooks'
import { Skeleton, EmptyState } from '@slideforge/ui'

interface QuickAction {
  label: string
  description: string
  icon: React.ReactNode
  href: string
  accent?: boolean
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: project, isLoading } = useProject(id)
  const { data: jobs } = useJobs(id)

  const quickActions: QuickAction[] = [
    { label: 'Upload Content', description: 'Add slides, docs, or recordings', icon: <Upload className="w-5 h-5" />, href: `/projects/${id}/upload` },
    { label: 'Processing Jobs', description: 'Monitor AI processing status', icon: <Cpu className="w-5 h-5" />, href: `/projects/${id}/jobs` },
    { label: 'Insights', description: 'AI analysis of your content', icon: <BarChart3 className="w-5 h-5" />, href: `/projects/${id}/insights` },
    { label: 'Briefing', description: 'Set goals, audience, and tone', icon: <FileText className="w-5 h-5" />, href: `/projects/${id}/briefing` },
    { label: 'Outline', description: 'Structure your narrative arc', icon: <AlignLeft className="w-5 h-5" />, href: `/projects/${id}/outline` },
    { label: 'Editor', description: 'Build and preview your deck', icon: <Presentation className="w-5 h-5" />, href: `/projects/${id}/editor`, accent: true },
    { label: 'Exports', description: 'Download PPTX, PDF, or HTML', icon: <Download className="w-5 h-5" />, href: `/projects/${id}/exports` },
  ]

  const statusMap = {
    ready: { label: 'Ready', dot: 'bg-success' },
    processing: { label: 'Processing', dot: 'bg-warning animate-pulse-amber' },
    draft: { label: 'Draft', dot: 'bg-text-faint' },
    error: { label: 'Error', dot: 'bg-error' },
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6 gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or you may not have access."
        action={<button onClick={() => router.push('/projects')} className="text-accent text-sm">Back to projects</button>}
      />
    )
  }

  const status = statusMap[project.status]
  const displayJobs = jobs ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                <span className="text-xs text-text-muted">{status.label}</span>
              </div>
              <h1 className="font-display text-3xl text-text leading-tight mb-2">{project.name}</h1>
              {project.description && <p className="text-text-muted text-sm max-w-xl">{project.description}</p>}
            </div>
            <button className="flex items-center gap-2 h-8 px-3 border border-border rounded-lg text-xs text-text-muted hover:text-text hover:bg-surface-2 transition-colors shrink-0">
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="flex items-center gap-6 mt-4 text-xs text-text-faint">
            <span>{project.slideCount} slides</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text mb-4">Project Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className={`text-left p-4 rounded-xl border transition-all group ${
                  action.accent
                    ? 'bg-accent/8 border-accent/25 hover:bg-accent/12 hover:border-accent/40'
                    : 'bg-surface border-border hover:border-border-strong hover:bg-surface-2'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${action.accent ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-faint group-hover:text-text-muted'}`}>
                  {action.icon}
                </div>
                <p className={`font-medium text-sm mb-1 ${action.accent ? 'text-accent' : 'text-text'}`}>{action.label}</p>
                <p className="text-xs text-text-muted leading-relaxed">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {displayJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">Recent Jobs</h2>
              <button
                onClick={() => router.push(`/projects/${id}/jobs`)}
                className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {displayJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-border">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    job.status === 'completed' ? 'bg-success' :
                    job.status === 'running' ? 'bg-warning animate-pulse-amber' :
                    job.status === 'failed' ? 'bg-error' : 'bg-text-faint'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text capitalize">{job.type}</p>
                    <p className="text-xs text-text-muted truncate">{job.message}</p>
                  </div>
                  {job.status === 'running' && (
                    <div className="w-24 bg-surface-3 rounded-full h-1">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${job.progress}%` }} />
                    </div>
                  )}
                  <span className="text-xs text-text-faint capitalize shrink-0">{job.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
