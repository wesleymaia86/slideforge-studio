import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { AuditAction } from '@prisma/client';

export interface RecordAuditDto {
  workspaceId?: string;
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metaJson?: object;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(dto: RecordAuditDto) {
    return this.prisma.auditLog.create({ data: dto });
  }

  async listForWorkspace(workspaceId: string, page = 1, pageSize = 50) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.auditLog.count({ where: { workspaceId } }),
    ]);
    return { data, total, page, pageSize };
  }

  async recordUsage(
    workspaceId: string | null,
    userId: string | null,
    eventType: string,
    meta?: object,
  ) {
    return this.prisma.usageEvent.create({
      data: { workspaceId, userId, eventType, metaJson: meta },
    });
  }
}
