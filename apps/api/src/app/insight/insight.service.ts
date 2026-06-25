import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { InsightSeverity } from '@slideforge/types';

export interface CreateInsightDto {
  processingJobId?: string;
  parsedArtifactId?: string;
  title: string;
  bodyMarkdown: string;
  severity?: InsightSeverity;
  metaJson?: object;
}

@Injectable()
export class InsightService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInsightDto) {
    return this.prisma.insight.create({ data: dto });
  }

  async listByJob(jobId: string) {
    return this.prisma.insight.findMany({
      where: { processingJobId: jobId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByArtifact(artifactId: string) {
    return this.prisma.insight.findMany({
      where: { parsedArtifactId: artifactId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const insight = await this.prisma.insight.findUnique({ where: { id } });
    if (!insight) throw new NotFoundException('Insight not found');
    return insight;
  }

  async update(id: string, dto: Partial<CreateInsightDto>) {
    await this.findOne(id);
    return this.prisma.insight.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.insight.delete({ where: { id } });
  }
}
