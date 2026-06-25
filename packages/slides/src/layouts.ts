import { SlideLayout } from "@slideforge/types";

export interface LayoutDefinition {
  id: SlideLayout;
  displayName: string;
  description: string;
  /** Content zones this layout supports */
  zones: LayoutZone[];
}

export interface LayoutZone {
  id: string;
  label: string;
  required: boolean;
  maxChars?: number;
}

export const LAYOUT_DEFINITIONS: Record<SlideLayout, LayoutDefinition> = {
  [SlideLayout.TITLE]: {
    id: SlideLayout.TITLE,
    displayName: "Title",
    description: "Full-bleed title slide with heading and optional subheading",
    zones: [
      { id: "heading", label: "Title", required: true, maxChars: 80 },
      { id: "subheading", label: "Subtitle", required: false, maxChars: 120 },
    ],
  },
  [SlideLayout.CONTENT]: {
    id: SlideLayout.CONTENT,
    displayName: "Content",
    description: "Heading with body text or bullet points",
    zones: [
      { id: "heading", label: "Heading", required: true, maxChars: 80 },
      { id: "body", label: "Body", required: false, maxChars: 600 },
    ],
  },
  [SlideLayout.TWO_COLUMN]: {
    id: SlideLayout.TWO_COLUMN,
    displayName: "Two Column",
    description: "Split layout with two independent content areas",
    zones: [
      { id: "heading", label: "Heading", required: false, maxChars: 80 },
      { id: "leftColumn", label: "Left Column", required: true, maxChars: 400 },
      { id: "rightColumn", label: "Right Column", required: true, maxChars: 400 },
    ],
  },
  [SlideLayout.IMAGE_LEFT]: {
    id: SlideLayout.IMAGE_LEFT,
    displayName: "Image Left",
    description: "Image on the left, text on the right",
    zones: [
      { id: "heading", label: "Heading", required: true, maxChars: 80 },
      { id: "body", label: "Body", required: false, maxChars: 400 },
      { id: "image", label: "Image", required: true },
    ],
  },
  [SlideLayout.IMAGE_RIGHT]: {
    id: SlideLayout.IMAGE_RIGHT,
    displayName: "Image Right",
    description: "Text on the left, image on the right",
    zones: [
      { id: "heading", label: "Heading", required: true, maxChars: 80 },
      { id: "body", label: "Body", required: false, maxChars: 400 },
      { id: "image", label: "Image", required: true },
    ],
  },
  [SlideLayout.FULL_IMAGE]: {
    id: SlideLayout.FULL_IMAGE,
    displayName: "Full Image",
    description: "Full-bleed image with optional overlay text",
    zones: [
      { id: "image", label: "Background Image", required: true },
      { id: "heading", label: "Overlay Heading", required: false, maxChars: 80 },
    ],
  },
  [SlideLayout.QUOTE]: {
    id: SlideLayout.QUOTE,
    displayName: "Quote",
    description: "Large pull quote with attribution",
    zones: [
      { id: "quote", label: "Quote Text", required: true, maxChars: 200 },
      { id: "attribution", label: "Attribution", required: false, maxChars: 100 },
    ],
  },
  [SlideLayout.METRICS]: {
    id: SlideLayout.METRICS,
    displayName: "Metrics",
    description: "Key metrics/numbers in a grid",
    zones: [
      { id: "heading", label: "Heading", required: false, maxChars: 80 },
      { id: "metrics", label: "Metrics (JSON array)", required: true },
    ],
  },
  [SlideLayout.DIVIDER]: {
    id: SlideLayout.DIVIDER,
    displayName: "Section Divider",
    description: "Transitional slide between sections",
    zones: [
      { id: "heading", label: "Section Title", required: true, maxChars: 80 },
      { id: "subheading", label: "Subtitle", required: false, maxChars: 120 },
    ],
  },
  [SlideLayout.BLANK]: {
    id: SlideLayout.BLANK,
    displayName: "Blank",
    description: "Empty canvas for custom content",
    zones: [],
  },
};
