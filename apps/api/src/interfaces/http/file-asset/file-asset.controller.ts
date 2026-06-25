import {
  Controller, Get, Post, Delete, Param, UseGuards,
  UseInterceptors, UploadedFile, ParseFilePipe,
  MaxFileSizeValidator, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileAssetService } from '../../../app/file-asset/file-asset.service';
import { MemberRole } from '@slideforge/types';
import type { AuthenticatedUser } from '../../../domain/auth/entities/user.entity';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@ApiTags('file-assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
@Controller('workspaces/:workspaceId/file-assets')
export class FileAssetController {
  constructor(private readonly fileAssetService: FileAssetService) {}

  @Post('upload')
  @Roles(MemberRole.EDITOR)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload file and enqueue processing job' })
  upload(
    @Param('workspaceId') wsId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })] }))
    file: Express.Multer.File,
  ) {
    return this.fileAssetService.upload(wsId, user.id, file);
  }

  @Get()
  @ApiOperation({ summary: 'List file assets' })
  list(@Param('workspaceId') wsId: string) {
    return this.fileAssetService.list(wsId);
  }

  @Get(':assetId')
  @ApiOperation({ summary: 'Get file asset' })
  findOne(@Param('workspaceId') wsId: string, @Param('assetId') id: string) {
    return this.fileAssetService.findOne(wsId, id);
  }

  @Get(':assetId/presigned-url')
  @ApiOperation({ summary: 'Get presigned download URL' })
  presignedUrl(@Param('workspaceId') wsId: string, @Param('assetId') id: string) {
    return this.fileAssetService.getPresignedUrl(wsId, id);
  }

  @Delete(':assetId')
  @Roles(MemberRole.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file asset' })
  delete(@Param('workspaceId') wsId: string, @Param('assetId') id: string) {
    return this.fileAssetService.delete(wsId, id);
  }
}
