import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(period: string = 'all', limit: number = 100) {
    // Get top users by eco points
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        ecoPoints: 'desc',
      },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        ecoPoints: true,
        level: true,
        district: true,
        school: true,
      },
    });

    // Update leaderboard entries
    for (let i = 0; i < users.length; i++) {
      await this.prisma.leaderboardEntry.upsert({
        where: { userId: users[i].id },
        update: {
          rank: i + 1,
          points: users[i].ecoPoints,
          period,
        },
        create: {
          userId: users[i].id,
          rank: i + 1,
          points: users[i].ecoPoints,
          period,
        },
      });
    }

    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }
}

