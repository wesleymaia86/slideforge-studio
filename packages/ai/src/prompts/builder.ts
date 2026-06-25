import type { AIMessage } from "@slideforge/types";
import type { PromptTemplate } from "./templates";

/**
 * Interpolates a prompt template with provided variables.
 * Uses {{variable}} syntax. Missing variables throw at build time (fail-fast).
 */
export function buildPrompt(
  template: PromptTemplate,
  variables: Record<string, string | number>,
): AIMessage[] {
  const interpolate = (text: string): string =>
    text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      if (!(key in variables)) {
        throw new Error(
          `Prompt template "${template.key}" missing required variable: ${key}`,
        );
      }
      return String(variables[key]);
    });

  return [
    { role: "system", content: interpolate(template.system) },
    { role: "user", content: interpolate(template.userTemplate) },
  ];
}
