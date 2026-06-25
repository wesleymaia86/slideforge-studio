import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export interface UpsertBrandKitDto {
  name: string;
  colorsJson?: object;
  fontsJson?: object;
  logosJson?: object;
}

@Injectable()
export class BrandKitService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string) {
    return this.prisma.brandKit.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(workspaceId: string, id: string) {
    const bk = await this.prisma.brandKit.findFirst({ where: { id, workspaceId } });
    if (!bk) throw new NotFoundException('BrandKit not found');
    return bk;
  }

  async create(workspaceId: string, dto: UpsertBrandKitDto) {
    return this.prisma.brandKit.create({ data: { workspaceId, ...dto } });
  }

  async update(workspaceId: string, id: string, dto: Partial<UpsertBrandKitDto>) {
    await this.findOne(workspaceId, id);
    return this.prisma.brandKit.update({ where: { id }, data: dto });
  }

  async delete(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.prisma.brandKit.delete({ where: { id } });
  }
}
