import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export interface CreateProjectDto {
  name: string;
  description?: string;
}

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({ data: { workspaceId, ...dto } });
  }

  async list(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: { _count: { select: { decks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const p = await this.prisma.project.findFirst({ where: { id, workspaceId } });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async update(workspaceId: string, id: string, dto: Partial<CreateProjectDto>) {
    await this.findOne(workspaceId, id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async delete(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.prisma.project.delete({ where: { id } });
  }
}
