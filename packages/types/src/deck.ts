import { DeckStatus } from "./enums";

export interface Deck {
  id: string;
  projectId: string;
  workspaceId: string;
  createdByUserId: string;
  title: string;
  description: string | null;
  status: DeckStatus;
  brandKitId: string | null;
  slideCount: number;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  deckId: string;
  slideId: string | null;
  authorUserId: string;
  body: string;
  resolvedAt: Date | null;
  resolvedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDeckInput = Pick<Deck, "projectId" | "workspaceId" | "title" | "description" | "brandKitId">;
export type UpdateDeckInput = Partial<Pick<Deck, "title" | "description" | "status" | "brandKitId">>;
