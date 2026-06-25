import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  MembershipRepository,
  MembershipRecord,
} from '../../../domain/tenancy/contracts/membership.repository';
import { MemberRole } from '@slideforge/types';

@Injectable()
export class MembershipRepositoryImpl implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMembership(workspaceId: string, userId: string): Promise<MembershipRecord | null> {
    const m = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!m) return null;
    return { workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole };
  }

  async listByWorkspace(workspaceId: string): Promise<MembershipRecord[]> {
    const members = await this.prisma.workspaceMember.findMany({ where: { workspaceId } });
    return members.map((m) => ({ workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole }));
  }

  async listByUser(userId: string): Promise<MembershipRecord[]> {
    const members = await this.prisma.workspaceMember.findMany({ where: { userId } });
    return members.map((m) => ({ workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole }));
  }

  async upsert(record: MembershipRecord): Promise<MembershipRecord> {
    const m = await this.prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: record.workspaceId, userId: record.userId } },
      create: { workspaceId: record.workspaceId, userId: record.userId, role: record.role, joinedAt: new Date() },
      update: { role: record.role },
    });
    return { workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole };
  }

  async remove(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }
}
