import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [PrismaModule, GeoModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}

