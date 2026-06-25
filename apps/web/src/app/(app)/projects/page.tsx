'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, FolderKanban, Search, X, Clock } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { FormFeedback } from '@/components/FormFeedback'
import { useProjects, useCreateProject, useWorkspaces } from '@/lib/api/hooks'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useAppStore } from '@/lib/store'
import { t } from '@/lib/i18n'
import { Button, EmptyState, Skeleton, Input } from '@slideforge/ui'
import type { Project } from '@/lib/api/types'

function statusConfig() {
  return {
    ready: { label: t('status.ready'), className: 'bg-success/12 text-success border-success/25' },
    processing: { label: t('status.processing'), className: 'bg-warning/12 text-warning border-warning/25' },
    draft: { label: t('status.draft'), className: 'bg-surface-3 text-text-faint border-border' },
    error: { label: t('status.error'), className: 'bg-error/12 text-error border-error/25' },
  }
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const s = statusConfig()[project.status]
  const date = new Date(project.updatedAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface rounded-xl border border-border hover:border-border-strong hover:bg-surface-2 transition-all group flex flex-col"
    >
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
          <span className="text-[11px] text-text-faint">{project.slideCount} {t('common.slides')}</span>
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { data: workspaces } = useWorkspaces()
  const [wsId, setWsId] = useState(workspaceId ?? '')
  const create = useCreateProject()
  const router = useRouter()
  const setWorkspace = useAppStore((s) => s.setWorkspace)

  const effectiveWsId = wsId || workspaces?.[0]?.id || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!name.trim() || !effectiveWsId) return

    try {
      const project = await create.mutateAsync({
        name: name.trim(),
        workspaceId: effectiveWsId,
        description: desc.trim() || undefined,
      })
      setWorkspace(effectiveWsId)
      setSuccess(t('projects.createSuccess'))
      setTimeout(() => {
        onClose()
        router.push(`/projects/${project.id}`)
      }, 600)
    } catch (err) {
      setError(getApiErrorMessage(err, t('projects.createError')))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-card animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text">{t('projects.modalTitle')}</h2>
          <button onClick={onClose} className="text-text-faint hover:text-text transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('projects.nameLabel')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('projects.namePlaceholder')}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">
              {t('projects.descLabel')} <span className="text-text-faint">({t('common.optional')})</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder={t('projects.descPlaceholder')}
              className="w-full bg-surface-2 border border-border rounded-[10px] px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">{t('projects.workspaceLabel')}</label>
            <select
              value={effectiveWsId}
              onChange={(e) => setWsId(e.target.value)}
              className="w-full h-10 bg-surface-2 border border-border rounded-[10px] px-3 text-sm text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors"
            >
              {(workspaces ?? []).map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>
          <FormFeedback error={error} success={success} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={create.isPending}
              disabled={!name.trim() || !effectiveWsId || Boolean(success)}
            >
              {t('projects.createProject')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-full p-6 gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48" />
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  )
}

function ProjectsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const workspaceId = searchParams?.get('workspaceId') ?? undefined
  const { data: projects, isLoading } = useProjects(workspaceId)
  const setWorkspace = useAppStore((s) => s.setWorkspace)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const display = (projects ?? []).filter(
    (p) =>
      (!workspaceId || p.workspaceId === workspaceId) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase())),
  )

  const openProject = (project: Project) => {
    setWorkspace(project.workspaceId)
    router.push(`/projects/${project.id}`)
  }

  const countLabel =
    display.length === 1
      ? t('projects.count', { count: display.length })
      : t('projects.countPlural', { count: display.length })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            {t('projects.newProject')}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-text mb-1">{t('projects.title')}</h1>
            <p className="text-text-muted text-sm">{countLabel}</p>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('projects.searchPlaceholder')}
            leftElement={<Search className="w-3.5 h-3.5" />}
            className="w-56"
          />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : display.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="w-7 h-7" />}
            title={search ? t('projects.notFound') : t('projects.noProjects')}
            description={search ? t('projects.notFoundSearch') : t('projects.noProjectsDesc')}
            action={
              !search ? (
                <Button variant="primary" onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
                  {t('projects.newProject')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {display.map((project) => (
              <ProjectCard key={project.id} project={project} onClick={() => openProject(project)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} workspaceId={workspaceId} />}
    </div>
  )
}
