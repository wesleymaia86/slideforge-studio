export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  memberships: WorkspaceMembership[];
}

export interface WorkspaceMembership {
  workspaceId: string;
  role: import("./enums").MemberRole;
  joinedAt: Date;
}

export type CreateUserInput = Pick<User, "email" | "name">;
export type UpdateUserInput = Partial<Pick<User, "name" | "avatarUrl">>;
