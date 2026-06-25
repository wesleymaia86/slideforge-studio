import { SlideLayout } from "./enums";

export interface SlideContent {
  heading?: string;
  subheading?: string;
  body?: string;
  bullets?: string[];
  imageUrl?: string;
  imageAlt?: string;
  metrics?: Array<{ label: string; value: string; change?: string }>;
  quote?: { text: string; attribution?: string };
  footnote?: string;
}

export interface SlideStyle {
  backgroundColorOverride?: string;
  textColorOverride?: string;
  imagePositionOverride?: "left" | "right" | "top" | "bottom";
}

export interface Slide {
  id: string;
  deckId: string;
  position: number;
  layout: SlideLayout;
  content: SlideContent;
  style: SlideStyle | null;
  speakerNotes: string | null;
  thumbnailUrl: string | null;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSlideInput = Pick<
  Slide,
  "deckId" | "position" | "layout" | "content" | "style" | "speakerNotes"
>;
export type UpdateSlideInput = Partial<
  Pick<Slide, "position" | "layout" | "content" | "style" | "speakerNotes">
>;
