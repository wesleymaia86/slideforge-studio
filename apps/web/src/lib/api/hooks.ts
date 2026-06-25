'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { workspacesApi } from './workspaces'
import { projectsApi, listAllProjects, resolveProjectScope } from './projects'
import { jobsApi, uploadsApi } from './jobs'
import { adminApi } from './admin'
import { useAppStore } from '@/lib/store'
import type { BriefingData, ExportConfig, Slide } from './types'

function useToken() {
  const { data: session } = useSession()
  return session?.accessToken
}

// ─── Workspaces ────────────────────────────────────────────────────────────────
export function useWorkspaces() {
  const token = useToken()
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesApi(token).list(),
    enabled: !!token,
  })
}

export function useWorkspace(id: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspacesApi(token).get(id),
    enabled: !!id && !!token,
  })
}

export function useCreateWorkspace() {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; slug: string }) => workspacesApi(token).create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}

// ─── Project scope (workspace + deck) ───────────────────────────────────────────
export function useProjectScope(projectId: string) {
  const token = useToken()
  const storedWorkspaceId = useAppStore((s) => s.currentWorkspaceId)
  const setWorkspace = useAppStore((s) => s.setWorkspace)
  const setProject = useAppStore((s) => s.setProject)
  const setDeck = useAppStore((s) => s.setDeck)

  const scopeQuery = useQuery({
    queryKey: ['project-scope', projectId, storedWorkspaceId],
    queryFn: async () => {
      if (storedWorkspaceId) {
        try {
          const project = await projectsApi(token, storedWorkspaceId).get(projectId)
          return { workspaceId: storedWorkspaceId, project }
        } catch {
          /* scan memberships */
        }
      }
      return resolveProjectScope(token, projectId)
    },
    enabled: !!projectId && !!token,
  })

  const workspaceId = scopeQuery.data?.workspaceId
  const project = scopeQuery.data?.project

  const deckQuery = useQuery({
    queryKey: ['deck', workspaceId, projectId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Missing workspace')
      const api = projectsApi(token, workspaceId)
      let decks = await api.decks.list(projectId)
      if (decks.length === 0) {
        const created = await api.decks.create(projectId, {
          name: project?.name ?? 'Main Deck',
          description: project?.description,
        })
        decks = [created]
      }
      return decks[0]
    },
    enabled: !!workspaceId && !!projectId && !!token && scopeQuery.isSuccess,
  })

  const briefingQuery = useQuery({
    queryKey: ['briefing-meta', workspaceId, deckQuery.data?.id],
    queryFn: () => {
      if (!workspaceId || !deckQuery.data?.id) return null
      return projectsApi(token, workspaceId).latestBriefing(deckQuery.data.id)
    },
    enabled: !!workspaceId && !!deckQuery.data?.id && !!token,
  })

  useEffect(() => {
    if (workspaceId) setWorkspace(workspaceId)
    if (projectId) setProject(projectId)
    if (deckQuery.data?.id) setDeck(deckQuery.data.id)
  }, [workspaceId, projectId, deckQuery.data?.id, setWorkspace, setProject, setDeck])

  return {
    workspaceId,
    project,
    deckId: deckQuery.data?.id,
    briefingId: briefingQuery.data?.id,
    isLoading: scopeQuery.isLoading || deckQuery.isLoading,
    isError: scopeQuery.isError || deckQuery.isError,
    error: scopeQuery.error ?? deckQuery.error,
  }
}

// ─── Projects ──────────────────────────────────────────────────────────────────
export function useProjects(workspaceId?: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['projects', workspaceId ?? 'all'],
    queryFn: () =>
      workspaceId ? projectsApi(token, workspaceId).list() : listAllProjects(token),
    enabled: !!token,
  })
}

export function useProject(id: string) {
  const { workspaceId, project, isLoading, isError, error } = useProjectScope(id)
  const token = useToken()

  const query = useQuery({
    queryKey: ['project', id, workspaceId],
    queryFn: () => projectsApi(token, workspaceId!).get(id),
    enabled: !!id && !!workspaceId && !!token,
    initialData: project,
  })

  return { ...query, isLoading: isLoading || query.isLoading, isError, error }
}

export function useCreateProject() {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; workspaceId: string; description?: string }) =>
      projectsApi(token, data.workspaceId).create({
        name: data.name,
        description: data.description,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

// ─── Slides ────────────────────────────────────────────────────────────────────
export function useSlides(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['slides', projectId, deckId],
    queryFn: () => projectsApi(token, workspaceId!).decks.slides(projectId, deckId!),
    enabled: !!projectId && !!workspaceId && !!deckId && !!token,
  })
}

