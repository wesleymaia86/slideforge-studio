import type {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
  EmbeddingRequest,
  EmbeddingResponse,
} from "@slideforge/types";

/**
 * Contract that every AI provider adapter must implement.
 * Concrete implementations live in apps/api/src/infra/ai/.
 */
export interface AIProviderAdapter {
  readonly provider: AIProvider;
  readonly defaultModel: string;

  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  isAvailable(): boolean;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}
