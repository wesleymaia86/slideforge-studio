import {
  Controller, Get, Post, Param, Body, UseGuards,
  Headers, UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { WorkspaceMemberGuard } from '../shared/guards/workspace-member.guard';
import { ProcessingJobService } from '../../../app/processing-job/processing-job.service';
import { JobStatus, type JobProgressUpdate, type ParsedArtifactPayload } from '@slideforge/types';

class JobProgressDto implements JobProgressUpdate {
  @ApiProperty() @IsString() jobId!: string;
  @ApiProperty({ enum: JobStatus }) @IsEnum(JobStatus) status!: JobStatus;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) progress!: number;
  @ApiPropertyOptional() @IsString() @IsOptional() errorMessage?: string;
}

@ApiTags('processing-jobs')
@Controller()
export class ProcessingJobController {
  constructor(private readonly jobService: ProcessingJobService) {}

  @Get('workspaces/:workspaceId/processing-jobs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiOperation({ summary: 'List processing jobs for workspace' })
  listForWorkspace(@Param('workspaceId') wsId: string) {
    return this.jobService.listForWorkspace(wsId);
  }

  @Get('workspaces/:workspaceId/processing-jobs/:jobId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get processing job status' })
  findOne(@Param('jobId') id: string) {
    return this.jobService.findOne(id);
  }

  /** Internal worker callback — secured by WORKER_API_KEY header */
  @Post('internal/jobs/progress')
  @Public()
  @ApiHeader({ name: 'x-worker-key', required: true })
  @ApiOperation({ summary: 'Worker: update job progress (internal)' })
  updateProgress(
    @Headers('x-worker-key') key: string,
    @Body() dto: JobProgressDto,
  ) {
    if (key !== process.env['WORKER_API_KEY']) throw new UnauthorizedException('Invalid worker key');
    return this.jobService.updateProgress(dto);
  }

  @Post('internal/jobs/artifact')
  @Public()
  @ApiHeader({ name: 'x-worker-key', required: true })
  @ApiOperation({ summary: 'Worker: save parsed artifact (internal)' })
  saveArtifact(
    @Headers('x-worker-key') key: string,
    @Body() payload: ParsedArtifactPayload,
  ) {
    if (key !== process.env['WORKER_API_KEY']) throw new UnauthorizedException('Invalid worker key');
    return this.jobService.saveParsedArtifact(payload);
  }
}