export function useUpdateSlide(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId } = useProjectScope(projectId)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: Partial<Slide> }) =>
      projectsApi(token, workspaceId!).decks.updateSlide(projectId, deckId!, slideId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides', projectId] }),
  })
}

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export function useJobs(projectId: string) {
  const token = useToken()
  const { workspaceId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['jobs', workspaceId, projectId],
    queryFn: () => jobsApi(token, workspaceId!).list(projectId),
    enabled: !!projectId && !!workspaceId && !!token,
    refetchInterval: (query) => {
      const jobs = query.state.data
      if (!jobs) return false
      const hasActive = jobs.some((j) => j.status === 'pending' || j.status === 'running')
      return hasActive ? 3000 : false
    },
  })
}

// ─── Uploads ───────────────────────────────────────────────────────────────────
export function useUploads(projectId: string) {
  const token = useToken()
  const { workspaceId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['uploads', workspaceId, projectId],
    queryFn: () => uploadsApi(token, workspaceId!).list(projectId),
    enabled: !!projectId && !!workspaceId && !!token,
  })
}

export function useUploadFile(projectId: string) {
  const token = useToken()
  const { workspaceId } = useProjectScope(projectId)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadsApi(token, workspaceId!).upload(file, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads', workspaceId, projectId] })
      qc.invalidateQueries({ queryKey: ['jobs', workspaceId, projectId] })
    },
  })
}

// ─── Insights ──────────────────────────────────────────────────────────────────
export function useInsights(projectId: string) {
  const token = useToken()
  const { workspaceId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['insights', workspaceId, projectId],
    queryFn: () => projectsApi(token, workspaceId!).insights(projectId),
    enabled: !!projectId && !!workspaceId && !!token,
  })
}

// ─── Briefing ──────────────────────────────────────────────────────────────────
export function useBriefing(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['briefing', workspaceId, deckId, projectId],
    queryFn: () => projectsApi(token, workspaceId!).briefing(deckId!, projectId),
    enabled: !!projectId && !!workspaceId && !!deckId && !!token,
  })
}

export function useSaveBriefing(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId } = useProjectScope(projectId)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BriefingData) =>
      projectsApi(token, workspaceId!).saveBriefing(deckId!, projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['briefing', workspaceId, deckId, projectId] })
      qc.invalidateQueries({ queryKey: ['briefing-meta', workspaceId, deckId] })
    },
  })
}

// ─── Outline ───────────────────────────────────────────────────────────────────
export function useOutline(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId, briefingId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['outline', workspaceId, deckId, briefingId, projectId],
    queryFn: () => projectsApi(token, workspaceId!).outline(deckId!, projectId, briefingId),
    enabled: !!projectId && !!workspaceId && !!deckId && !!token,
  })
}

export function useGenerateOutline(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId, briefingId } = useProjectScope(projectId)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!briefingId) {
        throw new Error('Save a briefing before generating an outline')
      }
      return projectsApi(token, workspaceId!).generateOutline(deckId!, briefingId, projectId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outline', workspaceId, deckId] }),
  })
}

// ─── Exports ───────────────────────────────────────────────────────────────────
export function useExports(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId } = useProjectScope(projectId)
  return useQuery({
    queryKey: ['exports', workspaceId, deckId, projectId],
    queryFn: () => projectsApi(token, workspaceId!).exports(deckId!, projectId),
    enabled: !!projectId && !!workspaceId && !!deckId && !!token,
    refetchInterval: (query) => {
      const exports = query.state.data
      if (!exports) return false
      return exports.some((e) => e.status === 'pending') ? 3000 : false
    },
  })
}

export function useCreateExport(projectId: string) {
  const token = useToken()
  const { workspaceId, deckId } = useProjectScope(projectId)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: ExportConfig) =>
      projectsApi(token, workspaceId!).createExport(deckId!, projectId, config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exports', workspaceId, deckId, projectId] }),
  })
}

// ─── Admin ─────────────────────────────────────────────────────────────────────
export function useAdminStats() {
  const token = useToken()
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi(token).stats(),
    enabled: !!token,
  })
}

export function useAdminUsers() {
  const token = useToken()
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi(token).users(),
    enabled: !!token,
  })
}

export function useAdminWorkspaces() {
  const token = useToken()
  return useQuery({
    queryKey: ['admin', 'workspaces'],
    queryFn: () => adminApi(token).workspaces(),
    enabled: !!token,
  })
}

// ─── Dashboard aggregates ──────────────────────────────────────────────────────
export function useAllJobs() {
  const token = useToken()
  const { data: workspaces } = useWorkspaces()
  return useQuery({
    queryKey: ['jobs', 'all', workspaces?.map((w) => w.id)],
    queryFn: async () => {
      if (!workspaces?.length) return []
      const results = await Promise.all(
        workspaces.map((ws) => jobsApi(token, ws.id).list()),
      )
      return results.flat()
    },
    enabled: !!token && !!workspaces?.length,
    refetchInterval: (query) => {
      const jobs = query.state.data
      if (!jobs) return false
      return jobs.some((j) => j.status === 'pending' || j.status === 'running') ? 3000 : false
    },
  })
}
