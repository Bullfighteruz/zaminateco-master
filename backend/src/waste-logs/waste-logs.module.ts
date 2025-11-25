import { Module } from '@nestjs/common';
import { WasteLogsService } from './waste-logs.service';
import { WasteLogsController } from './waste-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsService } from '../points/points.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
  ],
  controllers: [WasteLogsController],
  providers: [
    WasteLogsService,
    PointsService, // Provide directly instead of via module (Bull queue disabled)
  ],
  exports: [WasteLogsService],
})
export class WasteLogsModule {}

