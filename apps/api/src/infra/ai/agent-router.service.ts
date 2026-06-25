import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AgentProfile } from "@slideforge/types";

const DEFAULT_MODELS: Record<AgentProfile, string> = {
  atendimento: "openai/gpt-4o-mini",
  triagem: "openai/gpt-4o-mini",
  qualificacao: "openai/gpt-4o",
  busca_imoveis: "openai/gpt-4o-mini",
  handoff: "openai/gpt-4o-mini",
  embedding: "openai/text-embedding-3-small",
};

const ENV_KEYS: Record<AgentProfile, string> = {
  atendimento: "OPENROUTER_MODEL_ATENDIMENTO",
  triagem: "OPENROUTER_MODEL_TRIAGEM",
  qualificacao: "OPENROUTER_MODEL_QUALIFICACAO",
  busca_imoveis: "OPENROUTER_MODEL_IMOVEIS",
  handoff: "OPENROUTER_MODEL_HANDOFF",
  embedding: "OPENROUTER_MODEL_EMBEDDING",
};

@Injectable()
export class AgentRouterService {
  constructor(private readonly config: ConfigService) {}

  getModel(profile: AgentProfile): string {
    return this.config.get<string>(ENV_KEYS[profile]) ?? DEFAULT_MODELS[profile];
  }

  /** Perfil padrão para geração de roteiro a partir de briefing. */
  resolveOutlineProfile(): AgentProfile {
    return "triagem";
  }
}
