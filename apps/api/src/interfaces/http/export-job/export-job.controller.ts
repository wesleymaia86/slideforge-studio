import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { ExportJobService } from '../../../app/export-job/export-job.service';
import { MemberRole } from '@slideforge/types';
import { ExportFormat } from '@prisma/client';

class CreateExportJobDto {
  @ApiProperty({ enum: ExportFormat })
  @IsEnum(ExportFormat)
  format!: ExportFormat;
}

@ApiTags('export-jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/decks/:deckId/exports')
export class ExportJobController {
  constructor(private readonly exportJobService: ExportJobService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create export job (stub)' })
  create(@Param('deckId') deckId: string, @Body() dto: CreateExportJobDto) {
    return this.exportJobService.create(deckId, dto.format);
  }

  @Get()
  @ApiOperation({ summary: 'List export jobs for deck' })
  list(@Param('deckId') deckId: string) {
    return this.exportJobService.list(deckId);
  }

  @Get(':exportJobId')
  @ApiOperation({ summary: 'Get export job status' })
  findOne(@Param('exportJobId') id: string) {
    return this.exportJobService.findOne(id);
  }
}
