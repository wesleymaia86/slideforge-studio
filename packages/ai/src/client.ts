import type { BriefingInput } from "@slideforge/types";
import { PROMPTS } from "./prompts/templates";
import { buildPrompt } from "./prompts/builder";
import { OpenRouterClient } from "./openrouter/client";

export interface AiClientOptions {
  openRouter?: OpenRouterClient | null;
  outlineModel?: string;
}

interface OutlineSlideStub {
  position: number;
  title: string;
  layoutType: string;
  bulletPoints?: string[];
}

/** Facade sobre pipeline IA — usa OpenRouter quando configurado. */
export class AiClient {
  constructor(private readonly options: AiClientOptions = {}) {}

  async generateOutline(input: BriefingInput, dataContext?: string): Promise<OutlineSlideStub[]> {
    const client = this.options.openRouter;
    if (!client?.isConfigured()) {
      return this.stubOutline(input);
    }

    const model = this.options.outlineModel ?? "openai/gpt-4o-mini";
    const messages = buildPrompt(PROMPTS.GENERATE_SLIDE_OUTLINE, {
      audience: input.audience ?? "público geral",
      tone: input.toneVoice ?? "profissional",
      slideCount: String(
        typeof input.context?.duration === "number"
          ? Math.max(5, Math.min(20, Math.round(input.context.duration / 2)))
          : 10,
      ),
      content: [
        input.objective ? `Objetivo: ${input.objective}` : "",
        dataContext ?? "",
        input.context ? JSON.stringify(input.context) : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });

    const response = await client.complete({
      messages,
      model,
      temperature: 0.4,
      responseFormat: "json_object",
    });

    return this.parseOutline(response.content, input);
  }

  private parseOutline(content: string, input: BriefingInput): OutlineSlideStub[] {
    try {
      const parsed = JSON.parse(content) as {
        slides?: OutlineSlideStub[];
        sections?: Array<{ title?: string; slides?: string[] }>;
      };

      if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        return parsed.slides.map((s, i) => ({
          position: s.position ?? i + 1,
          title: s.title ?? `Slide ${i + 1}`,
          layoutType: s.layoutType ?? "title_content",
          bulletPoints: s.bulletPoints,
        }));
      }

      if (Array.isArray(parsed.sections)) {
        const slides: OutlineSlideStub[] = [];
        let pos = 1;
        for (const section of parsed.sections) {
          slides.push({
            position: pos++,
            title: section.title ?? "Seção",
            layoutType: "section",
          });
          for (const slideTitle of section.slides ?? []) {
            slides.push({
              position: pos++,
              title: slideTitle,
              layoutType: "title_content",
            });
          }
        }
        if (slides.length > 0) return slides;
      }
    } catch {
      /* fallback */
    }

    return this.stubOutline(input);
  }

  private stubOutline(input: BriefingInput): OutlineSlideStub[] {
    const objective = input.objective ?? "Apresentação";
    return [
      { position: 1, title: objective, layoutType: "title" },
      { position: 2, title: "Contexto", layoutType: "title_content", bulletPoints: [] },
      { position: 3, title: "Próximos passos", layoutType: "title_content", bulletPoints: [] },
    ];
  }
}
