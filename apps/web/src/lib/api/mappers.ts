import type {
  Workspace,
  Project,
  Job,
  Upload,
  Insight,
  Slide,
  BriefingData,
  Outline,
  Export,
} from './types'

type ApiWorkspace = {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  createdAt: string
  role?: string
  _count?: { projects?: number; members?: number }
}

type ApiProject = {
  id: string
  workspaceId: string
  name: string
  description?: string | null
  status: string
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string | null
  _count?: { decks?: number }
}

type ApiDeck = {
  id: string
  projectId: string
  workspaceId: string
  title: string
  description?: string | null
  status: string
  slideCount: number
  thumbnailUrl?: string | null
  createdAt: string
  updatedAt: string
}

type ApiSlide = {
  id: string
  deckId: string
  position: number
  layout: string
  content: unknown
  speakerNotes?: string | null
  thumbnailUrl?: string | null
}

type ApiProcessingJob = {
  id: string
  workspaceId: string
  projectId?: string | null
  deckId?: string | null
  type: string
  status: string
  progress: number
  errorMessage?: string | null
  queuedAt: string
  completedAt?: string | null
}

type ApiFileAsset = {
  id: string
  workspaceId: string
  projectId?: string | null
  originalName: string
  mimeType: string
  sizeBytes: number | string | bigint
  storageUrl?: string | null
  createdAt: string
}

type ApiInsight = {
  id: string
  projectId: string
  type: string
  content: string
  createdAt: string
  modelUsed?: string | null
}

type ApiBriefing = {
  id: string
  deckId: string
  audience?: string | null
  objective?: string | null
  toneVoice?: string | null
  contextJson?: Record<string, unknown> | null
  outlines?: ApiOutline[]
}

type ApiOutline = {
  id: string
  briefingId: string
  slidesJson: unknown
  createdAt: string
}

type ApiExportJob = {
  id: string
  deckId: string
  format: string
  status: string
  downloadUrl?: string | null
  createdAt: string
}

const JOB_TYPE_MAP: Record<string, Job['type']> = {
  file_parse: 'upload',
  ai_pipeline: 'analysis',
  export: 'export',
  thumbnail: 'generation',
}

const JOB_STATUS_MAP: Record<string, Job['status']> = {
  pending: 'pending',
  queued: 'pending',
  running: 'running',
  processing: 'running',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'failed',
  retrying: 'running',
}

const INSIGHT_TYPE_MAP: Record<string, Insight['type']> = {
  summary: 'summary',
  key_points: 'topic',
  tone: 'sentiment',
  audience: 'recommendation',
  action_items: 'recommendation',
  custom: 'keyword',
}

const PROJECT_STATUS_MAP: Record<string, Project['status']> = {
  draft: 'draft',
  processing: 'processing',
  ready: 'ready',
  archived: 'draft',
  error: 'error',
}

function slideContent(content: unknown): { title?: string; body?: string } {
  if (!content || typeof content !== 'object') return {}
  const c = content as Record<string, unknown>
  return {
    title: typeof c.title === 'string' ? c.title : undefined,
    body:
      typeof c.body === 'string'
        ? c.body
        : typeof c.text === 'string'
          ? c.text
          : undefined,
  }
}

export function mapWorkspace(ws: ApiWorkspace, projectCount = 0): Workspace {
  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    logoUrl: ws.logoUrl ?? undefined,
    plan: 'free',
    createdAt: ws.createdAt,
    _count: {
      projects: ws._count?.projects ?? projectCount,
      members: ws._count?.members ?? 0,
    },
  }
}

export function mapProject(p: ApiProject, slideCount = 0): Project {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    name: p.name,
    description: p.description ?? undefined,
    status: PROJECT_STATUS_MAP[p.status] ?? 'draft',
    slideCount: slideCount || p._count?.decks || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    thumbnailUrl: p.thumbnailUrl ?? undefined,
  }
}

export function mapDeckToProjectSummary(deck: ApiDeck, project: ApiProject): Project {
  return {
    ...mapProject(project, deck.slideCount),
    thumbnailUrl: deck.thumbnailUrl ?? undefined,
  }
}

