export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Workspace {
  id: string
  name: string
  slug: string
  logoUrl?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
  _count?: { projects: number; members: number }
}

export interface Project {
  id: string
  workspaceId: string
  name: string
  description?: string
  status: 'draft' | 'processing' | 'ready' | 'error'
  slideCount: number
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
}

export interface Job {
  id: string
  projectId: string
  type: 'upload' | 'transcription' | 'analysis' | 'generation' | 'export'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message?: string
  createdAt: string
  completedAt?: string
  metadata?: Record<string, unknown>
}

export interface Upload {
  id: string
  projectId: string
  filename: string
  size: number
  mimeType: string
  url: string
  status: 'uploading' | 'ready' | 'error'
  createdAt: string
}

export interface Insight {
  id: string
  projectId: string
  type: 'summary' | 'topic' | 'sentiment' | 'keyword' | 'recommendation'
  content: string
  confidence: number
  metadata?: Record<string, unknown>
}

export interface BriefingData {
  projectId: string
  audience?: string
  objective?: string
  tone?: string
  duration?: number
  keyMessages?: string[]
  context?: string
}

export interface Slide {
  id: string
  projectId: string
  index: number
  title?: string
  content?: string
  speakerNotes?: string
  layout?: string
  bgColor?: string
  thumbnailUrl?: string
}

export interface Outline {
  projectId: string
  sections: OutlineSection[]
}

export interface OutlineSection {
  id: string
  title: string
  slides: string[]
  order: number
}

export interface ExportConfig {
  format: 'pptx' | 'pdf' | 'png' | 'html'
  quality?: 'draft' | 'standard' | 'high'
  includeNotes?: boolean
}

export interface Export {
  id: string
  projectId: string
  format: string
  status: 'pending' | 'ready' | 'error'
  url?: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  avatarUrl?: string
  createdAt: string
}
