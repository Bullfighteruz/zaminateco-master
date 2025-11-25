import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PointsService, PointsAction } from '../points/points.service';
import { CreateWasteLogDto, UpdateWasteLogStatusDto } from './dto/waste-log.dto';

@Injectable()
export class WasteLogsService {
  constructor(
    private prisma: PrismaService,
    private pointsService: PointsService,
  ) {}

  async create(userId: string, createDto: CreateWasteLogDto) {
    // Create waste log
    const wasteLog = await this.prisma.wasteLog.create({
      data: {
        userId,
        weightKg: createDto.weightKg,
        category: createDto.category,
        location: createDto.location,
        photoURL: createDto.photoURL,
        date: createDto.date ? new Date(createDto.date) : new Date(),
        status: 'SUBMITTED',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Award points for submission (will be adjusted when verified)
    await this.pointsService.awardPoints({
      userId,
      action: PointsAction.WASTE_DROP_OFF,
      points: Math.floor(createDto.weightKg * 10), // 10 points per kg
      metadata: {
        wasteLogId: wasteLog.id,
        weightKg: createDto.weightKg,
        category: createDto.category,
      },
    });

    return wasteLog;
  }

  async findAll(userId?: string, filters?: { status?: string; category?: string; limit?: number; offset?: number }) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.category) {
      where.category = filters.category;
    }

    const [data, total] = await Promise.all([
      this.prisma.wasteLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.wasteLog.count({ where }),
    ]);

    return {
      data,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  async findOne(id: string) {
    const wasteLog = await this.prisma.wasteLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!wasteLog) {
      throw new NotFoundException('Waste log not found');
    }

    return wasteLog;
  }

  async updateStatus(id: string, updateDto: UpdateWasteLogStatusDto, verifiedBy?: string) {
    const wasteLog = await this.prisma.wasteLog.findUnique({
      where: { id },
    });

    if (!wasteLog) {
      throw new NotFoundException('Waste log not found');
    }

    // If verifying, award full points
    if (updateDto.status === 'VERIFIED' && wasteLog.status === 'SUBMITTED') {
      const pointsToAward = Math.floor(wasteLog.weightKg * 10);
      await this.pointsService.awardPoints({
        userId: wasteLog.userId,
        action: PointsAction.WASTE_DROP_OFF,
        points: pointsToAward,
        metadata: {
          wasteLogId: wasteLog.id,
          weightKg: wasteLog.weightKg,
          category: wasteLog.category,
        },
      });
    }

    const updated = await this.prisma.wasteLog.update({
      where: { id },
      data: {
        status: updateDto.status,
        verifiedAt: updateDto.status === 'VERIFIED' ? new Date() : null,
        verifiedById: updateDto.status === 'VERIFIED' && verifiedBy ? verifiedBy : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, byCategory, byStatus] = await Promise.all([
      this.prisma.wasteLog.aggregate({
        where,
        _sum: {
          weightKg: true,
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.wasteLog.groupBy({
        by: ['category'],
        where,
        _sum: {
          weightKg: true,
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.wasteLog.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      totalWeight: total._sum.weightKg || 0,
      totalLogs: total._count.id || 0,
      byCategory: byCategory.map(item => ({
        category: item.category,
        weight: item._sum.weightKg || 0,
        count: item._count.id || 0,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.id || 0,
      })),
    };
  }

  async delete(id: string, userId: string) {
    const wasteLog = await this.prisma.wasteLog.findUnique({
      where: { id },
    });

    if (!wasteLog) {
      throw new NotFoundException('Waste log not found');
    }

    if (wasteLog.userId !== userId) {
      throw new BadRequestException('You can only delete your own waste logs');
    }

    await this.prisma.wasteLog.delete({
      where: { id },
    });

    return { success: true };
  }
}

