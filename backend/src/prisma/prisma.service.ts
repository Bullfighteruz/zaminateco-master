import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432/zaminat_db')) {
        await this.$connect();
        this.logger.log('[PRISMA] Database connected successfully.');
      } else if (process.env.DATABASE_URL) {
        // Attempt connect with timeout
        await this.$connect();
        this.logger.log('[PRISMA] Database connected.');
      } else {
        this.logger.warn('[PRISMA] DATABASE_URL is not configured. AI standalone routes remain fully operational.');
      }
    } catch (err: any) {
      this.logger.warn(`[PRISMA] Database connection non-fatal warning: ${err.message}. AI endpoints remain operational.`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      // ignore
    }
  }
}
