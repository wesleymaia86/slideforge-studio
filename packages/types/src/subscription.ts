import { PlanTier, SubscriptionStatus } from "./enums";

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  description: string | null;
  priceMonthlyUsd: number;
  priceYearlyUsd: number;
  maxWorkspaceMembers: number;
  maxProjectsPerWorkspace: number;
  maxDecksPerProject: number;
  maxSlidesPerDeck: number;
  maxStorageGb: number;
  aiCreditsPerMonth: number;
  allowCustomBranding: boolean;
  allowApiAccess: boolean;
  allowSso: boolean;
}

export interface Subscription {
  id: string;
  workspaceId: string;
  planId: string;
  status: SubscriptionStatus;
  externalSubscriptionId: string | null;
  externalCustomerId: string | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageEvent {
  id: string;
  workspaceId: string;
  userId: string | null;
  eventType: string;
  quantity: number;
  metadata: Record<string, unknown> | null;
  recordedAt: Date;
}
