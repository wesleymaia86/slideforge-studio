import { FileAssetType, InsightType, ProjectStatus } from "./enums";

export interface Project {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAsset {
  id: string;
  workspaceId: string;
  projectId: string | null;
  uploadedByUserId: string;
  type: FileAssetType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  storageUrl: string | null;
  createdAt: Date;
}

export interface ParsedArtifact {
  id: string;
  projectId: string;
  fileAssetId: string;
  rawText: string | null;
  structuredContent: Record<string, unknown> | null;
  pageCount: number | null;
  embeddingVector: number[] | null;
  createdAt: Date;
}

export interface Insight {
  id: string;
  projectId: string;
  type: InsightType;
  content: string;
  modelUsed: string | null;
  promptVersion: string | null;
  createdAt: Date;
}

export type CreateProjectInput = Pick<Project, "workspaceId" | "name" | "description">;
export type UpdateProjectInput = Partial<Pick<Project, "name" | "description" | "status">>;
