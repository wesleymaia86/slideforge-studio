import {
  Controller, Get, Post, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { BriefingService } from '../../../app/briefing/briefing.service';
import { MemberRole } from '@slideforge/types';

class CreateBriefingDto {
  @ApiPropertyOptional() @IsString() @IsOptional() audience?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() objective?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() toneVoice?: string;
  @ApiPropertyOptional() @IsObject() @IsOptional() context?: Record<string, unknown>;
}

class GenerateOutlineDto {
  @ApiPropertyOptional({ description: 'Optional data context for AI outline generation' })
  @IsString() @IsOptional()
  dataContext?: string;
}

@ApiTags('briefings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/decks/:deckId/briefings')
export class BriefingController {
  constructor(private readonly briefingService: BriefingService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create briefing for deck' })
  createBriefing(@Param('deckId') deckId: string, @Body() dto: CreateBriefingDto) {
    return this.briefingService.createBriefing(deckId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List briefings for deck' })
  list(@Param('deckId') deckId: string) {
    return this.briefingService.getBriefingForDeck(deckId);
  }

  @Post(':briefingId/outline')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Generate outline from briefing (AI or stub)' })
  generateOutline(
    @Param('briefingId') briefingId: string,
    @Body() dto: GenerateOutlineDto,
  ) {
    return this.briefingService.generateOutline(briefingId, dto.dataContext);
  }

  @Get(':briefingId/outlines')
  @ApiOperation({ summary: 'List generated outlines for briefing' })
  listOutlines(@Param('briefingId') briefingId: string) {
    return this.briefingService.getOutlines(briefingId);
  }
}
