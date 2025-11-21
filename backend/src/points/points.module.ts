import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { BullModule } from '@nestjs/bull';
import { PointsProcessor } from './points.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'points',
    }),
  ],
  controllers: [PointsController],
  providers: [PointsService, PointsProcessor],
  exports: [PointsService],
})
export class PointsModule {}

