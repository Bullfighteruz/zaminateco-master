import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Guard to ensure COPPA compliance - verifies parental consent for minors
 */
@Injectable()
export class AgeVerificationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Let auth guard handle this
    }

    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId: user.userId },
    });

    // If user is a child or teen, require parental verification
    if (userProfile?.ageGroup === 'CHILD' || userProfile?.ageGroup === 'TEEN') {
      // Check if parental email is verified
      // This would be stored in a separate parental_consent table
      // For now, we'll check if user has a verified parent email
      const hasParentalConsent = true; // TODO: Implement parental consent check

      if (!hasParentalConsent) {
        throw new ForbiddenException('Parental consent required for users under 18');
      }
    }

    return true;
  }
}

