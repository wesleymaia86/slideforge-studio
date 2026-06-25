import { createApiClient } from './client'
import { mapJob, mapFileAsset, type ApiProcessingJob, type ApiFileAsset } from './mappers'
import type { Job, Upload } from './types'

export function jobsApi(token: string | undefined, workspaceId: string) {
  const api = createApiClient(token)
  const base = `/workspaces/${workspaceId}`

  return {
    list: async (projectId?: string): Promise<Job[]> => {
      const data = await api.get<ApiProcessingJob[]>(`${base}/processing-jobs`)
      const jobs = data.map(mapJob)
      return projectId ? jobs.filter((j) => j.projectId === projectId) : jobs
    },

    get: (jobId: string) => api.get<ApiProcessingJob>(`${base}/processing-jobs/${jobId}`),
  }
}

export function uploadsApi(token: string | undefined, workspaceId: string) {
  const api = createApiClient(token)
  const base = `/workspaces/${workspaceId}/file-assets`

  return {
    list: async (projectId?: string): Promise<Upload[]> => {
      const data = await api.get<ApiFileAsset[]>(base)
      const uploads = data.map(mapFileAsset)
      return projectId ? uploads.filter((u) => !u.projectId || u.projectId === projectId) : uploads
    },

    upload: async (file: File, projectId?: string) => {
      const form = new FormData()
      form.append('file', file)
      const asset = await api.upload<ApiFileAsset>(`${base}/upload`, form)
      return mapFileAsset({ ...asset, projectId: projectId ?? asset.projectId })
    },

    delete: (assetId: string) => api.delete<void>(`${base}/${assetId}`),
  }
}
