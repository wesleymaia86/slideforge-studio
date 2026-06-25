import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../shared/guards/super-admin.guard';
import { PrismaService } from '../../../infra/database/prisma.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('workspaces')
  @ApiOperation({ summary: 'List all workspaces (super-admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  async listWorkspaces(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const ps = pageSize ? parseInt(pageSize, 10) : 20;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.workspace.findMany({
        skip: (p - 1) * ps,
        take: ps,
        include: { _count: { select: { memberships: true, projects: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workspace.count(),
    ]);
    return { data, total, page: p, pageSize: ps };
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (super-admin)' })
  async listUsers(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const ps = pageSize ? parseInt(pageSize, 10) : 20;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (p - 1) * ps,
        take: ps,
        select: { id: true, email: true, name: true, emailVerified: true, isSuperAdmin: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page: p, pageSize: ps };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platform stats (super-admin)' })
  async stats() {
    const [users, workspaces, fileAssets, processingJobs] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.workspace.count(),
      this.prisma.fileAsset.count(),
      this.prisma.processingJob.count(),
    ]);
    return { users, workspaces, fileAssets, processingJobs };
  }
}
