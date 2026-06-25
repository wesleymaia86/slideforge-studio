import { MemberRole } from "./enums";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  workspaceId: string;
  role: MemberRole;
  invitedByUserId: string | null;
  joinedAt: Date;
}

export interface BrandKit {
  id: string;
  workspaceId: string;
  name: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  fontHeading: string | null;
  fontBody: string | null;
  logoFileId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateWorkspaceInput = Pick<Workspace, "name" | "slug">;
export type UpdateWorkspaceInput = Partial<Pick<Workspace, "name" | "logoUrl">>;

export type InviteMemberInput = {
  workspaceId: string;
  email: string;
  role: MemberRole;
};
