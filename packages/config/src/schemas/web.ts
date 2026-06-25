import { z } from "zod";

export const webEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_API_URL: z.string().url().describe("API base URL exposed to browser"),
  NEXT_PUBLIC_WEB_URL: z.string().url().describe("Frontend public URL"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .optional()
    .describe("Stripe publishable key"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().describe("PostHog analytics key"),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string()
    .url()
    .default("https://app.posthog.com")
    .describe("PostHog host"),
});

export type WebEnv = z.infer<typeof webEnvSchema>;
