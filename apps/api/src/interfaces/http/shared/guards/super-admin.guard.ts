import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../../domain/auth/entities/user.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    if (!req.user?.isSuperAdmin) throw new ForbiddenException('Super-admin access required');
    return true;
  }
}
