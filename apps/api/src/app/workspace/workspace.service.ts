import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { MemberRole } from '@slideforge/types';

export interface CreateWorkspaceDto {
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  logoUrl?: string;
}

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkspaceDto, ownerId: string) {
    const existing = await this.prisma.workspace.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Workspace slug already taken');

    const workspace = await this.prisma.workspace.create({
      data: { name: dto.name, slug: dto.slug, logoUrl: dto.logoUrl },
    });

    await this.prisma.workspaceMember.create({
      data: { workspaceId: workspace.id, userId: ownerId, role: MemberRole.OWNER, joinedAt: new Date() },
    });

    return workspace;
  }

  async listForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return memberships.map((m) => ({ ...m.workspace, role: m.role }));
  }

  async findById(id: string) {
    const ws = await this.prisma.workspace.findUnique({ where: { id } });
    if (!ws) throw new NotFoundException('Workspace not found');
    return ws;
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    await this.findById(id);
    return this.prisma.workspace.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.workspace.delete({ where: { id } });
  }

  async listMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
    });
  }

  async inviteMember(workspaceId: string, userId: string, role: MemberRole) {
    return this.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      create: { workspaceId, userId, role, joinedAt: new Date() },
      update: { role },
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }
}
