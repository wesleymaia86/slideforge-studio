/**
 * Versioned prompt template catalog.
 * Each template has a stable key and version for auditability.
 */

export const PROMPT_VERSION = "1.0.0" as const;

export interface PromptTemplate {
  key: string;
  version: string;
  system: string;
  userTemplate: string;
}

export const PROMPTS = {
  EXTRACT_KEY_POINTS: {
    key: "extract_key_points",
    version: PROMPT_VERSION,
    system: `You are an expert analyst. Extract the most important key points from the provided content.
Return a JSON array of strings, each being a distinct key point.`,
    userTemplate: `Extract key points from the following content:\n\n{{content}}`,
  },

  GENERATE_SLIDE_OUTLINE: {
    key: "generate_slide_outline",
    version: PROMPT_VERSION,
    system: `You are a professional presentation designer. Create a structured slide outline from provided content.
Return valid JSON matching the SlideOutline schema.`,
    userTemplate: `Create a presentation outline for the following content.
Target audience: {{audience}}
Tone: {{tone}}
Number of slides: {{slideCount}}

Content:
{{content}}`,
  },

  GENERATE_SLIDE_CONTENT: {
    key: "generate_slide_content",
    version: PROMPT_VERSION,
    system: `You are a professional copywriter for presentations. Generate compelling slide content.
Return valid JSON matching the SlideContent schema.`,
    userTemplate: `Generate content for slide {{slideIndex}} of {{totalSlides}}.
Layout: {{layout}}
Context from previous slides: {{context}}
Source content: {{sourceContent}}`,
  },

  GENERATE_SPEAKER_NOTES: {
    key: "generate_speaker_notes",
    version: PROMPT_VERSION,
    system: `You are a presentation coach. Generate natural speaker notes for each slide.`,
    userTemplate: `Generate speaker notes for the following slide:
Title: {{title}}
Content: {{content}}
Context: {{context}}`,
  },

  SUMMARIZE_DOCUMENT: {
    key: "summarize_document",
    version: PROMPT_VERSION,
    system: `You are a document analyst. Summarize the provided document concisely.`,
    userTemplate: `Summarize this document in {{maxWords}} words or less:\n\n{{content}}`,
  },
} satisfies Record<string, PromptTemplate>;

export type PromptKey = keyof typeof PROMPTS;
