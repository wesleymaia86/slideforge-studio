import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../../infra/database/prisma.service';
import type { AuthenticatedUser } from '../../../../domain/auth/entities/user.entity';
import { MemberRole } from '@slideforge/types';

export const REQUIRED_ROLES_KEY = 'requiredRoles';

export interface WorkspaceRequest {
  user: AuthenticatedUser;
  params: { workspaceId?: string; workspaceSlug?: string };
  workspaceMembership?: { role: MemberRole; workspaceId: string };
}

const ROLE_HIERARCHY: Record<MemberRole, number> = {
  [MemberRole.OWNER]: 50,
  [MemberRole.ADMIN]: 40,
  [MemberRole.EDITOR]: 30,
  [MemberRole.APPROVER]: 25,
  [MemberRole.VIEWER]: 10,
};

export function roleAtLeast(actual: MemberRole, required: MemberRole): boolean {
  return ROLE_HIERARCHY[actual] >= ROLE_HIERARCHY[required];
}

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<WorkspaceRequest>();
    const user = request.user;
    if (!user) return false;

    const workspaceId = request.params?.workspaceId;
    if (!workspaceId) return false;

    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');

    if (user.isSuperAdmin) {
      request.workspaceMembership = { role: MemberRole.OWNER, workspaceId };
      return true;
    }

    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    if (!member) throw new ForbiddenException('Not a member of this workspace');

    request.workspaceMembership = { role: member.role as MemberRole, workspaceId };

    const requiredRoles = this.reflector.getAllAndOverride<MemberRole[]>(REQUIRED_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((r) => roleAtLeast(member.role as MemberRole, r));
      if (!hasRole) throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
