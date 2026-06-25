import type { AIProvider } from "@slideforge/types";
import type { AIProviderAdapter } from "./types";

/**
 * Runtime registry for AI provider adapters.
 * Providers are registered at application bootstrap (in infra layer).
 */
export class AIProviderRegistry {
  private readonly adapters = new Map<AIProvider, AIProviderAdapter>();
  private defaultProvider: AIProvider | null = null;

  register(adapter: AIProviderAdapter, isDefault = false): void {
    this.adapters.set(adapter.provider, adapter);
    if (isDefault || this.adapters.size === 1) {
      this.defaultProvider = adapter.provider;
    }
  }

  resolve(provider?: AIProvider): AIProviderAdapter {
    const key = provider ?? this.defaultProvider;
    if (!key) {
      throw new Error("No AI provider registered");
    }
    const adapter = this.adapters.get(key);
    if (!adapter) {
      throw new Error(`AI provider not registered: ${key}`);
    }
    return adapter;
  }

  list(): AIProvider[] {
    return Array.from(this.adapters.keys());
  }
}
