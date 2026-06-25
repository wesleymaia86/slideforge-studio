import { createApiClient } from './client'
import type { Job, Upload } from './types'

export function jobsApi(token?: string) {
  const api = createApiClient(token)

  return {
    list: (projectId: string) => api.get<Job[]>(`/projects/${projectId}/jobs`),
    get: (projectId: string, jobId: string) => api.get<Job>(`/projects/${projectId}/jobs/${jobId}`),
    retry: (projectId: string, jobId: string) => api.post<Job>(`/projects/${projectId}/jobs/${jobId}/retry`),
    cancel: (projectId: string, jobId: string) => api.post<void>(`/projects/${projectId}/jobs/${jobId}/cancel`),
  }
}

export function uploadsApi(token?: string) {
  const api = createApiClient(token)

  return {
    list: (projectId: string) => api.get<Upload[]>(`/projects/${projectId}/uploads`),
    initiate: (projectId: string, data: { filename: string; size: number; mimeType: string }) =>
      api.post<{ uploadUrl: string; uploadId: string }>(`/projects/${projectId}/uploads/initiate`, data),
    confirm: (projectId: string, uploadId: string) =>
      api.post<Upload>(`/projects/${projectId}/uploads/${uploadId}/confirm`),
    delete: (projectId: string, uploadId: string) =>
      api.delete<void>(`/projects/${projectId}/uploads/${uploadId}`),
  }
}
