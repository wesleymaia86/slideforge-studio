import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { ExportFormat, ExportStatus } from '@prisma/client';

@Injectable()
export class ExportJobService {
  constructor(private readonly prisma: PrismaService) {}

  async create(deckId: string, format: ExportFormat) {
    // Stub: creates the job record; actual export processing would be dispatched to a queue
    return this.prisma.exportJob.create({
      data: { deckId, format, status: ExportStatus.PENDING },
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
