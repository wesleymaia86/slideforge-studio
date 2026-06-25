import type { MemberRole } from '@slideforge/types';

export interface MembershipRecord {
  workspaceId: string;
  userId: string;
  role: MemberRole;
}

export abstract class MembershipRepository {
  abstract findMembership(workspaceId: string, userId: string): Promise<MembershipRecord | null>;
  abstract listByWorkspace(workspaceId: string): Promise<MembershipRecord[]>;
  abstract listByUser(userId: string): Promise<MembershipRecord[]>;
  abstract upsert(record: MembershipRecord): Promise<MembershipRecord>;
  abstract remove(workspaceId: string, userId: string): Promise<void>;
}
