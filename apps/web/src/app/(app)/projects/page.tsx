'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, FolderKanban, Search, X, SlidersHorizontal, ArrowRight, Clock } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useProjects, useCreateProject } from '@/lib/api/hooks'
import { useAppStore } from '@/lib/store'
import { mockProjects, mockWorkspaces } from '@/lib/mocks'
import type { Project } from '@/lib/api/types'

const statusConfig = {
  ready: { label: 'Ready', className: 'bg-success/12 text-success border-success/25' },
  processing: { label: 'Processing', className: 'bg-warning/12 text-warning border-warning/25' },
  draft: { label: 'Draft', className: 'bg-surface-3 text-text-faint border-border' },
  error: { label: 'Error', className: 'bg-error/12 text-error border-error/25' },
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const s = statusConfig[project.status]
  const date = new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface rounded-xl border border-border hover:border-border-strong hover:bg-surface-2 transition-all group flex flex-col"
    >
      {/* Slide mini-preview */}
      <div className="relative w-full rounded-t-xl overflow-hidden border-b border-border" style={{ aspectRatio: '16/9', background: 'hsl(220 15% 10%)' }}>
        {project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-2 p-4">
            {Array.from({ length: Math.min(project.slideCount || 3, 5) }).map((_, i) => (
              <div
                key={i}
                className="rounded border border-white/10 flex-1 h-full max-h-16"
                style={{ background: `hsl(${220 + i * 8} 16% ${10 + i * 2}%)` }}
              />
            ))}
          </div>
        )}
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '64px',
          }}
        />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-text text-sm leading-snug line-clamp-2 flex-1">{project.name}</h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border shrink-0 ${s.className}`}>
            {s.label}
          </span>
        </div>
        {project.description && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{project.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-[11px] text-text-faint">{project.slideCount} slides</span>
          <span className="text-[11px] text-text-faint flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>
    </button>
  )
}

function CreateProjectModal({ onClose, workspaceId }: { onClose: () => void; workspaceId?: string }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [wsId, setWsId] = useState(workspaceId ?? mockWorkspaces[0]?.id ?? '')
  const create = useCreateProject()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const project = await create.mutateAsync({ name, workspaceId: wsId, description: desc || undefined })
    onClose()
    router.push(`/projects/${project.id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-card animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text">New Project</h2>
          <button onClick={onClose} className="text-text-faint hover:text-text transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Project Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Q3 Investor Deck"
              className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Description <span className="text-text-faint">(optional)</span></label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="Brief description of this project's purpose…"
              className="w-full bg-surface-2 border border-border rounded-[10px] px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Workspace</label>
            <select
              value={wsId}
              onChange={(e) => setWsId(e.target.value)}
              className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
            >
              {mockWorkspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 h-9 border border-border rounded-[10px] text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || !name}
              className="flex-1 h-9 bg-accent text-[#0C0D0F] font-semibold text-sm rounded-[10px] hover:bg-accent-light transition-colors shadow-amber-sm disabled:opacity-60"
            >
              {create.isPending ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams.get('workspaceId') ?? undefined
  const { data: projects, isLoading } = useProjects(workspaceId)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const display = (projects ?? mockProjects).filter(
    (p) =>
      (!workspaceId || p.workspaceId === workspaceId) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-8 px-3 bg-accent text-[#0C0D0F] text-xs font-semibold rounded-lg hover:bg-accent-light transition-colors shadow-amber-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-text mb-1">Projects</h1>
            <p className="text-text-muted text-sm">{display.length} project{display.length !== 1 ? 's' : ''}</p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="h-9 pl-8 pr-4 bg-surface-2 border border-border rounded-[10px] text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors w-56"
            />
          </div>
        </div>

        {display.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-faint mb-4">
              <FolderKanban className="w-7 h-7" />
            </div>
            <p className="font-medium text-text mb-1">{search ? 'No projects found' : 'No projects yet'}</p>
            <p className="text-sm text-text-muted max-w-sm mb-5">
              {search ? 'Try a different search term.' : 'Create your first project to start building presentations.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 h-9 px-4 bg-accent text-[#0C0D0F] font-semibold text-sm rounded-[10px] hover:bg-accent-light transition-colors shadow-amber"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {display.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} workspaceId={workspaceId} />}
    </div>
  )
}
