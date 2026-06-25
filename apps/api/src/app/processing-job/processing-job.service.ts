import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/database/prisma.service';
import { JobStatus } from '@slideforge/types';
import type { JobProgressUpdate, ParsedArtifactPayload } from '@slideforge/types';

@Injectable()
export class ProcessingJobService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeJobStatus(status: string): JobStatus {
    if (status === 'processing' || status === 'running') return JobStatus.RUNNING;
    if (Object.values(JobStatus).includes(status as JobStatus)) return status as JobStatus;
    return JobStatus.PENDING;
  }

  async findOne(id: string) {
    const job = await this.prisma.processingJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Processing job not found');
    return job;
  }

  async listForWorkspace(workspaceId: string) {
    return this.prisma.processingJob.findMany({
      where: { workspaceId },
      orderBy: { queuedAt: 'desc' },
    });
  }

  /** Called by worker via callback endpoint */
  async updateProgress(dto: JobProgressUpdate) {
    const job = await this.prisma.processingJob.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const status = this.normalizeJobStatus(dto.status);

    await this.prisma.processingJob.update({
      where: { id: dto.jobId },
      data: {
        status,
        progress: dto.progress,
        errorMessage: dto.errorMessage,
        startedAt: status === JobStatus.RUNNING ? (job.startedAt ?? new Date()) : undefined,
        completedAt:
          status === JobStatus.COMPLETED || status === JobStatus.FAILED ? new Date() : undefined,
      },
    });
  }

  /** Called by worker when parsing is complete — saves structured content to ParsedArtifact */
  async saveParsedArtifact(payload: ParsedArtifactPayload) {
    const job = await this.prisma.processingJob.findUnique({ where: { id: payload.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const jobPayload = job.payload as { fileAssetId?: string; projectId?: string } | null;
    const fileAssetId = jobPayload?.fileAssetId;
    const projectId = jobPayload?.projectId ?? job.projectId;

    if (!fileAssetId || !projectId) {
      throw new NotFoundException('Job payload missing fileAssetId or projectId');
    }

    return this.prisma.parsedArtifact.create({
      data: {
        projectId,
        fileAssetId,
        structuredContent: {
          rowCount: payload.rowCount,
          columnCount: payload.columnCount,
          sheetNames: payload.sheetNames,
          schema: payload.schema,
        } as unknown as Prisma.InputJsonValue,
        wordCount: payload.rowCount,
        pageCount: payload.sheetNames.length,
        rawText: payload.preview.map((r) => JSON.stringify(r)).join('\n'),
      },
    });
  }
}
