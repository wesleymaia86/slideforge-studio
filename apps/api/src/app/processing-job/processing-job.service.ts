import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import type { JobProgressUpdate, ParsedArtifactPayload } from '@slideforge/types';
import { JobStatus } from '@slideforge/types';

@Injectable()
export class ProcessingJobService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const job = await this.prisma.processingJob.findUnique({
      where: { id },
      include: { fileAsset: true, parsedArtifact: true },
    });
    if (!job) throw new NotFoundException('Processing job not found');
    return job;
  }

  async listForWorkspace(workspaceId: string) {
    return this.prisma.processingJob.findMany({
      where: { fileAsset: { workspaceId } },
      include: { fileAsset: { select: { id: true, originalName: true, mimeType: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Called by worker via callback endpoint */
  async updateProgress(dto: JobProgressUpdate) {
    const job = await this.prisma.processingJob.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    await this.prisma.processingJob.update({
      where: { id: dto.jobId },
      data: {
        status: dto.status,
        progress: dto.progress,
        errorMessage: dto.errorMessage,
        startedAt: dto.status === JobStatus.PROCESSING ? (job.startedAt ?? new Date()) : undefined,
        completedAt:
          dto.status === JobStatus.DONE || dto.status === JobStatus.FAILED
            ? new Date()
            : undefined,
      },
    });
  }

  /** Called by worker when parsing is complete */
  async saveParsedArtifact(payload: ParsedArtifactPayload) {
    const job = await this.prisma.processingJob.findUnique({ where: { id: payload.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    return this.prisma.parsedArtifact.upsert({
      where: { processingJobId: payload.jobId },
      create: {
        processingJobId: payload.jobId,
        rowCount: payload.rowCount,
        columnCount: payload.columnCount,
        sheetNames: payload.sheetNames,
        schemaJson: payload.schema as object,
        previewJson: payload.preview as object[],
      },
      update: {
        rowCount: payload.rowCount,
        columnCount: payload.columnCount,
        sheetNames: payload.sheetNames,
        schemaJson: payload.schema as object,
        previewJson: payload.preview as object[],
      },
    });
  }
}