export function mapSlide(s: ApiSlide): Slide {
  const { title, body } = slideContent(s.content)
  return {
    id: s.id,
    projectId: s.deckId,
    index: s.position - 1,
    title,
    content: body,
    speakerNotes: s.speakerNotes ?? undefined,
    layout: s.layout,
    thumbnailUrl: s.thumbnailUrl ?? undefined,
  }
}

export function mapJob(j: ApiProcessingJob): Job {
  return {
    id: j.id,
    projectId: j.projectId ?? '',
    type: JOB_TYPE_MAP[j.type] ?? 'analysis',
    status: JOB_STATUS_MAP[j.status] ?? 'pending',
    progress: j.progress,
    message: j.errorMessage ?? undefined,
    createdAt: j.queuedAt,
    completedAt: j.completedAt ?? undefined,
  }
}

export function mapFileAsset(f: ApiFileAsset): Upload {
  const size =
    typeof f.sizeBytes === 'bigint'
      ? Number(f.sizeBytes)
      : typeof f.sizeBytes === 'string'
        ? parseInt(f.sizeBytes, 10)
        : f.sizeBytes

  return {
    id: f.id,
    projectId: f.projectId ?? '',
    filename: f.originalName,
    size,
    mimeType: f.mimeType,
    url: f.storageUrl ?? '',
    status: 'ready',
    createdAt: f.createdAt,
  }
}

export function mapInsight(i: ApiInsight): Insight {
  return {
    id: i.id,
    projectId: i.projectId,
    type: INSIGHT_TYPE_MAP[i.type] ?? 'summary',
    content: i.content,
    confidence: 0.85,
    metadata: i.modelUsed ? { modelUsed: i.modelUsed } : undefined,
  }
}

export function mapBriefing(b: ApiBriefing, projectId: string): BriefingData {
  const ctx = b.contextJson ?? {}
  return {
    projectId,
    audience: b.audience ?? undefined,
    objective: b.objective ?? undefined,
    tone: b.toneVoice ?? undefined,
    duration: typeof ctx.duration === 'number' ? ctx.duration : undefined,
    keyMessages: Array.isArray(ctx.keyMessages)
      ? (ctx.keyMessages as string[])
      : undefined,
    context: typeof ctx.notes === 'string' ? ctx.notes : undefined,
  }
}

export function briefingToPayload(data: BriefingData) {
  return {
    audience: data.audience,
    objective: data.objective,
    toneVoice: data.tone,
    context: {
      duration: data.duration,
      keyMessages: data.keyMessages,
      notes: data.context,
    },
  }
}

export function mapOutline(outline: ApiOutline, projectId: string): Outline {
  const slidesJson = outline.slidesJson
  if (Array.isArray(slidesJson)) {
    return {
      projectId,
      sections: slidesJson.map((section, i) => {
        const s = section as { id?: string; title?: string; slides?: string[]; order?: number }
        return {
          id: s.id ?? `section-${i}`,
          title: s.title ?? `Section ${i + 1}`,
          slides: s.slides ?? [],
          order: s.order ?? i,
        }
      }),
    }
  }

  if (slidesJson && typeof slidesJson === 'object') {
    const o = slidesJson as { sections?: Array<{ id?: string; title?: string; slides?: string[]; order?: number }> }
    if (o.sections) {
      return {
        projectId,
        sections: o.sections.map((s, i) => ({
          id: s.id ?? `section-${i}`,
          title: s.title ?? `Section ${i + 1}`,
          slides: s.slides ?? [],
          order: s.order ?? i,
        })),
      }
    }
  }

  return { projectId, sections: [] }
}

export function mapExport(e: ApiExportJob, projectId: string): Export {
  const status =
    e.status === 'completed' || e.status === 'ready'
      ? 'ready'
      : e.status === 'failed'
        ? 'error'
        : 'pending'

  return {
    id: e.id,
    projectId,
    format: e.format,
    status,
    url: e.downloadUrl ?? undefined,
    createdAt: e.createdAt,
  }
}

export type {
  ApiWorkspace,
  ApiProject,
  ApiDeck,
  ApiSlide,
  ApiProcessingJob,
  ApiFileAsset,
  ApiInsight,
  ApiBriefing,
  ApiOutline,
  ApiExportJob,
}
