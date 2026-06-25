import { z } from "zod";
import { commonEnvSchema } from "./common";

export const workerEnvSchema = commonEnvSchema.extend({
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(50).default(5),
  WORKER_MAX_STALLED_COUNT: z.coerce.number().int().default(3),
  WORKER_STALL_INTERVAL_MS: z.coerce.number().int().default(30_000),

  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

export type WorkerEnv = z.infer<typeof workerEnvSchema>;
