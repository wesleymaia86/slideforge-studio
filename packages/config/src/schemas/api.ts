import { z } from "zod";
import { commonEnvSchema } from "./common";

export const apiEnvSchema = commonEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default("0.0.0.0"),
  API_URL: z.string().url().describe("Public API base URL"),
  WEB_URL: z.string().url().describe("Frontend origin for CORS"),
  JWT_SECRET: z.string().min(32).describe("JWT signing secret (>=32 chars)"),
  JWT_EXPIRY: z.string().default("15m").describe("Access token expiry"),
  JWT_REFRESH_SECRET: z.string().min(32).describe("Refresh token signing secret"),
  JWT_REFRESH_EXPIRY: z.string().default("30d").describe("Refresh token expiry"),
  WORKER_API_KEY: z.string().min(32).describe("Shared secret for worker→API internal callbacks"),

  OPENROUTER_API_KEY: z.string().optional().describe("OpenRouter API key (sk-or-v1-…)"),
  OPENROUTER_MODEL_ATENDIMENTO: z
    .string()
    .default("openai/gpt-4o-mini")
    .describe("Modelo agente atendimento"),
  OPENROUTER_MODEL_TRIAGEM: z
    .string()
    .default("openai/gpt-4o-mini")
    .describe("Modelo agente triagem / roteiro"),
  OPENROUTER_MODEL_QUALIFICACAO: z
    .string()
    .default("openai/gpt-4o")
    .describe("Modelo agente qualificação"),
  OPENROUTER_MODEL_IMOVEIS: z
    .string()
    .default("openai/gpt-4o-mini")
    .describe("Modelo agente busca imóveis"),
  OPENROUTER_MODEL_HANDOFF: z
    .string()
    .default("openai/gpt-4o-mini")
    .describe("Modelo agente handoff"),
  OPENROUTER_MODEL_EMBEDDING: z
    .string()
    .default("openai/text-embedding-3-small")
    .describe("Modelo embeddings RAG"),
  AI_AGENT_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("false")
    .describe("Habilita chamadas LLM via OpenRouter"),

  OPENAI_API_KEY: z.string().optional().describe("OpenAI API key (legado — preferir OpenRouter)"),
  ANTHROPIC_API_KEY: z.string().optional().describe("Anthropic API key"),
  GOOGLE_AI_API_KEY: z.string().optional().describe("Google AI (Gemini) API key"),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional().describe("Azure OpenAI endpoint"),
  AZURE_OPENAI_API_KEY: z.string().optional().describe("Azure OpenAI API key"),

  EMAIL_PROVIDER: z.enum(["resend", "sendgrid", "smtp", "console"]).default("console"),
  EMAIL_FROM: z.string().email().default("noreply@slideforge.io"),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional().describe("Stripe secret key"),
  STRIPE_WEBHOOK_SECRET: z.string().optional().describe("Stripe webhook signing secret"),

  SENTRY_DSN: z.string().url().optional().describe("Sentry DSN for error tracking"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
