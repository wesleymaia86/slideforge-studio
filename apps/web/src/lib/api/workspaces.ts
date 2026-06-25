import { createApiClient } from './client'
import { mapWorkspace, type ApiWorkspace } from './mappers'
import type { Workspace } from './types'

export function workspacesApi(token?: string) {
  const api = createApiClient(token)

  return {
    list: async (): Promise<Workspace[]> => {
      const data = await api.get<ApiWorkspace[]>('/workspaces')
      return data.map((ws) => mapWorkspace(ws))
    },

    get: async (id: string): Promise<Workspace> => {
      const data = await api.get<ApiWorkspace>(`/workspaces/${id}`)
      return mapWorkspace(data)
    },

    create: (data: { name: string; slug: string }) =>
      api.post<ApiWorkspace>('/workspaces', data),

    update: (id: string, data: Partial<Workspace>) =>
      api.patch<ApiWorkspace>(`/workspaces/${id}`, data),

    delete: (id: string) => api.delete<void>(`/workspaces/${id}`),

    members: (id: string) => api.get(`/workspaces/${id}/members`),
  }
}
