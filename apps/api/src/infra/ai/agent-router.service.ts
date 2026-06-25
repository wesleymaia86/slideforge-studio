import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AgentProfile } from "@slideforge/types";

const DEFAULT_MODELS: Record<AgentProfile, string> = {
  outline: "openai/gpt-4o-mini",
  insights: "openai/gpt-4o-mini",
  briefing: "openai/gpt-4o-mini",
  embedding: "openai/text-embedding-3-small",
};

@Injectable()
export class AgentRouterService {
  constructor(private readonly config: ConfigService) {}

  getModel(profile: AgentProfile): string {
    // All text-generation profiles use OPENROUTER_MODEL; embedding keeps its default.
    if (profile !== "embedding") {
      return this.config.get<string>("OPENROUTER_MODEL") ?? DEFAULT_MODELS[profile];
    }
    return DEFAULT_MODELS[profile];
  }

  /** Profile used for outline generation from a briefing. */
  resolveOutlineProfile(): AgentProfile {
    return "outline";
  }
}
