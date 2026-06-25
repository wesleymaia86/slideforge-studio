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
    const m = await this.prisma.membership.findUnique({
      where: { userId_workspaceId: { workspaceId, userId } },
    });
    if (!m) return null;
    return { workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole };
  }

  async listByWorkspace(workspaceId: string): Promise<MembershipRecord[]> {
    const members = await this.prisma.membership.findMany({ where: { workspaceId } });
    return members.map((m) => ({ workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole }));
  }

  async listByUser(userId: string): Promise<MembershipRecord[]> {
    const members = await this.prisma.membership.findMany({ where: { userId } });
    return members.map((m) => ({ workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole }));
  }

  async upsert(record: MembershipRecord): Promise<MembershipRecord> {
    const m = await this.prisma.membership.upsert({
      where: { userId_workspaceId: { workspaceId: record.workspaceId, userId: record.userId } },
      create: { workspaceId: record.workspaceId, userId: record.userId, role: record.role },
      update: { role: record.role },
    });
    return { workspaceId: m.workspaceId, userId: m.userId, role: m.role as MemberRole };
  }

  async remove(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.membership.delete({
      where: { userId_workspaceId: { workspaceId, userId } },
    });
  }
}
