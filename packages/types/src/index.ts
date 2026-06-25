/**
 * @slideforge/types — canonical TypeScript contracts for SlideForge Studio.
 *
 * Enum values here mirror Prisma-generated enum values (lowercase).
 * Re-exports from domain modules for clean import paths.
 */

// --- Domain enums & types ----------------------------------------------------
export * from "./enums";
export * from "./user";
export * from "./workspace";
export * from "./project";
export * from "./deck";
export * from "./slide";
export * from "./ai";
export * from "./jobs";
export * from "./subscription";
export * from "./audit";
export * from "./api";

// --- Worker queue payload contracts (used by BullMQ producers/consumers) -----

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
  /** Maps to JobStatus enum value */
  status: string;
  progress: number;
  errorMessage?: string;
}

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

export interface InsightPayload {
  jobId: string;
  title: string;
  bodyMarkdown: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  meta?: Record<string, unknown>;
}

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
