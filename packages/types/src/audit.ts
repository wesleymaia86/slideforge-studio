import { AuditAction } from "./enums";

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorUserId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
