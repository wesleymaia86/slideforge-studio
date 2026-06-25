import { createApiClient } from './client'

export interface AdminStats {
  users: number
  workspaces: number
  fileAssets: number
  processingJobs: number
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  isSuperAdmin: boolean
  createdAt: string
}

export interface AdminWorkspace {
  id: string
  name: string
  slug: string
  createdAt: string
  _count?: { members: number; projects: number }
}

export function adminApi(token?: string) {
  const api = createApiClient(token)

  return {
    stats: () => api.get<AdminStats>('/admin/stats'),
    users: (page = 1, pageSize = 50) =>
      api.get<{ data: AdminUser[]; total: number }>('/admin/users', { page, pageSize }),
    workspaces: (page = 1, pageSize = 50) =>
      api.get<{ data: AdminWorkspace[]; total: number }>('/admin/workspaces', { page, pageSize }),
  }
}
