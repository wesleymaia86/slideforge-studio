export * from "./schemas/common";
export * from "./schemas/api";
export * from "./schemas/worker";
export * from "./schemas/web";
export * from "./loader";

import type { ApiEnv } from "./schemas/api";
import { apiEnvSchema } from "./schemas/api";
import { loadEnv } from "./loader";

/** NestJS ConfigModule validate hook — fail-fast on missing/invalid env. */
export function validateEnv(
  config: Record<string, unknown> = process.env,
): ApiEnv {
  const result = apiEnvSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Environment validation failed — fix the following before starting:\n${formatted}`,
    );
  }

  return result.data;
}

/** Typed env for bootstrap outside NestJS ConfigModule. */
export function getApiEnv(): ApiEnv {
  return loadEnv(apiEnvSchema);
}

export type AppEnv = ApiEnv;
