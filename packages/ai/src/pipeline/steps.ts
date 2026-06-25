/**
 * Named pipeline step constants for queue payloads and audit logging.
 * Concrete implementations live in apps/worker/src/app/.
 */
export const PIPELINE_STEPS = {
  EXTRACT_TEXT: "extract_text",
  GENERATE_EMBEDDING: "generate_embedding",
  EXTRACT_INSIGHTS: "extract_insights",
  GENERATE_OUTLINE: "generate_outline",
  GENERATE_SLIDES: "generate_slides",
  GENERATE_SPEAKER_NOTES: "generate_speaker_notes",
  GENERATE_THUMBNAILS: "generate_thumbnails",
} as const;

export type PipelineStepName = (typeof PIPELINE_STEPS)[keyof typeof PIPELINE_STEPS];
