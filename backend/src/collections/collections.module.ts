import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { CollectionPointsController } from './collection-points.controller';

@Module({
  controllers: [CollectionsController, CollectionPointsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}

