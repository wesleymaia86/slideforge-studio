import { createApiClient } from './client'
import type { Project, PaginatedResponse, Slide, Outline, BriefingData, Insight, Export, ExportConfig } from './types'

export function projectsApi(token?: string) {
  const api = createApiClient(token)

  return {
    list: (workspaceId?: string) =>
      api.get<Project[]>('/projects', workspaceId ? { workspaceId } : undefined),
    get: (id: string) => api.get<Project>(`/projects/${id}`),
    create: (data: { name: string; workspaceId: string; description?: string }) =>
      api.post<Project>('/projects', data),
    update: (id: string, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data),
    delete: (id: string) => api.delete<void>(`/projects/${id}`),

    slides: (id: string) => api.get<Slide[]>(`/projects/${id}/slides`),
    updateSlide: (id: string, slideId: string, data: Partial<Slide>) =>
      api.patch<Slide>(`/projects/${id}/slides/${slideId}`, data),

    insights: (id: string) => api.get<Insight[]>(`/projects/${id}/insights`),

    briefing: (id: string) => api.get<BriefingData>(`/projects/${id}/briefing`),
    saveBriefing: (id: string, data: BriefingData) => api.post<BriefingData>(`/projects/${id}/briefing`, data),

    outline: (id: string) => api.get<Outline>(`/projects/${id}/outline`),
    saveOutline: (id: string, data: Outline) => api.post<Outline>(`/projects/${id}/outline`, data),
    generateOutline: (id: string) => api.post<Outline>(`/projects/${id}/outline/generate`),

    exports: (id: string) => api.get<Export[]>(`/projects/${id}/exports`),
    createExport: (id: string, config: ExportConfig) => api.post<Export>(`/projects/${id}/exports`, config),
  }
}
