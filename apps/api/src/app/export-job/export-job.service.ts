import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export type ExportFormat = 'pptx' | 'pdf' | 'png' | 'html';

@Injectable()
export class ExportJobService {
  constructor(private readonly prisma: PrismaService) {}

  async create(deckId: string, requestedByUserId: string, format: ExportFormat) {
    return this.prisma.exportJob.create({
      data: {
        deckId,
        requestedByUserId,
        format,
        status: 'pending',
      },
    });
  }

  async list(deckId: string) {
    return this.prisma.exportJob.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.exportJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }
}
