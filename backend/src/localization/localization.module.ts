import { Module } from '@nestjs/common';
import { LocalizationService } from './localization.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LocalizationService],
  exports: [LocalizationService],
})
export class LocalizationModule {}

