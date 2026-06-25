import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { BrandKitService } from '../../../app/brand-kit/brand-kit.service';
import { MemberRole } from '@slideforge/types';

class CreateBrandKitDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional({ example: '#01696f' }) @IsString() @IsOptional() primaryColor?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() secondaryColor?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() accentColor?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() backgroundColor?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fontHeading?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fontBody?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isDefault?: boolean;
}

@ApiTags('brand-kits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/brand-kits')
export class BrandKitController {
  constructor(private readonly brandKitService: BrandKitService) {}

  @Get()
  @ApiOperation({ summary: 'List brand kits' })
  list(@Param('workspaceId') wsId: string) {
    return this.brandKitService.list(wsId);
  }

  @Post()
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create brand kit' })
  create(@Param('workspaceId') wsId: string, @Body() dto: CreateBrandKitDto) {
    return this.brandKitService.create(wsId, dto);
  }

  @Get(':brandKitId')
  @ApiOperation({ summary: 'Get brand kit' })
  findOne(@Param('workspaceId') wsId: string, @Param('brandKitId') id: string) {
    return this.brandKitService.findOne(wsId, id);
  }

  @Patch(':brandKitId')
  @Roles(MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update brand kit' })
  update(@Param('workspaceId') wsId: string, @Param('brandKitId') id: string, @Body() dto: CreateBrandKitDto) {
    return this.brandKitService.update(wsId, id, dto);
  }

  @Delete(':brandKitId')
  @Roles(MemberRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete brand kit' })
  delete(@Param('workspaceId') wsId: string, @Param('brandKitId') id: string) {
    return this.brandKitService.delete(wsId, id);
  }
}
