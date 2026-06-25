import { z } from "zod";

/**
 * Validates process.env against the provided Zod schema.
 * Throws with detailed field-level errors if validation fails — fail-fast at startup.
 */
export function loadEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Environment validation failed — fix the following before starting:\n${formatted}`,
    );
  }

  return result.data as z.infer<T>;
}
