import type { AIProvider } from "@slideforge/types";
import type { AIProviderAdapter, AIProviderConfig } from "./types";
import { OpenRouterClient } from "../openrouter/client";

/** Adapter OpenRouter — única superfície LLM/embeddings em produção. */
export class OpenRouterProvider implements AIProviderAdapter {
  readonly provider: AIProvider = "openrouter";
  readonly defaultModel: string;
  private readonly client: OpenRouterClient;

  constructor(config: AIProviderConfig) {
    this.defaultModel = config.defaultModel ?? "openai/gpt-4o-mini";
    this.client = new OpenRouterClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      referer: config.baseUrl,
      title: "SlideForge Studio",
      timeoutMs: config.timeout,
    });
  }

  isAvailable(): boolean {
    return this.client.isConfigured();
  }

  complete(request: Parameters<OpenRouterClient["complete"]>[0]) {
    return this.client.complete({
      ...request,
      model: request.model || this.defaultModel,
    });
  }

  embed(request: Parameters<OpenRouterClient["embed"]>[0]) {
    return this.client.embed({
      ...request,
      model: request.model || this.defaultModel,
    });
  }
}
