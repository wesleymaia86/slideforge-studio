import type { Slide } from "@slideforge/types";
import type { SlideTheme } from "./theme";

/**
 * Contract for slide rendering adapters.
 * Concrete implementations: PPTX renderer (pptxgenjs), HTML renderer, PNG renderer.
 * Implementations live in apps/worker/src/infra/renderers/.
 */
export interface SlideRenderer<TOutput = unknown> {
  readonly format: string;
  render(slides: Slide[], theme: SlideTheme): Promise<TOutput>;
}

export interface RenderOptions {
  theme?: Partial<SlideTheme>;
  slideIndices?: number[];
  quality?: "low" | "medium" | "high";
}
