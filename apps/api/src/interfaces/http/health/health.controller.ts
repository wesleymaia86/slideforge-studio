import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../../infra/database/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('processing') private readonly queue: Queue,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness check' })
  health(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (DB + Redis)' })
  async ready(): Promise<{ status: string; checks: Record<string, string> }> {
    const checks: Record<string, string> = {};

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks['database'] = 'ok';
    } catch {
      checks['database'] = 'error';
    }

    try {
      const client = await this.queue.client;
      await (client as { ping: () => Promise<string> }).ping();
      checks['redis'] = 'ok';
    } catch {
      checks['redis'] = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');
    return { status: allOk ? 'ok' : 'degraded', checks };
  }
}
