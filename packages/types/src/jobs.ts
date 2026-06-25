import { ExportFormat, JobStatus, JobType } from "./enums";

export interface ProcessingJob {
  id: string;
  workspaceId: string;
  projectId: string | null;
  deckId: string | null;
  type: JobType;
  status: JobStatus;
  progress: number;
  errorMessage: string | null;
  attempts: number;
  maxAttempts: number;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  queuedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface ExportJob {
  id: string;
  deckId: string;
  requestedByUserId: string;
  format: ExportFormat;
  status: JobStatus;
  fileAssetId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FileParsePaylod = {
  fileAssetId: string;
  projectId: string;
};

export type AIPipelinePayload = {
  projectId: string;
  parsedArtifactId: string;
  deckId?: string;
};

export type ExportPayload = {
  deckId: string;
  format: ExportFormat;
  exportJobId: string;
};
