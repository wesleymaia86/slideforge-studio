export type AIProvider =
  | "openrouter"
  | "openai"
  | "anthropic"
  | "google"
  | "azure-openai";

/** Perfis de agente roteados via OpenRouter (env OPENROUTER_MODEL_*). */
export type AgentProfile =
  | "atendimento"
  | "triagem"
  | "qualificacao"
  | "busca_imoveis"
  | "handoff"
  | "embedding";

export interface AIModel {
  provider: AIProvider;
  modelId: string;
  displayName: string;
  maxTokens: number;
  supportsVision: boolean;
  supportsTools: boolean;
}

export interface AIUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
  modelId: string;
  provider: AIProvider;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

export interface AICompletionResponse {
  content: string;
  usage: AIUsageMetrics;
  finishReason: "stop" | "length" | "tool_calls" | "content_filter";
}

export interface EmbeddingRequest {
  input: string | string[];
  model: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  usage: Pick<AIUsageMetrics, "inputTokens" | "totalTokens">;
}
