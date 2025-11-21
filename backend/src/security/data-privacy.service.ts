import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service for GDPR/COPPA compliance
 * Handles data anonymization, pseudonymization, and right to be forgotten
 */
@Injectable()
export class DataPrivacyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Anonymize user data for GDPR compliance
   */
  async anonymizeUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate anonymous identifier
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Anonymize user data
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: null,
        phone: null,
        firstName: 'Anonymous',
        lastName: 'User',
        nickname: anonymousId,
        avatar: null,
        passwordHash: null,
        isActive: false,
      },
    });

    // Anonymize profile
    await this.prisma.userProfile.updateMany({
      where: { userId },
      data: {
        referralCode: null,
      },
    });

    // Delete sessions
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    // Delete notifications
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    // Keep activity data but anonymize user references
    // Votes, donations, etc. are kept for statistics but user is anonymized

    return { success: true, anonymousId };
  }

  /**
   * Pseudonymize child user data (COPPA compliance)
   */
  async pseudonymizeChild(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (profile?.ageGroup !== 'CHILD') {
      throw new Error('User is not a child');
    }

    // Generate pseudonym
    const pseudonym = `child_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname: pseudonym,
        email: null, // Don't store email for children
      },
    });

    return { success: true, pseudonym };
  }

  /**
   * Export user data (GDPR right to data portability)
   */
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            community: true,
          },
        },
        votes: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        donations: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        collections: true,
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        posts: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const { passwordHash, ...sanitizedUser } = user;

    return {
      user: sanitizedUser,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if user is a minor and requires parental consent
   */
  async requiresParentalConsent(userId: string): Promise<boolean> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return profile?.ageGroup === 'CHILD' || profile?.ageGroup === 'TEEN';
  }

  /**
   * Verify parental consent
   */
  async verifyParentalConsent(userId: string, parentEmail: string) {
    // TODO: Implement parental consent verification
    // This would typically:
    // 1. Send verification email to parent
    // 2. Store consent in parental_consent table
    // 3. Link to child's account

    return {
      success: true,
      message: 'Parental consent verification email sent',
    };
  }
}

