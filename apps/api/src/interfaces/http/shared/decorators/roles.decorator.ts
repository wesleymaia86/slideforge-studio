import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '@slideforge/types';
import { REQUIRED_ROLES_KEY } from '../guards/workspace-member.guard';

export const Roles = (...roles: MemberRole[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);
