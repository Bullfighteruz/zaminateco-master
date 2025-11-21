import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class LocationsService {
  constructor(
    private prisma: PrismaService,
    private geoService: GeoService,
  ) {}

  async findAll(filters?: { type?: string; eventType?: string; district?: string }) {
    return this.prisma.actionLocation.findMany({
      where: {
        isActive: true,
        ...filters,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.actionLocation.findUnique({
      where: { id },
    });

    if (location) {
      // Increment views
      await this.prisma.actionLocation.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return location;
  }

  async findByCoordinates(lat: number, lng: number, radius: number = 5) {
    // Use GeoService for accurate distance calculation
    const nearestPoints = await this.geoService.findNearestCollectionPoints(
      lat,
      lng,
      radius,
      50,
    );

    // Get full location details
    const locationIds = nearestPoints.map((p) => p.id);
    return this.prisma.actionLocation.findMany({
      where: {
        id: { in: locationIds },
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

