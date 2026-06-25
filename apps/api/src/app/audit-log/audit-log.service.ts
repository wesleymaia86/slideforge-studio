import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

export interface RecordAuditDto {
  workspaceId: string;
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: object;
  after?: object;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: RecordAuditDto) {
    return this.prisma.auditLog.create({ data: dto as Parameters<typeof this.prisma.auditLog.create>[0]['data'] });
  }

  async listForWorkspace(workspaceId: string, page = 1, pageSize = 50) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { actor: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where: { workspaceId } }),
    ]);
    return { data, total, page, pageSize };
  }

  async recordUsage(
    workspaceId: string,
    userId: string | null,
    eventType: string,
    meta?: object,
  ) {
    return this.prisma.usageEvent.create({
      data: { workspaceId, userId: userId ?? undefined, eventType, metadata: meta },
    });
  }
}
