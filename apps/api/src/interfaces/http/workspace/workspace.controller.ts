import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import { WorkspaceService } from '../../../app/workspace/workspace.service';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  InviteMemberDto,
} from './dtos/workspace.dto';
import type { AuthenticatedUser } from '../../../domain/auth/entities/user.entity';
import { MemberRole } from '@slideforge/types';

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @ApiOperation({ summary: 'Create workspace' })
  create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.workspaceService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List workspaces for current user' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.workspaceService.listForUser(user.id);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get workspace by ID' })
  findOne(@Param('workspaceId') id: string) {
    return this.workspaceService.findById(id);
  }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update workspace (admin+)' })
  update(@Param('workspaceId') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspaceService.update(id, dto);
  }

  @Delete(':workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  @Roles(MemberRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete workspace (owner only)' })
  delete(@Param('workspaceId') id: string) {
    return this.workspaceService.delete(id);
  }

  // Members

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'List workspace members' })
  listMembers(@Param('workspaceId') id: string) {
    return this.workspaceService.listMembers(id);
  }

  @Post(':workspaceId/members')
  @UseGuards(WorkspaceMemberGuard)
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Invite member (admin+)' })
  inviteMember(@Param('workspaceId') workspaceId: string, @Body() dto: InviteMemberDto) {
    return this.workspaceService.inviteMember(workspaceId, dto.userId, dto.role);
  }

  @Delete(':workspaceId/members/:userId')
  @UseGuards(WorkspaceMemberGuard)
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove member (admin+)' })
  removeMember(@Param('workspaceId') workspaceId: string, @Param('userId') userId: string) {
    return this.workspaceService.removeMember(workspaceId, userId);
  }
}
