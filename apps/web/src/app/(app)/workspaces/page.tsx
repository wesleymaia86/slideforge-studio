'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Users, FolderKanban, Crown, ArrowRight, X } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useWorkspaces, useCreateWorkspace } from '@/lib/api/hooks'
import { Button, EmptyState, Skeleton, Input } from '@slideforge/ui'
import type { Workspace } from '@/lib/api/types'

const planBadge: Record<Workspace['plan'], string> = {
  free: 'bg-surface-3 text-text-faint border-border',
  pro: 'bg-accent/12 text-accent border-accent/25',
  enterprise: 'bg-info/12 text-info border-info/25',
}

function CreateWorkspaceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const create = useCreateWorkspace()

  const handleNameChange = (v: string) => {
    setName(v)
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await create.mutateAsync({ name, slug })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-card animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text">New Workspace</h2>
          <button onClick={onClose} className="text-text-faint hover:text-text transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Workspace Name" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Acme Corp" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="acme-corp" className="font-mono" />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={create.isPending} disabled={!name}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WorkspacesPage() {
  const router = useRouter()
  const { data: workspaces, isLoading } = useWorkspaces()
  const [showCreate, setShowCreate] = useState(false)
  const display = workspaces ?? []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            New Workspace
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-text mb-1">Workspaces</h1>
          <p className="text-text-muted text-sm">Organize your projects and collaborate with your team.</p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : display.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-7 h-7" />}
            title="No workspaces yet"
            description="Create a workspace to start organizing your projects and invite your team."
            action={
              <Button variant="primary" onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Create Workspace
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {display.map((ws) => (
              <button
                key={ws.id}
                onClick={() => router.push(`/projects?workspaceId=${ws.id}`)}
                className="text-left bg-surface rounded-xl border border-border hover:border-border-strong hover:bg-surface-2 p-5 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/15 flex items-center justify-center text-accent font-display text-xl">
                    {ws.name[0]}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${planBadge[ws.plan]} flex items-center gap-1`}>
                    {ws.plan === 'pro' && <Crown className="w-2.5 h-2.5" />}
                    {ws.plan}
                  </span>
                </div>
                <h3 className="font-semibold text-text mb-1">{ws.name}</h3>
                <p className="text-xs text-text-faint font-mono mb-4">{ws.slug}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5" />
                    {ws._count?.projects ?? 0} projects
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {ws._count?.members ?? 0} members
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <ArrowRight className="w-4 h-4 text-text-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
