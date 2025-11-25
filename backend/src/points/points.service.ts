import { Injectable, Optional } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

export enum PointsAction {
  WASTE_DROP_OFF = 'waste_drop_off',
  VOTE = 'vote',
  JOIN_EVENT = 'join_event',
  REFERRAL = 'referral',
  DONATION = 'donation',
  STORY_PUBLISHED = 'story_published',
  DAILY_LOGIN = 'daily_login',
}

export interface PointsAward {
  userId: string;
  action: PointsAction;
  points: number;
  metadata?: any;
}

@Injectable()
export class PointsService {
  private readonly multipliers: Record<PointsAction, number> = {
    [PointsAction.WASTE_DROP_OFF]: 1, // 1 point per kg
    [PointsAction.VOTE]: 10,
    [PointsAction.JOIN_EVENT]: 25,
    [PointsAction.REFERRAL]: 50,
    [PointsAction.DONATION]: 0.001, // 1 point per 1000 UZS
    [PointsAction.STORY_PUBLISHED]: 30,
    [PointsAction.DAILY_LOGIN]: 5,
  };

  constructor(
    // @InjectQueue('points') @Optional() private pointsQueue?: Queue,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  /**
   * Award points asynchronously via queue
   */
  async awardPoints(award: PointsAward) {
    const basePoints = this.multipliers[award.action] || 0;
    let finalPoints = basePoints;

    // Apply multipliers based on action
    if (award.action === PointsAction.WASTE_DROP_OFF && award.metadata?.weightKg) {
      finalPoints = Math.floor(award.metadata.weightKg * basePoints);
    } else if (award.action === PointsAction.DONATION && award.metadata?.amount) {
      finalPoints = Math.floor(Number(award.metadata.amount) * basePoints);
    }

    // Add to queue for async processing
    await this.pointsQueue.add('award', {
      userId: award.userId,
      action: award.action,
      points: finalPoints,
      metadata: award.metadata,
    });

    return { queued: true, points: finalPoints };
  }

  /**
   * Process points award (called by queue worker)
   */
  async processPointsAward(userId: string, points: number, action: PointsAction) {
    // Update user profile points
    const profile = await this.usersService.addEcoPoints(userId, points);

    // Check for level up
    await this.checkLevelUp(userId, profile.ecoPoints);

    // Check for achievements
    await this.checkAchievements(userId, action);

    // Create notification
    await this.createPointsNotification(userId, points, action);

    return profile;
  }

  /**
   * Check and update user level
   */
  private async checkLevelUp(userId: string, totalPoints: number) {
    const newLevel = Math.floor(totalPoints / 1000) + 1;
    
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (profile && newLevel > profile.level) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: { level: newLevel },
      });

      // Create level up notification
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Level Up!',
          message: `Congratulations! You've reached level ${newLevel}!`,
        },
      });
    }
  }

  /**
   * Check and award achievements
   */
  private async checkAchievements(userId: string, action: PointsAction) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
        collections: true,
        votes: true,
        events: true,
      },
    });

    if (!user || !user.profile) return;

    // Get all active achievements
    const achievements = await this.prisma.achievement.findMany({
      where: { isActive: true },
    });

    for (const achievement of achievements) {
      // Skip if already earned
      const hasAchievement = user.achievements.some(
        (ua) => ua.achievementId === achievement.id
      );
      if (hasAchievement) continue;

      // Check criteria
      const criteria = achievement.criteria as any;
      let meetsCriteria = true;

      if (criteria.totalKgs && user.profile.ecoPoints < criteria.totalKgs) {
        meetsCriteria = false;
      }

      if (criteria.eventsAttended && user.events.length < criteria.eventsAttended) {
        meetsCriteria = false;
      }

      if (criteria.votesCast && user.votes.length < criteria.votesCast) {
        meetsCriteria = false;
      }

      if (criteria.collectionsMade && user.collections.length < criteria.collectionsMade) {
        meetsCriteria = false;
      }

      if (meetsCriteria) {
        // Award achievement
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        // Create notification
        await this.prisma.notification.create({
          data: {
            userId,
            type: 'ACHIEVEMENT_UNLOCKED',
            title: 'Achievement Unlocked!',
            message: `You've earned the "${achievement.name}" achievement!`,
          },
        });
      }
    }
  }

  /**
   * Create points notification
   */
  private async createPointsNotification(
    userId: string,
    points: number,
    action: PointsAction
  ) {
    const actionNames: Record<PointsAction, string> = {
      [PointsAction.WASTE_DROP_OFF]: 'Waste Drop-off',
      [PointsAction.VOTE]: 'Voting',
      [PointsAction.JOIN_EVENT]: 'Event Participation',
      [PointsAction.REFERRAL]: 'Referral',
      [PointsAction.DONATION]: 'Donation',
      [PointsAction.STORY_PUBLISHED]: 'Story Published',
      [PointsAction.DAILY_LOGIN]: 'Daily Login',
    };

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'POINTS_EARNED',
        title: 'Points Earned!',
        message: `You earned ${points} eco-points for ${actionNames[action]}`,
      },
    });
  }

  /**
   * Get points history for user
   */
  async getPointsHistory(userId: string, limit: number = 50) {
    // This would ideally be stored in a separate points_history table
    // For now, we'll return recent activities that earned points
    const [collections, votes, events, donations] = await Promise.all([
      this.prisma.collection.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          weightKg: true,
          submittedAt: true,
          materialType: true,
        },
      }),
      this.prisma.vote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          project: {
            select: {
              title: true,
            },
          },
        },
      }),
      this.prisma.eventParticipant.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      }),
      this.prisma.donation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          amount: true,
          currency: true,
          createdAt: true,
          project: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    return {
      collections: collections.map((c) => ({
        type: 'waste_drop_off',
        points: Math.floor(c.weightKg),
        date: c.submittedAt,
        description: `${c.weightKg}kg ${c.materialType}`,
      })),
      votes: votes.map((v) => ({
        type: 'vote',
        points: 10,
        date: v.createdAt,
        description: `Voted for ${v.project.title}`,
      })),
      events: events.map((e) => ({
        type: 'join_event',
        points: 25,
        date: e.createdAt,
        description: `Joined ${e.event.title}`,
      })),
      donations: donations.map((d) => ({
        type: 'donation',
        points: Math.floor(Number(d.amount) / 1000),
        date: d.createdAt,
        description: `Donated ${d.amount} ${d.currency} to ${d.project.title}`,
      })),
    };
  }
}

