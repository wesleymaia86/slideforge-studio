import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsInt, IsArray, IsObject, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { DeckService } from '../../../app/deck/deck.service';
import { MemberRole } from '@slideforge/types';

class CreateDeckDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() thumbnailUrl?: string;
}

class CreateSlideDto {
  @ApiProperty() @IsInt() @Min(1) position!: number;
  @ApiPropertyOptional() @IsString() @IsOptional() title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() layoutType?: string;
  @ApiPropertyOptional() @IsObject() @IsOptional() contentJson?: object;
  @ApiPropertyOptional() @IsString() @IsOptional() notesText?: string;
}

class ReorderSlidesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  orderedIds!: string[];
}

@ApiTags('decks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/projects/:projectId/decks')
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Create deck' })
  create(@Param('projectId') pid: string, @Body() dto: CreateDeckDto) {
    return this.deckService.create(pid, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List decks in project' })
  list(@Param('projectId') pid: string) {
    return this.deckService.list(pid);
  }

  @Get(':deckId')
  @ApiOperation({ summary: 'Get deck with slides' })
  findOne(@Param('deckId') id: string) {
    return this.deckService.findOne(id);
  }

  @Patch(':deckId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update deck' })
  update(@Param('deckId') id: string, @Body() dto: CreateDeckDto) {
    return this.deckService.update(id, dto);
  }

  @Delete(':deckId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete deck' })
  delete(@Param('deckId') id: string) {
    return this.deckService.delete(id);
  }

  // Slides

  @Post(':deckId/slides')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Add slide to deck' })
  addSlide(@Param('deckId') deckId: string, @Body() dto: CreateSlideDto) {
    return this.deckService.addSlide(deckId, dto);
  }

  @Get(':deckId/slides')
  @ApiOperation({ summary: 'List slides' })
  listSlides(@Param('deckId') deckId: string) {
    return this.deckService.listSlides(deckId);
  }

  @Patch(':deckId/slides/:slideId')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Update slide' })
  updateSlide(@Param('slideId') slideId: string, @Body() dto: CreateSlideDto) {
    return this.deckService.updateSlide(slideId, dto);
  }

  @Delete(':deckId/slides/:slideId')
  @Roles(MemberRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete slide' })
  deleteSlide(@Param('slideId') slideId: string) {
    return this.deckService.deleteSlide(slideId);
  }

  @Post(':deckId/slides/reorder')
  @Roles(MemberRole.EDITOR)
  @ApiOperation({ summary: 'Reorder slides' })
  reorder(@Param('deckId') deckId: string, @Body() dto: ReorderSlidesDto) {
    return this.deckService.reorderSlides(deckId, dto.orderedIds);
  }
}
