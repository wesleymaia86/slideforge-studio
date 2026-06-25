import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bull';
import { validateEnv } from '@slideforge/config';
import { PrismaModule } from './infra/database/prisma.module';
import { AuthModule } from './interfaces/http/auth/auth.module';
import { WorkspaceModule } from './interfaces/http/workspace/workspace.module';
import { ProjectModule } from './interfaces/http/project/project.module';
import { DeckModule } from './interfaces/http/deck/deck.module';
import { FileAssetModule } from './interfaces/http/file-asset/file-asset.module';
import { ProcessingJobModule } from './interfaces/http/processing-job/processing-job.module';
import { InsightModule } from './interfaces/http/insight/insight.module';
import { BriefingModule } from './interfaces/http/briefing/briefing.module';
import { ExportJobModule } from './interfaces/http/export-job/export-job.module';
import { AuditLogModule } from './interfaces/http/audit-log/audit-log.module';
import { AdminModule } from './interfaces/http/admin/admin.module';
import { HealthModule } from './interfaces/http/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
        redact: ['req.headers.authorization'],
      },
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    BullModule.forRootAsync({
      useFactory: () => ({
        redis: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      }),
    }),

    PrismaModule,
    AuthModule,
    WorkspaceModule,
    ProjectModule,
    DeckModule,
    FileAssetModule,
    ProcessingJobModule,
    InsightModule,
    BriefingModule,
    ExportJobModule,
    AuditLogModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
