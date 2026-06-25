import type {
  AICompletionRequest,
  AICompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "@slideforge/types";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterClientOptions {
  apiKey: string;
  baseUrl?: string;
  referer?: string;
  title?: string;
  timeoutMs?: number;
}

interface OpenRouterChatResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

interface OpenRouterEmbeddingResponse {
  data?: Array<{ embedding?: number[] }>;
  usage?: { prompt_tokens?: number; total_tokens?: number };
}

export class OpenRouterClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: OpenRouterClientOptions) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 60_000;
  }

  isConfigured(): boolean {
    return Boolean(this.options.apiKey?.trim());
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const started = Date.now();
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
    };
    if (request.maxTokens) body.max_tokens = request.maxTokens;
    if (request.responseFormat === "json_object") {
      body.response_format = { type: "json_object" };
    }

    const data = await this.post<OpenRouterChatResponse>("/chat/completions", body);
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";
    const finish = choice?.finish_reason ?? "stop";

    return {
      content,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
        durationMs: Date.now() - started,
        modelId: request.model,
        provider: "openrouter",
      },
      finishReason:
        finish === "length"
          ? "length"
          : finish === "tool_calls"
            ? "tool_calls"
            : finish === "content_filter"
              ? "content_filter"
              : "stop",
    };
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(request.input) ? request.input : [request.input];
    const data = await this.post<OpenRouterEmbeddingResponse>("/embeddings", {
      model: request.model,
      input: inputs,
    });

    const embeddings =
      data.data?.map((row) => row.embedding).filter((e): e is number[] => Array.isArray(e)) ??
      [];

    return {
      embeddings,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      };
      if (this.options.referer) headers["HTTP-Referer"] = this.options.referer;
      if (this.options.title) headers["X-Title"] = this.options.title;

      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        let detail = res.statusText;
        try {
          const errBody = (await res.json()) as { error?: { message?: string } };
          detail = errBody.error?.message ?? detail;
        } catch {
          /* ignore */
        }
        throw new Error(`OpenRouter ${res.status}: ${detail}`);
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}
