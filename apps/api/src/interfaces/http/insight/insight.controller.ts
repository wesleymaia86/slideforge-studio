import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { InsightService } from '../../../app/insight/insight.service';
import { InsightSeverity, MemberRole } from '@slideforge/types';

class CreateInsightDto {
  @ApiPropertyOptional() @IsString() @IsOptional() processingJobId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() parsedArtifactId?: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() bodyMarkdown!: string;
  @ApiPropertyOptional({ enum: InsightSeverity }) @IsEnum(InsightSeverity) @IsOptional() severity?: InsightSeverity;
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
  @ApiOperation({ summary: 'List insights by job or artifact' })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'artifactId', required: false })
  list(
    @Query('jobId') jobId?: string,
    @Query('artifactId') artifactId?: string,
  ) {
    if (jobId) return this.insightService.listByJob(jobId);
    if (artifactId) return this.insightService.listByArtifact(artifactId);
    return [];
  }

  @Get(':insightId')
  @ApiOperation({ summary: 'Get insight' })
  findOne(@Param('insightId') id: string) {
    return this.insightService.findOne(id);
  }

  @Patch(':insightId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update insight' })
  update(@Param('insightId') id: string, @Body() dto: CreateInsightDto) {
    return this.insightService.update(id, dto);
  }

  @Delete(':insightId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete insight' })
  delete(@Param('insightId') id: string) {
    return this.insightService.delete(id);
  }
}
