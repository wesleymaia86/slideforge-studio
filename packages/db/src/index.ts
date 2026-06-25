/**
 * Re-exports the Prisma client singleton.
 * Use PrismaService in NestJS (infra/database/prisma.service.ts) — this is for
 * non-NestJS contexts (scripts, seeds, migrations checks).
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export type { PrismaClient };
