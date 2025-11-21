import { Module } from '@nestjs/common';
import { WasteLogsService } from './waste-logs.service';
import { WasteLogsController } from './waste-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [PrismaModule, PointsModule],
  controllers: [WasteLogsController],
  providers: [WasteLogsService],
  exports: [WasteLogsService],
})
export class WasteLogsModule {}

