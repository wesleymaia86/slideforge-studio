import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { ProjectService } from '../../../app/project/project.service';
import { MemberRole } from '@slideforge/types';

class CreateProjectDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
}

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create project' })
  create(@Param('workspaceId') wsId: string, @Body() dto: CreateProjectDto) {
    return this.projectService.create(wsId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  list(@Param('workspaceId') wsId: string) {
    return this.projectService.list(wsId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get project' })
  findOne(@Param('workspaceId') wsId: string, @Param('projectId') id: string) {
    return this.projectService.findOne(wsId, id);
  }

  @Patch(':projectId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update project' })
  update(@Param('workspaceId') wsId: string, @Param('projectId') id: string, @Body() dto: CreateProjectDto) {
    return this.projectService.update(wsId, id, dto);
  }

  @Delete(':projectId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  delete(@Param('workspaceId') wsId: string, @Param('projectId') id: string) {
    return this.projectService.delete(wsId, id);
  }
}
