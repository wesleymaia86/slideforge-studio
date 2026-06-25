import { createApiClient } from './client'
import {
  mapProject,
  mapSlide,
  mapInsight,
  mapBriefing,
  briefingToPayload,
  mapOutline,
  mapExport,
  type ApiProject,
  type ApiDeck,
  type ApiSlide,
  type ApiInsight,
  type ApiBriefing,
  type ApiOutline,
  type ApiExportJob,
  type ApiWorkspace,
} from './mappers'
import type { Project, Slide, Outline, BriefingData, Insight, Export, ExportConfig } from './types'

function wsPath(workspaceId: string, suffix: string) {
  return `/workspaces/${workspaceId}${suffix}`
}

export function projectsApi(token: string | undefined, workspaceId: string) {
  const api = createApiClient(token)

  return {
    list: async (): Promise<Project[]> => {
      const data = await api.get<ApiProject[]>(wsPath(workspaceId, '/projects'))
      return data.map((p) => mapProject(p, p._count?.decks ?? 0))
    },

    get: async (id: string): Promise<Project> => {
      const data = await api.get<ApiProject>(wsPath(workspaceId, `/projects/${id}`))
      return mapProject(data, data._count?.decks ?? 0)
    },

    create: async (data: { name: string; description?: string }): Promise<Project> => {
      const created = await api.post<ApiProject>(wsPath(workspaceId, '/projects'), data)
      return mapProject(created)
    },

    update: (id: string, data: Partial<Project>) =>
      api.patch<ApiProject>(wsPath(workspaceId, `/projects/${id}`), data),

    delete: (id: string) => api.delete<void>(wsPath(workspaceId, `/projects/${id}`)),

    decks: {
      list: (projectId: string) =>
        api.get<ApiDeck[]>(wsPath(workspaceId, `/projects/${projectId}/decks`)),

      get: (projectId: string, deckId: string) =>
        api.get<ApiDeck & { slides?: ApiSlide[] }>(
          wsPath(workspaceId, `/projects/${projectId}/decks/${deckId}`),
        ),

      create: (projectId: string, data: { name: string; description?: string }) =>
        api.post<ApiDeck>(wsPath(workspaceId, `/projects/${projectId}/decks`), data),

      slides: (projectId: string, deckId: string) =>
        api
          .get<ApiSlide[]>(wsPath(workspaceId, `/projects/${projectId}/decks/${deckId}/slides`))
          .then((slides) => slides.map(mapSlide)),

      updateSlide: (
        projectId: string,
        deckId: string,
        slideId: string,
        data: Partial<Slide>,
      ) => {
        const payload: Record<string, unknown> = {}
        if (data.index !== undefined) payload.position = data.index + 1
        if (data.title !== undefined || data.content !== undefined) {
          payload.contentJson = {
            title: data.title,
            body: data.content,
          }
        }
        if (data.speakerNotes !== undefined) payload.notesText = data.speakerNotes
        if (data.layout !== undefined) payload.layoutType = data.layout
        return api.patch<ApiSlide>(
          wsPath(workspaceId, `/projects/${projectId}/decks/${deckId}/slides/${slideId}`),
          payload,
        )
      },
    },

    insights: (projectId: string) =>
      api
        .get<ApiInsight[]>(wsPath(workspaceId, '/insights'), { projectId })
        .then((items) => items.map(mapInsight)),

    briefing: async (deckId: string, projectId: string): Promise<BriefingData | null> => {
      const briefings = await api.get<ApiBriefing[]>(
        wsPath(workspaceId, `/decks/${deckId}/briefings`),
      )
      const latest = briefings[0]
      return latest ? mapBriefing(latest, projectId) : null
    },

    latestBriefing: (deckId: string) =>
      api.get<ApiBriefing[]>(wsPath(workspaceId, `/decks/${deckId}/briefings`)).then((b) => b[0] ?? null),

    saveBriefing: async (deckId: string, projectId: string, data: BriefingData) => {
      const created = await api.post<ApiBriefing>(
        wsPath(workspaceId, `/decks/${deckId}/briefings`),
        briefingToPayload(data),
      )
      return mapBriefing(created, projectId)
    },

    outline: async (deckId: string, projectId: string, briefingId?: string): Promise<Outline> => {
      if (!briefingId) {
        const briefings = await api.get<ApiBriefing[]>(
          wsPath(workspaceId, `/decks/${deckId}/briefings`),
        )
        const latest = briefings[0]
        const outline = latest?.outlines?.[0]
        return outline ? mapOutline(outline, projectId) : { projectId, sections: [] }
      }

      const outlines = await api.get<ApiOutline[]>(
        wsPath(workspaceId, `/decks/${deckId}/briefings/${briefingId}/outlines`),
      )
      const latest = outlines[0]
      return latest ? mapOutline(latest, projectId) : { projectId, sections: [] }
    },

    generateOutline: async (deckId: string, briefingId: string, projectId: string) => {
      const created = await api.post<ApiOutline>(
        wsPath(workspaceId, `/decks/${deckId}/briefings/${briefingId}/outline`),
        {},
      )
      return mapOutline(created, projectId)
    },

    exports: (deckId: string, projectId: string) =>
      api
        .get<ApiExportJob[]>(wsPath(workspaceId, `/decks/${deckId}/exports`))
        .then((items) => items.map((e) => mapExport(e, projectId))),

    createExport: (deckId: string, projectId: string, config: ExportConfig) =>
      api
        .post<ApiExportJob>(wsPath(workspaceId, `/decks/${deckId}/exports`), {
          format: config.format,
        })
        .then((e) => mapExport(e, projectId)),
  }
}

/** List projects across all workspaces for the current user. */
export async function listAllProjects(token?: string): Promise<Project[]> {
  const wsApi = createApiClient(token)
  const workspaces = await wsApi.get<ApiWorkspace[]>('/workspaces')
  const nested = await Promise.all(
    workspaces.map(async (ws) => {
      const projects = await wsApi.get<ApiProject[]>(`/workspaces/${ws.id}/projects`)
      return projects.map((p) => mapProject({ ...p, workspaceId: ws.id }, p._count?.decks ?? 0))
    }),
  )
  return nested.flat()
}

/** Resolve workspace for a project id by scanning memberships. */
export async function resolveProjectScope(
  token: string | undefined,
  projectId: string,
): Promise<{ workspaceId: string; project: Project }> {
  const wsApi = createApiClient(token)
  const workspaces = await wsApi.get<ApiWorkspace[]>('/workspaces')

  for (const ws of workspaces) {
    try {
      const project = await projectsApi(token, ws.id).get(projectId)
      return { workspaceId: ws.id, project }
    } catch {
      continue
    }
  }

  throw new Error('Project not found')
}
