import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CollectionsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async getCollectionPoints(filters: {
    materialType?: string;
    district?: string;
    status?: string;
    limit?: number;
  }) {
    const where: any = {
      isActive: filters.status !== 'inactive',
    };

    if (filters.district) {
      where.district = filters.district;
    }

    if (filters.materialType) {
      where.materialTypes = {
        array_contains: [filters.materialType],
      };
    }

    const points = await this.prisma.collectionPoint.findMany({
      where,
      include: {
        stats: true,
        _count: {
          select: {
            collections: true,
          },
        },
      },
      take: filters.limit || 100,
      orderBy: { createdAt: 'desc' },
    });

    return points;
  }

  async getCollectionPointById(id: string) {
    const point = await this.prisma.collectionPoint.findUnique({
      where: { id },
      include: {
        stats: true,
        _count: {
          select: {
            collections: true,
          },
        },
      },
    });

    if (!point) {
      throw new NotFoundException('Collection point not found');
    }

    return point;
  }

  async createCollectionPoint(data: any, userId: string) {
    return this.prisma.collectionPoint.create({
      data: {
        ...data,
        createdById: userId,
      },
    });
  }

  async createCollection(data: {
    collectionPointId: string;
    materialType: string;
    weightKg: number;
    photoUrl?: string;
  }, userId: string) {
    // Verify collection point exists
    const point = await this.prisma.collectionPoint.findUnique({
      where: { id: data.collectionPointId },
    });

    if (!point) {
      throw new NotFoundException('Collection point not found');
    }

    // Create collection record
    const collection = await this.prisma.collection.create({
      data: {
        ...data,
        userId,
      },
    });

    // Update collection point stats
    await this.prisma.collectionPointStats.upsert({
      where: { collectionPointId: data.collectionPointId },
      update: {
        totalKg: { increment: data.weightKg },
        totalCollections: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        collectionPointId: data.collectionPointId,
        totalKg: data.weightKg,
        totalCollections: 1,
      },
    });

    // Award eco points (1 point per kg)
    const points = Math.floor(data.weightKg);
    await this.usersService.addEcoPoints(userId, points);

    return collection;
  }

  async getUserCollections(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      include: {
        collectionPoint: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async approveCollection(collectionId: string, verifiedById: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.approved) {
      throw new BadRequestException('Collection already approved');
    }

    return this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        approved: true,
        verifiedById,
        verifiedAt: new Date(),
      },
    });
  }
}

