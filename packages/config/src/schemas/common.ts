import { z } from "zod";

export const commonEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .url()
    .describe("PostgreSQL connection URL (pgvector-enabled instance)"),
  DIRECT_DATABASE_URL: z
    .string()
    .url()
    .optional()
    .describe("Direct DB URL for migrations (bypasses pooler)"),
  REDIS_URL: z
    .string()
    .url()
    .default("redis://localhost:6379")
    .describe("Redis connection URL (BullMQ, cache)"),
  STORAGE_ENDPOINT: z
    .string()
    .url()
    .describe("S3-compatible storage endpoint (MinIO, AWS S3, R2)"),
  STORAGE_BUCKET: z.string().describe("Primary storage bucket name"),
  STORAGE_ACCESS_KEY: z.string().describe("Storage access key ID"),
  STORAGE_SECRET_KEY: z.string().describe("Storage secret access key"),
  STORAGE_REGION: z.string().default("us-east-1").describe("Storage region"),
  STORAGE_FORCE_PATH_STYLE: z
    .string()
    .transform((v) => v === "true")
    .default("false")
    .describe("Force path-style URLs (required for MinIO/LocalStack)"),
});

export type CommonEnv = z.infer<typeof commonEnvSchema>;
