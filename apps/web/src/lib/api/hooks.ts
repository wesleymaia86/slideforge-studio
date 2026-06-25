'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { workspacesApi } from './workspaces'
import { projectsApi } from './projects'
import { jobsApi, uploadsApi } from './jobs'
import type { BriefingData, ExportConfig, Outline, Slide } from './types'

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

// ─── Projects ──────────────────────────────────────────────────────────────────
export function useProjects(workspaceId?: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectsApi(token).list(workspaceId),
    enabled: !!token,
  })
}

export function useProject(id: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi(token).get(id),
    enabled: !!id && !!token,
  })
}

export function useCreateProject() {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; workspaceId: string; description?: string }) =>
      projectsApi(token).create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

// ─── Slides ────────────────────────────────────────────────────────────────────
export function useSlides(projectId: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['slides', projectId],
    queryFn: () => projectsApi(token).slides(projectId),
    enabled: !!projectId && !!token,
  })
}

export function useUpdateSlide(projectId: string) {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slideId, data }: { slideId: string; data: Partial<Slide> }) =>
      projectsApi(token).updateSlide(projectId, slideId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides', projectId] }),
  })
}

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export function useJobs(projectId: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['jobs', projectId],
    queryFn: () => jobsApi(token).list(projectId),
    enabled: !!projectId && !!token,
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
  return useQuery({
    queryKey: ['uploads', projectId],
    queryFn: () => uploadsApi(token).list(projectId),
    enabled: !!projectId && !!token,
  })
}

// ─── Insights ──────────────────────────────────────────────────────────────────
export function useInsights(projectId: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['insights', projectId],
    queryFn: () => projectsApi(token).insights(projectId),
    enabled: !!projectId && !!token,
  })
}

// ─── Briefing ──────────────────────────────────────────────────────────────────
export function useBriefing(projectId: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['briefing', projectId],
    queryFn: () => projectsApi(token).briefing(projectId),
    enabled: !!projectId && !!token,
  })
}

export function useSaveBriefing(projectId: string) {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BriefingData) => projectsApi(token).saveBriefing(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['briefing', projectId] }),
  })
}

// ─── Outline ───────────────────────────────────────────────────────────────────
export function useOutline(projectId: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['outline', projectId],
    queryFn: () => projectsApi(token).outline(projectId),
    enabled: !!projectId && !!token,
  })
}

export function useGenerateOutline(projectId: string) {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => projectsApi(token).generateOutline(projectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outline', projectId] }),
  })
}

// ─── Exports ───────────────────────────────────────────────────────────────────
export function useExports(projectId: string) {
  const token = useToken()
  return useQuery({
    queryKey: ['exports', projectId],
    queryFn: () => projectsApi(token).exports(projectId),
    enabled: !!projectId && !!token,
    refetchInterval: (query) => {
      const exports = query.state.data
      if (!exports) return false
      return exports.some((e) => e.status === 'pending') ? 3000 : false
    },
  })
}

export function useCreateExport(projectId: string) {
  const token = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (config: ExportConfig) => projectsApi(token).createExport(projectId, config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exports', projectId] }),
  })
}
