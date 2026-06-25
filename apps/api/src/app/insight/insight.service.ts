import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export interface CreateInsightDto {
  projectId: string;
  type: string;
  content: string;
  modelUsed?: string;
}

@Injectable()
export class InsightService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInsightDto) {
    return this.prisma.insight.create({ data: dto as Parameters<typeof this.prisma.insight.create>[0]['data'] });
  }

  async listByProject(projectId: string) {
    return this.prisma.insight.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const insight = await this.prisma.insight.findUnique({ where: { id } });
    if (!insight) throw new NotFoundException('Insight not found');
    return insight;
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.insight.delete({ where: { id } });
  }
}
