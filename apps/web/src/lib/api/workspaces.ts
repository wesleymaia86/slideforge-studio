import { createApiClient } from './client'
import type { Workspace, PaginatedResponse } from './types'

export function workspacesApi(token?: string) {
  const api = createApiClient(token)

  return {
    list: () => api.get<Workspace[]>('/workspaces'),
    get: (id: string) => api.get<Workspace>(`/workspaces/${id}`),
    create: (data: { name: string; slug: string }) => api.post<Workspace>('/workspaces', data),
    update: (id: string, data: Partial<Workspace>) => api.patch<Workspace>(`/workspaces/${id}`, data),
    delete: (id: string) => api.delete<void>(`/workspaces/${id}`),
    members: (id: string) => api.get<PaginatedResponse<{ id: string; name: string; email: string; role: string }>>(`/workspaces/${id}/members`),
  }
}
