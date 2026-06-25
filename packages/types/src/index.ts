// ─── Enums (mirror Prisma enums for worker/shared use) ────────────────────────

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  APPROVER = 'APPROVER',
}

export enum JobStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export enum InsightSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

// ─── Job Queue Payloads ────────────────────────────────────────────────────────

export interface ProcessFileJobPayload {
  jobId: string;
  fileAssetId: string;
  workspaceId: string;
  storageKey: string;
  mimeType: string;
  originalName: string;
}

export interface JobProgressUpdate {
  jobId: string;
  status: JobStatus;
  progress: number;
  errorMessage?: string;
}

// ─── Parsed Artifact ──────────────────────────────────────────────────────────

export interface ColumnSchema {
  name: string;
  dtype: string;
  nullable: boolean;
  sampleValues?: unknown[];
}

export interface ParsedArtifactPayload {
  jobId: string;
  rowCount: number;
  columnCount: number;
  sheetNames: string[];
  schema: ColumnSchema[];
  preview: Record<string, unknown>[];
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export interface InsightPayload {
  jobId: string;
  title: string;
  bodyMarkdown: string;
  severity: InsightSeverity;
  meta?: Record<string, unknown>;
}

// ─── Briefing & Outline ───────────────────────────────────────────────────────

export interface BriefingInput {
  audience?: string;
  objective?: string;
  toneVoice?: string;
  context?: Record<string, unknown>;
}

export interface OutlineSlide {
  position: number;
  title: string;
  layoutType: string;
  speakerNotes?: string;
  bulletPoints?: string[];
}

export interface GeneratedOutline {
  slides: OutlineSlide[];
  totalSlides: number;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
}
