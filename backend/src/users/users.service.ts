import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            community: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        settings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateData: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        profile: true,
      },
    });

    return this.sanitizeUser(user);
  }

  async updateUserProfile(userId: string, profileData: any) {
    // Ensure profile exists
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        ...profileData,
        referralCode: this.generateReferralCode(),
      },
    });

    return profile;
  }

  async addEcoPoints(userId: string, points: number) {
    // Update user profile points
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ecoPoints: {
          increment: points,
        },
      },
      create: {
        userId,
        ecoPoints: points,
        referralCode: this.generateReferralCode(),
      },
    });

    // Update level based on points
    const newLevel = Math.floor(profile.ecoPoints / 1000) + 1;
    if (newLevel > profile.level) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    return profile;
  }

  async addEcoCoins(userId: string, coins: number) {
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ecoCoins: {
          increment: coins,
        },
      },
      create: {
        userId,
        ecoCoins: coins,
        referralCode: this.generateReferralCode(),
      },
    });

    return profile;
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

