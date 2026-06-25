import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { BrandKitModule } from './interfaces/http/brand-kit/brand-kit.module';
import { AdminModule } from './interfaces/http/admin/admin.module';
import { HealthModule } from './interfaces/http/health/health.module';
import { JwtAuthGuard } from './interfaces/http/auth/guards/jwt-auth.guard';

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
      useFactory: () => {
        const redisUrl = new URL(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
        return {
          redis: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port || '6379', 10),
            password: redisUrl.password || undefined,
          },
        };
      },
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
    BrandKitModule,
    AdminModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useExisting: JwtAuthGuard }],
})
export class AppModule {}
