import {
  Controller, Get, Post, Delete, Body, Param,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { InsightService } from '../../../app/insight/insight.service';
import { MemberRole } from '@slideforge/types';

class CreateInsightDto {
  @ApiProperty() @IsString() projectId!: string;
  @ApiProperty({ example: 'summary' }) @IsString() type!: string;
  @ApiProperty() @IsString() content!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() modelUsed?: string;
}

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/insights')
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create insight' })
  create(@Body() dto: CreateInsightDto) {
    return this.insightService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List insights by project' })
  @ApiQuery({ name: 'projectId', required: false })
  list(@Query('projectId') projectId?: string) {
    if (projectId) return this.insightService.listByProject(projectId);
    return [];
  }

  @Get(':insightId')
  @ApiOperation({ summary: 'Get insight' })
  findOne(@Param('insightId') id: string) {
    return this.insightService.findOne(id);
  }

  @Delete(':insightId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete insight' })
  delete(@Param('insightId') id: string) {
    return this.insightService.delete(id);
  }
}
