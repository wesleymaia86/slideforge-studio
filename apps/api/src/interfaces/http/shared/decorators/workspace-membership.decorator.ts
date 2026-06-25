import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { WorkspaceRequest } from '../guards/workspace-member.guard';

export const WorkspaceMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<WorkspaceRequest>();
    return request.workspaceMembership;
  },
);
