import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import type { JobProgressUpdate, ParsedArtifactPayload } from '@slideforge/types';

@Injectable()
export class ProcessingJobService {
  constructor(private readonly prisma: PrismaService) {}

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

    await this.prisma.processingJob.update({
      where: { id: dto.jobId },
      data: {
        status: dto.status as string,
        progress: dto.progress,
        errorMessage: dto.errorMessage,
        startedAt: dto.status === 'processing' ? (job.startedAt ?? new Date()) : undefined,
        completedAt:
          dto.status === 'completed' || dto.status === 'failed' ? new Date() : undefined,
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
        },
        wordCount: payload.rowCount,
        pageCount: payload.sheetNames.length,
        rawText: payload.preview.map((r) => JSON.stringify(r)).join('\n'),
      },
    });
  }
}
