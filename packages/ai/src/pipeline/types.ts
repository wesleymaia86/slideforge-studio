import type { AIProvider, AIUsageMetrics } from "@slideforge/types";

export interface PipelineContext {
  jobId: string;
  workspaceId: string;
  projectId: string;
  parsedArtifactId: string;
  provider?: AIProvider;
  metadata?: Record<string, unknown>;
}

export interface PipelineStepResult<T = unknown> {
  stepName: string;
  success: boolean;
  output?: T;
  error?: string;
  usage?: AIUsageMetrics;
  durationMs: number;
}

export interface PipelineResult {
  jobId: string;
  steps: PipelineStepResult[];
  success: boolean;
  totalDurationMs: number;
  totalTokensUsed: number;
}

/**
 * Contract for individual pipeline steps (strategy pattern).
 * Each step receives context and can emit partial results.
 */
export interface PipelineStep<TInput = unknown, TOutput = unknown> {
  readonly name: string;
  execute(input: TInput, ctx: PipelineContext): Promise<PipelineStepResult<TOutput>>;
}
